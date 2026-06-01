import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/server/db/database-repo";
import type { Database } from "@/types/database";

export type CustomerSignUpInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
};

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

function normalizePhone(phone: string) {
  return phone.trim().replace(/\s+/g, "");
}

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return data.user;
  } catch (error) {
    console.warn("Supabase auth is not available.", error);
    return null;
  }
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return db.getProfileById(user.id);
}

export async function upsertCustomerProfile(input: ProfileInsert) {
  return db.upsertProfile({
    ...input,
    role: input.role ?? "customer",
  });
}

export async function phoneExists(phone: string) {
  return Boolean(await db.getProfileByPhone(normalizePhone(phone)));
}

export async function signUpCustomer(input: CustomerSignUpInput) {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const phone = normalizePhone(input.phone);
  const email = input.email.trim().toLowerCase();
  const profileInput: ProfileInsert = {
    id: "",
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`.trim(),
    phone,
    email,
    role: "customer",
  };

  const admin = createSupabaseAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      phone,
    },
  });

  if (createError) {
    throw createError;
  }

  if (!created.user) {
    throw new Error("Supabase Auth did not return a created user.");
  }

  await upsertCustomerProfile({
    ...profileInput,
    id: created.user.id,
  });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function loginWithEmailOrPhone(identifier: string, password: string) {
  const supabase = await createSupabaseServerClient();
  const trimmedIdentifier = identifier.trim();
  let email = trimmedIdentifier.toLowerCase();

  if (!trimmedIdentifier.includes("@")) {
    const profile = await db.getProfileByPhone(normalizePhone(trimmedIdentifier));

    if (!profile?.email) {
      throw new Error("Invalid credentials");
    }

    email = profile.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Invalid credentials");
  }

  return data;
}

export async function logoutUser() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.warn("Supabase logout skipped because auth is unavailable.", error);
  }
}
