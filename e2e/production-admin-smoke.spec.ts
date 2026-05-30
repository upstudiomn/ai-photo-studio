import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const productionAdminEmail = process.env.PRODUCTION_ADMIN_EMAIL?.trim();
const productionAdminPassword = process.env.PRODUCTION_ADMIN_PASSWORD?.trim();
const isDedicatedProductionAdminRun = process.env.npm_lifecycle_event === "test:production-admin";

async function loginAsProductionAdmin(page: import("@playwright/test").Page) {
  if (!productionAdminEmail || !productionAdminPassword) {
    throw new Error("Missing production admin credentials.");
  }

  await page.goto("/auth/login");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await page.locator('input[name="identifier"]').fill(productionAdminEmail);
  await page.locator('input[name="password"]').fill(productionAdminPassword);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();
  await expect(page).toHaveURL(/\/create\?auth=login/);
}

test.describe("production admin browser smoke", () => {
  test.skip(
    !isDedicatedProductionAdminRun || !productionAdminEmail || !productionAdminPassword,
    "Run npm run test:production-admin with PRODUCTION_ADMIN_EMAIL and PRODUCTION_ADMIN_PASSWORD to execute this smoke test.",
  );

  test("production admin can log in and open protected read-only admin pages", async ({ page }) => {
    await loginAsProductionAdmin(page);

    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /AI photo operations/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recent confirmed orders" })).toBeVisible();

    await page.goto("/admin/templates");
    await expect(page.getByRole("heading", { name: "Templates" })).toBeVisible();
    await expect(page.getByText("Review template prompts")).toBeVisible();

    await page.goto("/admin/orders");
    await expect(page.getByRole("heading", { name: "Orders" })).toBeVisible();
    await expect(page.getByText("This list shows only checkout-confirmed orders.")).toBeVisible();
  });
});
