"use server";

import { revalidatePath } from "next/cache";
import { updateAdminTemplatePrompt } from "@/server/admin";
import { getAdminAuth } from "@/server/admin-auth";

export type TemplatePromptEditorState = {
  success: boolean;
  error?: string;
  updatedTemplateId?: string;
  updatedAt?: string;
};

function getText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalText(formData: FormData, key: string) {
  const text = getText(formData, key);
  return text.length > 0 ? text : null;
}

export async function updateTemplatePromptAction(
  _previousState: TemplatePromptEditorState,
  formData: FormData,
): Promise<TemplatePromptEditorState> {
  const admin = await getAdminAuth();

  if (!admin.ok) {
    return {
      success: false,
      error: admin.reason === "unauthenticated" ? "Authentication required." : "Admin access required.",
    };
  }

  const templateId = getText(formData, "templateId");
  const titleMn = getText(formData, "titleMn");
  const prompt = getText(formData, "prompt");

  if (!templateId) {
    return { success: false, error: "Missing template id." };
  }

  if (!titleMn) {
    return { success: false, error: "Title is required." };
  }

  if (!prompt) {
    return { success: false, error: "Prompt is required." };
  }

  const result = await updateAdminTemplatePrompt(templateId, {
    title_mn: titleMn,
    title_en: getOptionalText(formData, "titleEn"),
    description_mn: getOptionalText(formData, "descriptionMn"),
    prompt,
    negative_prompt: getOptionalText(formData, "negativePrompt"),
    is_active: formData.get("isActive") === "on",
  });

  if (!result.success) {
    return { success: false, error: result.error ?? "Template prompt update failed." };
  }

  revalidatePath("/admin/templates");
  revalidatePath("/templates");

  return {
    success: true,
    updatedTemplateId: templateId,
    updatedAt: new Date().toISOString(),
  };
}
