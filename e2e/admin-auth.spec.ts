import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import { Pool } from "pg";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

type CountRow = { count: string };

async function withDb<T>(callback: (pool: Pool) => Promise<T>) {
  const databaseUrl = process.env.LOCAL_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing LOCAL_DATABASE_URL. Signup UI smoke requires local DB mode.");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    return await callback(pool);
  } finally {
    await pool.end();
  }
}

test.describe("admin auth gate", () => {
  test("blocks logged-out admin pages and mutation endpoints", async ({ page, request }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login/);

    const statusResponse = await request.post("/api/admin/update-status", {
      data: {
        type: "order",
        orderId: "00000000-0000-0000-0000-000000000000",
        status: "paid",
      },
    });
    expect(statusResponse.status()).toBe(401);

    const noteResponse = await request.post("/api/admin/add-note", {
      data: {
        orderId: "00000000-0000-0000-0000-000000000000",
        note: "Blocked unauthenticated smoke note",
      },
    });
    expect(noteResponse.status()).toBe(401);
  });

  test("keeps public create flow accessible", async ({ page }) => {
    await page.goto("/create");
    await expect(page.getByRole("heading", { name: /upload photo/i })).toBeVisible();
  });

  test("customer signup works through the browser UI in local mode", async ({ page }) => {
    const stamp = Date.now();
    const email = `signup-${stamp}@example.com`;
    const phone = `88${String(stamp).slice(-6)}`;

    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await page.locator('input[name="firstName"]').fill("Signup");
    await page.locator('input[name="lastName"]').fill("Smoke");
    await page.locator('input[name="phone"]').fill(phone);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill("SignupSmoke123!");
    await page.getByRole("button", { name: /Create Account/i }).click();

    await expect(page).toHaveURL(/\/create\?auth=signed-up/);
    await expect(page.getByRole("heading", { name: /Upload Photo/i })).toBeVisible();

    await withDb(async (pool) => {
      const result = await pool.query<CountRow>(
        "select count(*)::text as count from profiles where lower(email) = lower($1) and phone = $2",
        [email, phone],
      );

      expect(Number(result.rows[0]?.count ?? 0)).toBe(1);
    });
  });
});
