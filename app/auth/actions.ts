"use server";

import { redirect } from "next/navigation";
import { loginWithEmailOrPhone, logoutUser, phoneExists, signUpCustomer } from "@/server/auth";

function getRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signUpCustomerAction(formData: FormData) {
  const firstName = getRequiredString(formData, "firstName");
  const lastName = getRequiredString(formData, "lastName");
  const phone = getRequiredString(formData, "phone");
  const email = getRequiredString(formData, "email").toLowerCase();
  const password = getRequiredString(formData, "password");

  if (!firstName || !lastName || !phone || !email || !password) {
    redirect("/auth/signup?error=missing");
  }

  if (password.length < 6) {
    redirect("/auth/signup?error=password");
  }

  let phoneTaken = false;

  try {
    phoneTaken = await phoneExists(phone);
  } catch (error) {
    console.error("Phone uniqueness check failed.", error);
    redirect("/auth/signup?error=signup");
  }

  if (phoneTaken) {
    redirect("/auth/signup?error=phone");
  }

  let needsEmailConfirmation = false;

  try {
    const data = await signUpCustomer({ firstName, lastName, phone, email, password });
    needsEmailConfirmation = !data.session;
  } catch (error) {
    console.error("Customer signup failed.", error);
    redirect("/auth/signup?error=signup");
  }

  if (needsEmailConfirmation) {
    redirect("/auth/login?message=check-email");
  }

  redirect("/create?auth=signed-up");
}

export async function loginCustomerAction(formData: FormData) {
  const identifier = getRequiredString(formData, "identifier");
  const password = getRequiredString(formData, "password");

  if (!identifier) {
    redirect("/auth/login?error=missing-identifier");
  }

  if (!password) {
    redirect("/auth/login?error=missing-password");
  }

  try {
    await loginWithEmailOrPhone(identifier, password);
  } catch (error) {
    console.error("Customer login failed.", error);
    redirect("/auth/login?error=invalid");
  }

  redirect("/create?auth=login");
}

export async function logoutCustomerAction() {
  await logoutUser();
  redirect("/?auth=logout");
}
