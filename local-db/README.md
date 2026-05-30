# Local PostgreSQL Setup

Local mode is an alternative backend for faster MVP development and debugging.
It does not replace Supabase support.

Current status:

- Local DB mode is implemented and runtime-smoke tested.
- Local storage mode is implemented and runtime-smoke tested.
- Playwright E2E verifies the local preview-first flow with `AI_PROVIDER=mock`.
- Local and Supabase modes are separate runtime choices; no sync or dual-write is planned.

## 1. Create Database In pgAdmin

Create this database manually:

```text
ai_photo_studio_dev
```

Do not run an app script to create the database.

## 2. Run SQL In This Exact Order

```text
1. local-db/schema.sql
2. local-db/seed_templates.sql
```

## 3. Local `.env.local` Example

Use your own local PostgreSQL password:

```env
DATABASE_MODE=local
STORAGE_MODE=local
LOCAL_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ai_photo_studio_dev
LOCAL_UPLOAD_DIR=./uploads
NEXT_PUBLIC_LOCAL_UPLOAD_BASE_URL=/uploads
```

Supabase Auth can remain configured for login/signup. Local DB mode is currently
for data/session/order/storage development, not full custom password auth.

## 4. Restart

```bash
npm run dev
```

## 5. Test Flow

```text
/create
→ upload
→ /create/template
→ /generate/[sessionId]
→ /results/[sessionId]
→ /checkout/[sessionId]
→ /orders/[orderId]
```

## Local Uploads

Local file storage writes to:

```text
uploads/source-images
uploads/generated-previews
uploads/final-outputs
```

The `uploads/` folder is ignored by git.
