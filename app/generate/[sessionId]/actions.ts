"use server";

import { redirect } from "next/navigation";
import { createMockGeneratedOutputsForSession, getGenerationSessionById } from "@/server/orders";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function generatePreviewAction(formData: FormData) {
  const sessionId = getFormValue(formData, "sessionId");
  const templateSlug = getFormValue(formData, "templateSlug");

  if (!sessionId) {
    redirect("/create?error=session");
  }

  try {
    await getGenerationSessionById(sessionId);
    await createMockGeneratedOutputsForSession(sessionId, templateSlug);
  } catch (error) {
    console.error("Failed to generate preview.", error);
    const params = new URLSearchParams({ error: "generate" });

    if (templateSlug) {
      params.set("template", templateSlug);
    }

    redirect(`/generate/${sessionId}?${params.toString()}`);
  }

  redirect(`/results/${sessionId}${templateSlug ? `?template=${templateSlug}` : ""}`);
}
