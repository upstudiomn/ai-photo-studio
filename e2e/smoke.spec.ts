import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const TEST_IMAGE_PATH = path.resolve(process.cwd(), "test-fixtures/test-image.png");
const UPLOAD_ROOT = path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? "./uploads");

type CountRow = { count: string };
type IdRow = { id: string };
type ImagePathRow = { file_path: string | null };
type OutputPathRow = { preview_url: string | null; watermarked_url: string | null };
type SessionTemplateRow = { status: string; template_id: string | null };

function getLocalDatabaseUrl() {
  const databaseUrl = process.env.LOCAL_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing LOCAL_DATABASE_URL. Playwright local smoke test requires local DB mode.");
  }

  return databaseUrl;
}

async function withDb<T>(callback: (pool: Pool) => Promise<T>) {
  const pool = new Pool({ connectionString: getLocalDatabaseUrl() });

  try {
    return await callback(pool);
  } finally {
    await pool.end();
  }
}

async function countRows(pool: Pool, table: string, whereSql: string, values: unknown[]) {
  const result = await pool.query<CountRow>(`select count(*)::text as count from ${table} ${whereSql}`, values);
  return Number(result.rows[0]?.count ?? 0);
}

async function getLatestOrderIdForSession(pool: Pool, sessionId: string) {
  const result = await pool.query<IdRow>(
    "select id from orders where session_id = $1 order by created_at desc limit 1",
    [sessionId],
  );
  return result.rows[0]?.id ?? null;
}

function localUploadPath(relativeOrPublicPath: string) {
  const relativePath = relativeOrPublicPath.replace(/^\/uploads\//, "");
  return path.join(UPLOAD_ROOT, relativePath);
}

function expectLocalFile(relativeOrPublicPath: string | null | undefined) {
  expect(relativeOrPublicPath, "Expected a local storage path").toBeTruthy();
  expect(fs.existsSync(localUploadPath(relativeOrPublicPath!)), `Missing file: ${relativeOrPublicPath}`).toBe(true);
}

test("local preview-first flow uses browser UI and creates order only after checkout", async ({ page }) => {
  expect(fs.existsSync(TEST_IMAGE_PATH), `Missing test image fixture: ${TEST_IMAGE_PATH}`).toBe(true);

  let sessionId = "";
  let outputId = "";

  await page.goto("/");
  await page.getByRole("link", { name: /upload photo/i }).first().click();
  await expect(page).toHaveURL(/\/create/);
  await expect(page.getByRole("heading", { name: "Upload Photo" })).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles(TEST_IMAGE_PATH);
  await expect(page.getByText("test-image.png")).toBeVisible();
  await page.locator('input[name="consent"]').check();
  await page.getByRole("button", { name: /Next step/i }).click();

  await expect(page).toHaveURL(/\/create\/template\?sessionId=/);
  sessionId = new URL(page.url()).searchParams.get("sessionId") ?? "";
  expect(sessionId, "Session ID should be created after upload").toBeTruthy();
  expect(sessionId).not.toBe("demo-session-001");

  await expect(page.getByRole("heading", { name: /Choose AI template/i })).toBeVisible();
  await page
    .locator("article")
    .filter({ hasText: "Old Photo Restoration" })
    .getByRole("button", { name: /Continue with this template/i })
    .click();

  await expect(page).toHaveURL(new RegExp(`/generate/${sessionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  await withDb(async (pool) => {
    const session = await pool.query<SessionTemplateRow>(
      "select status, template_id from generation_sessions where id = $1",
      [sessionId],
    );

    expect(session.rows[0]?.status).toBe("template_selected");
    expect(session.rows[0]?.template_id).toBeTruthy();
  });
  await expect(page.getByRole("heading", { name: /Creating AI preview/i })).toBeVisible();
  await page.getByRole("button", { name: /Generate preview/i }).click();

  await expect(page).toHaveURL(new RegExp(`/results/${sessionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  await expect(page.getByRole("heading", { name: /AI preview ready/i })).toBeVisible();

  outputId = new URL(page.url()).searchParams.get("output") ?? "";

  await withDb(async (pool) => {
    const outputs = await pool.query<IdRow>(
      "select id from generated_outputs where session_id = $1 order by created_at desc limit 1",
      [sessionId],
    );
    outputId = outputId || outputs.rows[0]?.id || "";

    expect(await countRows(pool, "generation_sessions", "where id = $1", [sessionId])).toBe(1);
    expect(await countRows(pool, "uploaded_images", "where session_id = $1", [sessionId])).toBeGreaterThan(0);
    expect(await countRows(pool, "generated_outputs", "where session_id = $1", [sessionId])).toBeGreaterThan(0);
    expect(await countRows(pool, "orders", "where session_id = $1", [sessionId])).toBe(0);
    expect(await countRows(pool, "order_items", "where order_id in (select id from orders where session_id = $1)", [sessionId])).toBe(0);
    expect(await countRows(pool, "payments", "where order_id in (select id from orders where session_id = $1)", [sessionId])).toBe(0);
    expect(await countRows(pool, "print_jobs", "where order_id in (select id from orders where session_id = $1)", [sessionId])).toBe(0);

    const sourceImage = await pool.query<ImagePathRow>(
      "select file_path from uploaded_images where session_id = $1 order by created_at asc limit 1",
      [sessionId],
    );
    expectLocalFile(sourceImage.rows[0]?.file_path);

    const generatedPreview = await pool.query<OutputPathRow>(
      "select preview_url, watermarked_url from generated_outputs where session_id = $1 order by created_at desc limit 1",
      [sessionId],
    );
    expectLocalFile(generatedPreview.rows[0]?.watermarked_url ?? generatedPreview.rows[0]?.preview_url);
  });

  expect(outputId, "Generated output ID should be available before checkout").toBeTruthy();

  await page.getByRole("link", { name: /Confirm selection/i }).click();
  await expect(page).toHaveURL(new RegExp(`/checkout/${sessionId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
  await expect(page.getByRole("heading", { name: /Confirm your selection/i })).toBeVisible();

  await withDb(async (pool) => {
    expect(await countRows(pool, "orders", "where session_id = $1", [sessionId])).toBe(0);
  });

  await page.getByRole("button", { name: /Confirm Order/i }).click();
  await expect(page).toHaveURL(/\/orders\/[^/]+$/);
  await expect(page.getByRole("heading", { name: /Order Status/i })).toBeVisible();

  const orderId = page.url().match(/\/orders\/([^/]+)$/)?.[1] ?? "";
  expect(orderId, "Order ID should be present after checkout submit").toBeTruthy();

  await withDb(async (pool) => {
    expect(await getLatestOrderIdForSession(pool, sessionId)).toBe(orderId);
    expect(await countRows(pool, "orders", "where id = $1 and session_id = $2", [orderId, sessionId])).toBe(1);
    expect(await countRows(pool, "order_items", "where order_id = $1", [orderId])).toBeGreaterThan(0);
    expect(await countRows(pool, "payments", "where order_id = $1", [orderId])).toBeGreaterThan(0);
    expect(await countRows(pool, "print_jobs", "where order_id = $1", [orderId])).toBeGreaterThan(0);
  });
});
