import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { Pool } from "pg";
import {
  assertE2EAdminIsNotProductionAdmin,
  DEFAULT_E2E_ADMIN_EMAIL,
  normalizeAdminEmail,
} from "./admin-credential-guards";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const DEFAULT_E2E_ADMIN_PASSWORD = "123456";
const OWNER_ROLES = new Set(["owner", "super_admin"]);

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function preserveAdminRole(role?: string | null) {
  const normalized = role?.trim().toLowerCase();
  return normalized && OWNER_ROLES.has(normalized) ? normalized : "admin";
}

function getLocalDevAdminCredentials() {
  return {
    email: normalizeAdminEmail(process.env.E2E_ADMIN_EMAIL) || DEFAULT_E2E_ADMIN_EMAIL,
    password: process.env.E2E_ADMIN_PASSWORD?.trim() || DEFAULT_E2E_ADMIN_PASSWORD,
  };
}

async function ensureSupabaseAdmin(email: string, password: string) {
  const supabase = createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (usersError) {
    throw usersError;
  }

  const existingUser = usersData.users.find((user) => user.email?.toLowerCase() === email);
  const userResult = existingUser
    ? await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
      })
    : await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: "Admin",
          last_name: "User",
          role: "admin",
        },
      });

  if (userResult.error) {
    throw userResult.error;
  }

  const user = userResult.data.user;

  if (!user) {
    throw new Error("Supabase Auth did not return an admin user.");
  }

  const { data: existingProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileReadError) {
    throw profileReadError;
  }

  const role = preserveAdminRole(existingProfile?.role);
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      first_name: "Admin",
      last_name: "User",
      full_name: "Admin User",
      email,
      phone: null,
      role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  return { id: user.id, role, existed: Boolean(existingUser) };
}

async function ensureLocalAdminProfile(userId: string, email: string, roleFromSupabase: string) {
  if (process.env.DATABASE_MODE !== "local") {
    console.log("Local DB profile skipped because DATABASE_MODE is not local.");
    return;
  }

  const databaseUrl = process.env.LOCAL_DATABASE_URL;

  if (!databaseUrl) {
    console.log("Local DB profile skipped because LOCAL_DATABASE_URL is missing.");
    return;
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const table = await pool.query<{ exists: boolean }>(
      "select to_regclass('public.profiles') is not null as exists",
    );

    if (!table.rows[0]?.exists) {
      console.log("Local DB profile skipped because profiles table does not exist.");
      return;
    }

    const role = preserveAdminRole(roleFromSupabase);

    try {
      await pool.query(
        `
          insert into profiles (id, first_name, last_name, full_name, email, phone, role)
          values ($1, 'Admin', 'User', 'Admin User', $2, null, $3)
          on conflict (id) do update set
            first_name = excluded.first_name,
            last_name = excluded.last_name,
            full_name = excluded.full_name,
            email = excluded.email,
            phone = excluded.phone,
            role = case
              when profiles.role in ('owner', 'super_admin') then profiles.role
              else excluded.role
            end,
            updated_at = now()
        `,
        [userId, email, role],
      );
      return;
    } catch (error) {
      if ((error as { code?: string }).code !== "23505") {
        throw error;
      }
    }

    await pool.query(
      `
        update profiles set
          id = $1,
          first_name = 'Admin',
          last_name = 'User',
          full_name = 'Admin User',
          phone = null,
          role = case
            when role in ('owner', 'super_admin') then role
            else $3
          end,
          updated_at = now()
        where lower(email) = lower($2)
      `,
      [userId, email, role],
    );
  } finally {
    await pool.end();
  }
}

async function main() {
  const { email, password } = getLocalDevAdminCredentials();

  assertE2EAdminIsNotProductionAdmin({
    e2eAdminEmail: email,
    productionAdminEmail: process.env.PRODUCTION_ADMIN_EMAIL,
  });

  console.log("Ensuring local/dev default admin account...");
  console.log(`Email: ${email}`);
  console.log("Warning: default password is for local/dev only. Never use it for production admin accounts.");

  const admin = await ensureSupabaseAdmin(email, password);
  await ensureLocalAdminProfile(admin.id, email, admin.role);

  console.log(`Supabase Auth user: ${admin.existed ? "updated" : "created"}`);
  console.log(`Profile role: ${admin.role}`);
  console.log("Default admin setup complete.");
}

main().catch((error) => {
  console.error("Default admin setup failed.");
  console.error(error);
  process.exit(1);
});
