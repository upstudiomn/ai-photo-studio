import { z } from "zod";

const envSchema = z.object({
  // Modes
  DATABASE_MODE: z.enum(["supabase", "local"]).default("supabase"),
  STORAGE_MODE: z.enum(["supabase", "local"]).default("supabase"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Local DB/Storage
  LOCAL_DATABASE_URL: z.string().url().optional(),
  LOCAL_UPLOAD_DIR: z.string().default("./uploads"),
  NEXT_PUBLIC_LOCAL_UPLOAD_BASE_URL: z.string().default("/uploads"),

  // AI Providers
  AI_PROVIDER: z.enum(["mock", "openai", "replicate", "gemini"]).default("mock"),
  REPLICATE_API_TOKEN: z.string().optional(),
  REPLICATE_IMAGE_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),

  // Admin
  ADMIN_EMAILS: z.string().optional(),
  PRODUCTION_ADMIN_EMAIL: z.string().email().optional(),
  PRODUCTION_ADMIN_PASSWORD: z.string().optional(),
  PRODUCTION_ADMIN_ROLE: z.string().default("owner"),
  E2E_ADMIN_EMAIL: z.string().email().default("e2e-admin@uuree.mn"),
  E2E_ADMIN_PASSWORD: z.string().default("123456"),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 2),
  );
}

export const env = parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>);
