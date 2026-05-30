"use server";

import { redirect } from "next/navigation";
import { selectSessionTemplateBySlug } from "@/server/orders";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function selectTemplateAction(formData: FormData) {
  const sessionId = getFormValue(formData, "sessionId");
  const templateSlug = getFormValue(formData, "templateSlug");

  if (!sessionId) {
    redirect("/create?error=session");
  }

  if (!templateSlug) {
    redirect(`/create/template?sessionId=${sessionId}&error=template`);
  }

  try {
    await selectSessionTemplateBySlug(sessionId, templateSlug);
  } catch (error) {
    console.error("Failed to save selected template.", error);
    redirect(`/create/template?sessionId=${sessionId}&template=${templateSlug}&error=save-template`);
  }

  redirect(`/generate/${sessionId}?template=${templateSlug}`);
}
