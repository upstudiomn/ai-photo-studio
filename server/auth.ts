import "server-only";
import { isLocalDatabaseMode } from "@/lib/db/mode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createLocalProfile,
  getLocalProfileById,
  getLocalProfileByPhone,
} from "@/server/local-data";
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

  if (isLocalDatabaseMode()) {
    return getLocalProfileById(user.id);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (error) {
    console.error("Failed to load current profile.", error);
    return null;
  }

  return data;
}

export async function upsertCustomerProfile(input: ProfileInsert) {
  if (isLocalDatabaseMode()) {
    return createLocalProfile(input);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        ...input,
        role: input.role ?? "customer",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function phoneExists(phone: string) {
  if (isLocalDatabaseMode()) {
    return Boolean(await getLocalProfileByPhone(phone));
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("phone", normalizePhone(phone))
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
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

  if (isLocalDatabaseMode()) {
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

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        phone,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    await upsertCustomerProfile({
      ...profileInput,
      id: data.user.id,
    });
  }

  return data;
}

export async function loginWithEmailOrPhone(identifier: string, password: string) {
  const supabase = await createSupabaseServerClient();
  const trimmedIdentifier = identifier.trim();
  let email = trimmedIdentifier.toLowerCase();

  if (!trimmedIdentifier.includes("@")) {
    if (isLocalDatabaseMode()) {
      const profile = await getLocalProfileByPhone(trimmedIdentifier);

      if (!profile?.email) {
        throw new Error("Invalid credentials");
      }

      email = profile.email;
    } else {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("email")
      .eq("phone", normalizePhone(trimmedIdentifier))
      .maybeSingle();

    if (error || !data?.email) {
      throw new Error("Invalid credentials");
    }

    email = data.email;
    }
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
