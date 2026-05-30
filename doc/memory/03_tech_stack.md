# Tech Stack

## Recommended MVP stack
| Layer | Tool |
|---|---|
| Frontend | Next.js + TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui |
| Database | Local PostgreSQL for current development/E2E; Supabase Postgres supported |
| Auth | Supabase Auth |
| Storage | Local uploads for current development/E2E; Supabase Storage supported; Cloudflare R2 later |
| AI image | Mock for local/E2E; Replicate guarded live path; OpenAI later |
| Free testing | Mock provider and safe Replicate metadata validation |
| Payment | Manual bank/QPay first, QPay API later |
| Admin | Custom Next.js admin pages |
| Hosting | Vercel |
| Background jobs | Simple API route first, Inngest/BullMQ later |

## Current MVP mode
For current working version:
- Use `DATABASE_MODE=local` and `STORAGE_MODE=local` for local development and Playwright E2E.
- Use mock AI for no-credit local/E2E tests.
- Keep Supabase supported through mode switches, but do not plan sync/dual-write.
- Use simple server actions or API routes.
- Use manual payment status update in admin.
- Use Replicate only with an image-to-image model that passes the validation guard.
- Use OpenAI later after the preview-first flow stays stable.

## Later upgrades
- Cloudflare R2 for cheaper storage
- Redis + BullMQ or Inngest for queue
- QPay API integration
- Replicate/FLUX models
- Real-ESRGAN or other upscalers
- Face consistency pipeline
- Print-ready file generator
- Automated watermarking

## Environment variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

DATABASE_MODE=supabase
STORAGE_MODE=supabase
LOCAL_DATABASE_URL=
LOCAL_UPLOAD_DIR=./uploads
NEXT_PUBLIC_LOCAL_UPLOAD_BASE_URL=/uploads

OPENAI_API_KEY=
REPLICATE_API_TOKEN=
REPLICATE_IMAGE_MODEL=
AI_PROVIDER=mock

NEXT_PUBLIC_APP_URL=
ADMIN_EMAILS=
PRODUCTION_ADMIN_EMAIL=admin@uuree.mn
PRODUCTION_ADMIN_PASSWORD=
PRODUCTION_ADMIN_ROLE=owner
E2E_ADMIN_EMAIL=e2e-admin@uuree.mn
E2E_ADMIN_PASSWORD=123456

QPAY_CLIENT_ID=
QPAY_CLIENT_SECRET=
QPAY_INVOICE_CODE=
```

## Important rule
Do not hardcode API keys. All secrets must be in `.env.local`.
Do not expose local database credentials to client code.
