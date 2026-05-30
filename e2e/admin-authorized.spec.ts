import { expect, test, type Browser, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { Pool } from "pg";
import { assertE2EAdminIsNotProductionAdmin, DEFAULT_E2E_ADMIN_EMAIL } from "../scripts/admin-credential-guards";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const uploadRoot = path.resolve(process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? "./uploads");
const pngFixture = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? DEFAULT_E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "123456";
const customerEmail = process.env.E2E_CUSTOMER_EMAIL ?? "e2e-customer@example.com";
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD ?? "E2eCustomerPassword123!";

type SeededUser = {
  id: string;
  email: string;
};

type SeededOrder = {
  sessionId: string;
  orderId: string;
  paymentId: string;
  printJobId: string;
};

type TemplateRow = {
  id: string;
  slug: string;
  prompt: string;
  title_en: string | null;
  title_mn: string;
};

type CountRow = { count: string };
type StatusRow = { status: string; payment_status?: string };
type IdRow = { id: string };

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}. Authorized admin E2E needs Supabase Auth test setup.`);
  }

  return value;
}

function getLocalDatabaseUrl() {
  return requiredEnv("LOCAL_DATABASE_URL");
}

async function withDb<T>(callback: (pool: Pool) => Promise<T>) {
  const pool = new Pool({ connectionString: getLocalDatabaseUrl() });

  try {
    return await callback(pool);
  } finally {
    await pool.end();
  }
}

async function ensureSupabaseAuthUser(email: string, password: string, role: "admin" | "customer") {
  const supabase = createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const normalizedEmail = email.trim().toLowerCase();
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (usersError) {
    throw usersError;
  }

  const existing = usersData.users.find((user) => user.email?.toLowerCase() === normalizedEmail);
  const userResult = existing
    ? await supabase.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { role },
      })
    : await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { role },
      });

  if (userResult.error) {
    throw userResult.error;
  }

  const user = userResult.data.user;

  if (!user) {
    throw new Error(`Could not create or update test auth user: ${normalizedEmail}`);
  }

  const profile = {
    id: user.id,
    first_name: role === "admin" ? "E2E" : "E2E",
    last_name: role === "admin" ? "Admin" : "Customer",
    full_name: role === "admin" ? "E2E Admin" : "E2E Customer",
    email: normalizedEmail,
    phone: null,
    role,
    updated_at: new Date().toISOString(),
  };

  const { error: profileError } = await supabase.from("profiles").upsert(profile, { onConflict: "id" });

  if (profileError) {
    throw profileError;
  }

  await withDb(async (pool) => {
    await pool.query(
      `
        insert into profiles (id, first_name, last_name, full_name, email, phone, role)
        values ($1, $2, $3, $4, $5, $6, $7)
        on conflict (id) do update set
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          full_name = excluded.full_name,
          email = excluded.email,
          phone = excluded.phone,
          role = excluded.role,
          updated_at = now()
      `,
      [profile.id, profile.first_name, profile.last_name, profile.full_name, profile.email, profile.phone, profile.role],
    );
  });

  return { id: user.id, email: normalizedEmail };
}

async function seedAdminOrder(adminUser: SeededUser): Promise<SeededOrder> {
  await fs.mkdir(path.join(uploadRoot, "source-images", "e2e-admin"), { recursive: true });
  await fs.mkdir(path.join(uploadRoot, "generated-previews", "e2e-admin"), { recursive: true });
  await fs.writeFile(path.join(uploadRoot, "source-images", "e2e-admin", "source.png"), pngFixture);
  await fs.writeFile(path.join(uploadRoot, "generated-previews", "e2e-admin", "preview.png"), pngFixture);

  return withDb(async (pool) => {
    const template = await pool.query<TemplateRow>(
      "select id, slug, prompt, title_en, title_mn from ai_templates where slug = $1 limit 1",
      ["old-photo-restoration"],
    );
    const templateRow = template.rows[0];

    if (!templateRow) {
      throw new Error("Missing old-photo-restoration template. Run local-db/seed_templates.sql first.");
    }

    const session = await pool.query<IdRow>(
      `
        insert into generation_sessions (user_id, template_id, status, customer_note)
        values ($1, $2, 'preview_ready', $3)
        returning id
      `,
      [adminUser.id, templateRow.id, "E2E authorized admin fixture"],
    );
    const sessionId = session.rows[0].id;

    await pool.query(
      `
        insert into uploaded_images (session_id, file_url, file_path, image_type)
        values ($1, $2, $3, 'source')
      `,
      [
        sessionId,
        "/uploads/source-images/e2e-admin/source.png",
        "source-images/e2e-admin/source.png",
      ],
    );

    const output = await pool.query<IdRow>(
      `
        insert into generated_outputs
          (session_id, provider, model, preview_url, watermarked_url, is_selected)
        values ($1, 'mock', 'e2e-admin-fixture', $2, $3, true)
        returning id
      `,
      [
        sessionId,
        "generated-previews/e2e-admin/preview.png",
        "generated-previews/e2e-admin/preview.png",
      ],
    );
    const outputId = output.rows[0].id;

    await pool.query(
      "update generation_sessions set selected_output_id = $2, updated_at = now() where id = $1",
      [sessionId, outputId],
    );

    const order = await pool.query<IdRow>(
      `
        insert into orders
          (user_id, session_id, selected_output_id, status, payment_status, customer_name, customer_phone, customer_email, delivery_address, total_price)
        values ($1, $2, $3, 'pending_payment', 'pending', 'E2E Admin Customer', '+97690000001', $4, 'E2E admin test address', 25000)
        returning id
      `,
      [adminUser.id, sessionId, outputId, adminUser.email],
    );
    const orderId = order.rows[0].id;

    await pool.query(
      `
        insert into order_items (order_id, item_type, title, quantity, unit_price, total_price)
        values ($1, 'digital_plus_print', 'Digital + A4 Print', 1, 25000, 25000)
      `,
      [orderId],
    );

    const payment = await pool.query<IdRow>(
      `
        insert into payments (order_id, provider, amount, currency, status, payment_reference)
        values ($1, 'manual', 25000, 'MNT', 'pending', 'E2E-AUTHORIZED-ADMIN')
        returning id
      `,
      [orderId],
    );

    const printJob = await pool.query<IdRow>(
      `
        insert into print_jobs (order_id, status, print_size, paper_type, delivery_address)
        values ($1, 'print_ready', 'A4', 'premium', 'E2E admin test address')
        returning id
      `,
      [orderId],
    );

    await pool.query(
      "update generation_sessions set converted_order_id = $2, status = 'converted_to_order', updated_at = now() where id = $1",
      [sessionId, orderId],
    );

    return {
      sessionId,
      orderId,
      paymentId: payment.rows[0].id,
      printJobId: printJob.rows[0].id,
    };
  });
}

async function cleanupAdminOrder(seed?: SeededOrder) {
  if (!seed) return;

  await withDb(async (pool) => {
    await pool.query("delete from orders where id = $1", [seed.orderId]);
    await pool.query("delete from generation_sessions where id = $1", [seed.sessionId]);
  });
}

async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.locator('input[name="identifier"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/create\?auth=login/);
}

async function updateStatus(page: Page, currentLabel: string, nextLabel: string) {
  await page.getByRole("button", { name: currentLabel, exact: true }).click();
  await page.getByRole("combobox").filter({ hasText: currentLabel }).click();
  await page.getByRole("option", { name: nextLabel, exact: true }).click();
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/admin/update-status") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: /^Save$/ }).last().click();
  const response = await responsePromise;
  expect(response.ok()).toBe(true);
  const result = await response.json();
  expect(result.success).toBe(true);
  await expect(page.getByText("Updated").last()).toBeVisible();
}

async function countOrders() {
  return withDb(async (pool) => {
    const result = await pool.query<CountRow>("select count(*)::text as count from orders");
    return Number(result.rows[0]?.count ?? 0);
  });
}

async function countAdminNotes(orderId: string, note: string) {
  return withDb(async (pool) => {
    const result = await pool.query<CountRow>(
      "select count(*)::text as count from admin_notes where order_id = $1 and note = $2",
      [orderId, note],
    );
    return Number(result.rows[0]?.count ?? 0);
  });
}

async function expectOrderMutationResults(seed: SeededOrder, beforeOrderCount: number) {
  await withDb(async (pool) => {
    const order = await pool.query<StatusRow>("select status, payment_status from orders where id = $1", [seed.orderId]);
    const payment = await pool.query<StatusRow>("select status from payments where id = $1", [seed.paymentId]);
    const printJob = await pool.query<StatusRow>("select status from print_jobs where id = $1", [seed.printJobId]);
    const notes = await pool.query<CountRow>(
      "select count(*)::text as count from admin_notes where order_id = $1",
      [seed.orderId],
    );

    expect(order.rows[0]?.status).toBe("paid");
    expect(order.rows[0]?.payment_status).toBe("paid");
    expect(payment.rows[0]?.status).toBe("paid");
    expect(printJob.rows[0]?.status).toBe("printing");
    expect(Number(notes.rows[0]?.count ?? 0)).toBeGreaterThan(0);
    expect(await countOrders()).toBe(beforeOrderCount);
  });
}

async function verifyNonAdminBlocked(browser: Browser) {
  const customerPage = await browser.newPage();

  try {
    await login(customerPage, customerEmail, customerPassword);
    await customerPage.goto("/admin");
    await expect(customerPage.getByRole("heading", { name: "Admin access required" })).toBeVisible();
  } finally {
    await customerPage.close();
  }
}

test.describe("authorized admin browser flow", () => {
  let adminUser: SeededUser;
  let seededOrder: SeededOrder | undefined;

  test.beforeAll(async () => {
    assertE2EAdminIsNotProductionAdmin({
      e2eAdminEmail: adminEmail,
      productionAdminEmail: process.env.PRODUCTION_ADMIN_EMAIL,
    });

    adminUser = await ensureSupabaseAuthUser(adminEmail, adminPassword, "admin");
    await ensureSupabaseAuthUser(customerEmail, customerPassword, "customer");
    seededOrder = await seedAdminOrder(adminUser);
  });

  test.afterAll(async () => {
    await cleanupAdminOrder(seededOrder);
  });

  test("admin can log in, use protected admin actions, and public create remains open", async ({ page, browser }) => {
    if (!seededOrder) {
      throw new Error("Missing seeded order.");
    }

    const orderCountBeforeAdminUpdates = await countOrders();
    const noteMarker = `E2E admin note ${Date.now()}`;
    const promptMarker = `E2E_ADMIN_PROMPT_MARKER_${Date.now()}`;

    await login(page, adminEmail, adminPassword);

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /AI photo operations/i })).toBeVisible();

    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(page.getByText("E2E Admin Customer")).toBeVisible();
    await page
      .locator("tr")
      .filter({ hasText: "E2E Admin Customer" })
      .getByRole("link", { name: "Open" })
      .click();

    await expect(page).toHaveURL(new RegExp(`/admin/orders/${seededOrder.orderId}`));
    await expect(page.getByRole("heading", { name: "E2E Admin Customer" })).toBeVisible();

    await updateStatus(page, "Pending payment", "Paid");
    await updateStatus(page, "Pending", "Paid");
    await updateStatus(page, "Print ready", "Printing");

    await page.getByLabel("Add note").fill(noteMarker);
    const noteResponsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/admin/add-note") && response.request().method() === "POST",
    );
    await page.getByRole("button", { name: /Add note/i }).click();
    const noteResponse = await noteResponsePromise;
    expect(noteResponse.ok()).toBe(true);
    expect((await noteResponse.json()).success).toBe(true);
    await expect(page.getByText(noteMarker)).toBeVisible();
    await expect.poll(() => countAdminNotes(seededOrder.orderId, noteMarker)).toBe(1);
    await page.reload();
    await expect(page.getByText(noteMarker)).toBeVisible();

    await page.goto("/admin/templates");
    await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible();
    const templateRow = page.locator("tr").filter({ hasText: "old-photo-restoration" }).first();
    await templateRow.getByRole("button", { name: /Edit prompt/i }).click();

    const promptInput = page.locator('textarea[name="prompt"]');
    await expect(promptInput).toBeVisible();
    const originalPrompt = await promptInput.inputValue();
    const cleanPrompt = originalPrompt.replace(/\n\nE2E_ADMIN_PROMPT_MARKER_\d+/g, "").trimEnd();

    await promptInput.fill(`${cleanPrompt}\n\n${promptMarker}`);
    await page.getByRole("button", { name: /Save changes/i }).click();
    await expect(page.getByText("Prompt saved.")).toBeVisible();

    await page.reload();
    await page.locator("tr").filter({ hasText: "old-photo-restoration" }).first().getByRole("button", { name: /Edit prompt/i }).click();
    await expect(page.locator('textarea[name="prompt"]')).toHaveValue(new RegExp(promptMarker));

    await page.locator('textarea[name="prompt"]').fill(cleanPrompt);
    await page.getByRole("button", { name: /Save changes/i }).click();
    await expect(page.getByText("Prompt saved.")).toBeVisible();

    await page.reload();
    await page.locator("tr").filter({ hasText: "old-photo-restoration" }).first().getByRole("button", { name: /Edit prompt/i }).click();
    await expect(page.locator('textarea[name="prompt"]')).not.toHaveValue(new RegExp(promptMarker));

    await expectOrderMutationResults(seededOrder, orderCountBeforeAdminUpdates);
    await verifyNonAdminBlocked(browser);

    await page.goto("/create");
    await expect(page.getByRole("heading", { name: "Upload Photo" })).toBeVisible();
  });
});
