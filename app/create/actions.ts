"use server";

import { redirect } from "next/navigation";
import { getTemplateBySlug } from "@/lib/templates";
import { getCurrentUser } from "@/server/auth";
import { addUploadedImage, createGenerationSession } from "@/server/orders";
import { ensureSourceImagesBucket, uploadSessionSourceImage, validateImageFile } from "@/server/storage";

const MAX_UPLOAD_COUNT = 5;

function isUploadedFile(value: FormDataEntryValue): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "size" in value &&
    "type" in value &&
    "arrayBuffer" in value
  );
}

function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter(isUploadedFile)
    .filter((file) => file.size > 0)
    .slice(0, MAX_UPLOAD_COUNT);
}

export async function createGenerationSessionUploadAction(formData: FormData) {
  const consent = formData.get("consent");
  const templateSlug = formData.get("templateSlug");
  const files = getImageFiles(formData);

  if (files.length === 0) {
    redirect("/create?error=no-file");
  }

  if (consent !== "on") {
    redirect("/create?error=consent");
  }

  const invalidFile = files.find((file) => !validateImageFile({ size: file.size, type: file.type }).ok);

  if (invalidFile) {
    redirect("/create?error=invalid-file");
  }

  const selectedTemplateSlug = typeof templateSlug === "string" && getTemplateBySlug(templateSlug) ? templateSlug : null;
  let nextHref = "/create?error=upload";

  try {
    await ensureSourceImagesBucket();
    const user = await getCurrentUser();

    const session = await createGenerationSession({
      status: "uploaded",
      user_id: user?.id ?? null,
    });

    for (const file of files) {
      const uploaded = await uploadSessionSourceImage({
        sessionId: session.id,
        file,
        fileName: file.name,
        contentType: file.type,
      });

      await addUploadedImage({
        session_id: session.id,
        file_url: uploaded.fileUrl,
        file_path: uploaded.path,
        image_type: "source",
      });
    }

    const params = new URLSearchParams({ sessionId: session.id });

    if (selectedTemplateSlug) {
      params.set("template", selectedTemplateSlug);
    }

    nextHref = `/create/template?${params.toString()}`;
  } catch (error) {
    console.error("Failed to create generation session upload.", error);
  }

  redirect(nextHref);
}
