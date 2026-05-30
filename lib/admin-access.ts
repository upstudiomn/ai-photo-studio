const ADMIN_ROLES = new Set(["admin", "owner", "super_admin"]);

export function parseAdminEmails(value: string | undefined) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminRole(role: string | null | undefined) {
  return ADMIN_ROLES.has((role ?? "").trim().toLowerCase());
}

export function isEmailAllowedAdmin(email: string | null | undefined, allowlist: Set<string>) {
  if (!email) {
    return false;
  }

  return allowlist.has(email.trim().toLowerCase());
}
