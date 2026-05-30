export const ADMIN_CREDENTIAL_SEPARATION_ERROR =
  "E2E_ADMIN_EMAIL must differ from PRODUCTION_ADMIN_EMAIL to avoid resetting production admin credentials.";

export const DEFAULT_E2E_ADMIN_EMAIL = "e2e-admin@uuree.mn";

export function normalizeAdminEmail(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

export function assertE2EAdminIsNotProductionAdmin(input: {
  e2eAdminEmail?: string | null;
  productionAdminEmail?: string | null;
}) {
  const e2eAdminEmail = normalizeAdminEmail(input.e2eAdminEmail);
  const productionAdminEmail = normalizeAdminEmail(input.productionAdminEmail);

  if (e2eAdminEmail && productionAdminEmail && e2eAdminEmail === productionAdminEmail) {
    throw new Error(ADMIN_CREDENTIAL_SEPARATION_ERROR);
  }
}
