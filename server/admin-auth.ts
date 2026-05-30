import "server-only";

import { isAdminRole, isEmailAllowedAdmin, parseAdminEmails } from "@/lib/admin-access";
import { getCurrentProfile, getCurrentUser } from "@/server/auth";

export type AdminAuthResult =
  | {
      ok: true;
      userId: string;
      email: string | null;
      role: string | null;
      source: "profile-role" | "email-allowlist";
    }
  | {
      ok: false;
      reason: "unauthenticated" | "forbidden";
    };

export async function getAdminAuth(): Promise<AdminAuthResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, reason: "unauthenticated" };
  }

  const profile = await getCurrentProfile();
  const role = profile?.role ?? null;
  const email = profile?.email ?? user.email ?? null;

  if (isAdminRole(role)) {
    return {
      ok: true,
      userId: user.id,
      email,
      role,
      source: "profile-role",
    };
  }

  if (isEmailAllowedAdmin(email, parseAdminEmails(process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL))) {
    return {
      ok: true,
      userId: user.id,
      email,
      role,
      source: "email-allowlist",
    };
  }

  return { ok: false, reason: "forbidden" };
}

export async function requireAdminAccess() {
  const result = await getAdminAuth();

  if (!result.ok) {
    throw new AdminAuthError(result.reason);
  }

  return result;
}

export class AdminAuthError extends Error {
  constructor(public readonly reason: "unauthenticated" | "forbidden") {
    super(reason === "unauthenticated" ? "Authentication required." : "Admin access required.");
    this.name = "AdminAuthError";
  }
}
