# Privacy and Safety

## Current implementation status

- Upload validation exists for common image types and size limits.
- Local uploads are served from `/uploads` in local storage mode.
- Path traversal is guarded in the upload route, but file serving and retention should be reviewed before launch.
- Service role usage should remain server-only.
- Admin access/role gate is implemented for `/admin/*` pages and admin mutation endpoints.
- Authorized admin Playwright E2E verifies seeded local/dev admin login, server-authorized admin mutations, customer-role blocking, and logged-out blocking.
- Local/dev default admin setup exists through `npm run setup:admin`.
- Production admin setup exists through `npm run setup:production-admin` and reads credentials from server-side env variables only.
- Production admin browser smoke exists through `npm run test:production-admin` and verifies read-only admin access without touching local/dev E2E credentials.
- Local/dev E2E admin credentials and production admin credentials are separated by a fail-fast guard before any user mutation.
- Face-sensitive services still require admin review before final delivery.

## Core privacy promise
Customer photos are private and used only to generate the selected AI photo service.

## Upload consent
Required checkbox:

> I have the right to use this photo and consent to AI processing for my preview/order.

## User rules
Users must not upload:
- Photos they do not have permission to use
- Illegal or harmful content
- Explicit sexual content
- Exploitative images of children
- Identity fraud or impersonation requests
- Political deception or misleading public figure content

## Children images
Allowed only for safe family-friendly products:
- Kids storybook poster
- Birthday poster
- Family print

Not allowed:
- Sexualized child images
- Adult-style transformation of children
- Harmful or humiliating edits

## Face and identity disclaimer
Use this text:

> AI results are generated from the reference photo. We aim to preserve identity and facial features, but AI results are not guaranteed to be 100% identical. Premium orders require admin quality review.

## Data retention
MVP rule:
- Uploaded source images kept for order fulfillment
- Customer can request deletion
- Delete completed order files after 30 days if needed

## Admin access
Only authorized admin users can view uploaded photos and generated outputs.

Implementation:

- Authenticated Supabase user required.
- `profiles.role` must be `admin`, `owner`, or `super_admin`, unless the user email is listed in server-only `ADMIN_EMAILS`.
- Admin mutation endpoints return 401/403 when unauthorized.
- Local/dev E2E admin setup uses `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` and must not contain production credentials.
- Local/dev default E2E admin is `e2e-admin@uuree.mn` with password `123456`.
- `E2E_ADMIN_EMAIL` must differ from `PRODUCTION_ADMIN_EMAIL`; matching values fail before Supabase Auth or profile mutation.
- The default E2E password must never be used for production and must not be documented as production-safe.
- Real production admin setup uses `PRODUCTION_ADMIN_EMAIL`, `PRODUCTION_ADMIN_PASSWORD`, and optional `PRODUCTION_ADMIN_ROLE`.
- Production setup rejects weak passwords such as `123456` and requires a password of at least 10 characters.
- Production admin browser smoke uses only `PRODUCTION_ADMIN_EMAIL` and `PRODUCTION_ADMIN_PASSWORD`; it does not use `E2E_ADMIN_EMAIL`, does not reset passwords, and does not run admin mutations.
- `SUPABASE_SERVICE_ROLE_KEY` must remain server-side and should only be used by trusted server scripts/helpers.

Remaining security debt:

- Run and verify production admin setup with real strong credentials before launch.
- Review Supabase RLS policies for production admin reads/writes.
- Review local upload serving and retention policy before launch.

## Watermark rule
Preview images must include watermark. Final paid files must not include watermark.
