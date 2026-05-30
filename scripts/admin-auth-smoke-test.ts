import { isAdminRole, isEmailAllowedAdmin, parseAdminEmails } from "../lib/admin-access";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function run() {
  console.log("=== Admin Auth Smoke Test ===");

  const allowlist = parseAdminEmails("owner@example.com, Admin@Example.com");

  assert(!isAdminRole(undefined), "Undefined role must fail closed.");
  assert(!isAdminRole("customer"), "Customer role must not be admin.");
  assert(isAdminRole("admin"), "admin role must be allowed.");
  assert(isAdminRole("owner"), "owner role must be allowed.");
  assert(isAdminRole("super_admin"), "super_admin role must be allowed.");
  assert(isAdminRole(" ADMIN "), "Role normalization failed.");

  assert(!isEmailAllowedAdmin(undefined, allowlist), "Missing email must fail closed.");
  assert(!isEmailAllowedAdmin("customer@example.com", allowlist), "Non-allowlisted email must fail closed.");
  assert(isEmailAllowedAdmin("owner@example.com", allowlist), "Allowlisted email must be allowed.");
  assert(isEmailAllowedAdmin("admin@example.com", allowlist), "Email normalization failed.");

  console.log("Admin auth rule checks: OK");
}

run();
