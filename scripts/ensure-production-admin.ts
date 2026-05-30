import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { Pool } from "pg";
import { assertE2EAdminIsNotProductionAdmin, DEFAULT_E2E_ADMIN_EMAIL } from "./admin-credential-guards";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const ALLOWED_ADMIN_ROLES = new Set(["admin", "owner", "super_admin"]);
const PROTECTED_ROLES = new Set(["owner", "super_admin"]);
const WEAK_PASSWORDS = new Set(["123456", "123456789", "password", "password123", "admin123456", "qwerty12345"]);
const DEFAULT_ROLE = "owner";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}`);
  }

  return value;
}

function getRequestedRole() {
  const rawRole = process.env.PRODUCTION_ADMIN_ROLE?.trim().toLowerCase();
  const roleWasExplicit = Boolean(rawRole);
  const role = rawRole || DEFAULT_ROLE;

  if (!ALLOWED_ADMIN_ROLES.has(role)) {
    throw new Error("PRODUCTION_ADMIN_ROLE must be one of: admin, owner, super_admin.");
  }

  return { role, roleWasExplicit };
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("PRODUCTION_ADMIN_EMAIL must be a valid email address.");
  }
}

function validatePassword(password: string) {
  if (password.length < 10) {
    throw new Error("PRODUCTION_ADMIN_PASSWORD must be at least 10 characters.");
  }

  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    throw new Error("PRODUCTION_ADMIN_PASSWORD is too weak for production.");
  }
}

function resolveAdminRole(existingRole: string | null | undefined, requestedRole: string, roleWasExplicit: boolean) {
  const normalized = existingRole?.trim().toLowerCase();

  if (!roleWasExplicit && normalized && PROTECTED_ROLES.has(normalized)) {
    return normalized;
  }

  return requestedRole;
}

function createSupabaseAdminClient() {
  return createClient(requiredEnv("NEXT_PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function findSupabaseUserByEmail(supabase: ReturnType<typeof createSupabaseAdminClient>, email: string) {
  const normalizedEmail = email.toLowerCase();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });

    if (error) {
      throw error;
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);

    if (user || data.users.length < 1000) {
      return user ?? null;
    }

    page += 1;
  }
}

async function ensureSupabaseAdmin(email: string, password: string, requestedRole: string, roleWasExplicit: boolean) {
  const supabase = createSupabaseAdminClient();
  const existingUser = await findSupabaseUserByEmail(supabase, email);
  const userResult = existingUser
    ? await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
        user_metadata: {
          first_name: "Admin",
          last_name: "Owner",
        },
      })
    : await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: "Admin",
          last_name: "Owner",
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

  const role = resolveAdminRole(existingProfile?.role, requestedRole, roleWasExplicit);
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      first_name: "Admin",
      last_name: "Owner",
      full_name: "Admin Owner",
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

async function ensureLocalAdminProfile(
  userId: string,
  email: string,
  requestedRole: string,
  roleWasExplicit: boolean,
) {
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
    const table = await pool.query<{ exists: boolean }>("select to_regclass('public.profiles') is not null as exists");

    if (!table.rows[0]?.exists) {
      console.log("Local DB profile skipped because profiles table does not exist.");
      return;
    }

    const existingProfile = await pool.query<{ role: string | null }>(
      "select role from profiles where id = $1 or lower(email) = lower($2) limit 1",
      [userId, email],
    );
    const role = resolveAdminRole(existingProfile.rows[0]?.role, requestedRole, roleWasExplicit);

    try {
      await pool.query(
        `
          insert into profiles (id, first_name, last_name, full_name, email, phone, role)
          values ($1, 'Admin', 'Owner', 'Admin Owner', $2, null, $3)
          on conflict (id) do update set
            first_name = excluded.first_name,
            last_name = excluded.last_name,
            full_name = excluded.full_name,
            email = excluded.email,
            phone = excluded.phone,
            role = $4,
            updated_at = now()
        `,
        [userId, email, role, role],
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
          last_name = 'Owner',
          full_name = 'Admin Owner',
          phone = null,
          role = $3,
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
  const email = requiredEnv("PRODUCTION_ADMIN_EMAIL").toLowerCase();
  const password = requiredEnv("PRODUCTION_ADMIN_PASSWORD");
  const { role: requestedRole, roleWasExplicit } = getRequestedRole();

  assertE2EAdminIsNotProductionAdmin({
    e2eAdminEmail: process.env.E2E_ADMIN_EMAIL ?? DEFAULT_E2E_ADMIN_EMAIL,
    productionAdminEmail: email,
  });

  validateEmail(email);
  validatePassword(password);

  console.log("Ensuring production admin account...");
  console.log(`Email: ${email}`);
  console.log(`Requested role: ${requestedRole}`);
  console.log("Warning: use a strong production-only password and keep the service role key server-side.");

  const admin = await ensureSupabaseAdmin(email, password, requestedRole, roleWasExplicit);
  await ensureLocalAdminProfile(admin.id, email, admin.role, roleWasExplicit);

  console.log(`Supabase Auth user: ${admin.existed ? "updated" : "created"}`);
  console.log(`Profile role: ${admin.role}`);
  console.log("Production admin setup complete.");
}

main().catch((error) => {
  console.error("Production admin setup failed.");
  console.error(error);
  process.exit(1);
});
