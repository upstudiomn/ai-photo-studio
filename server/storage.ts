import "server-only";
import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isLocalStorageMode } from "@/lib/db/mode";

const SOURCE_IMAGES_BUCKET = "source-images";
export { SOURCE_IMAGES_BUCKET };
const GENERATED_PREVIEWS_BUCKET = "generated-previews";
export { GENERATED_PREVIEWS_BUCKET };

export type ValidateImageFileInput = {
  size: number;
  type: string;
};

export type UploadSessionSourceImageInput = {
  sessionId: string;
  file: Blob;
  fileName: string;
  contentType?: string;
};

export type UploadedStorageObject = {
  bucket: string;
  path: string;
  fileUrl: string;
};

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSizeBytes = 10 * 1024 * 1024;

export function validateImageFile(file: ValidateImageFileInput) {
  if (!allowedImageTypes.has(file.type)) {
    return {
      ok: false,
      error: "Unsupported image type. Use JPG, PNG, or WEBP.",
    };
  }

  if (file.size > maxImageSizeBytes) {
    return {
      ok: false,
      error: "Image is too large. Maximum size is 10MB.",
    };
  }

  return { ok: true, error: null };
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

export async function ensureSourceImagesBucket() {
  if (isLocalStorageMode()) {
    const { ensureLocalUploadDirs } = await import("@/server/local-storage");
    return ensureLocalUploadDirs();
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.getBucket(SOURCE_IMAGES_BUCKET);

  if (error) {
    throw new Error("Source images storage bucket is not available.");
  }

  return true;
}

export async function uploadSessionSourceImage(input: UploadSessionSourceImageInput): Promise<UploadedStorageObject> {
  const contentType = input.contentType ?? input.file.type;
  const validation = validateImageFile({ size: input.file.size, type: contentType });

  if (!validation.ok) {
    throw new Error(validation.error ?? "Invalid image file.");
  }

  if (isLocalStorageMode()) {
    const { saveLocalUploadedImage } = await import("@/server/local-storage");
    return saveLocalUploadedImage(input.file, input.sessionId, input.fileName);
  }

  const supabase = createSupabaseAdminClient();
  const safeName = sanitizeFileName(input.fileName);
  const path = `${input.sessionId}/${randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from(SOURCE_IMAGES_BUCKET).upload(path, input.file, {
    contentType,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return {
    bucket: SOURCE_IMAGES_BUCKET,
    path,
    fileUrl: path,
  };
}

export async function getPublicOrSignedUrl(bucket: string, path: string, expiresIn = 60 * 10) {
  if (isLocalStorageMode()) {
    const { getLocalPublicUrl } = await import("@/server/local-storage");
    return getLocalPublicUrl(path);
  }

  const supabase = createSupabaseAdminClient();

  // MVP default: buckets are private, so return a short-lived signed URL.
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

export async function getStoredImageDisplayUrl(bucket: string, pathOrUrl: string, expiresIn = 60 * 10) {
  if (isLocalStorageMode()) {
    const { getLocalPublicUrl } = await import("@/server/local-storage");
    return getLocalPublicUrl(pathOrUrl);
  }

  if (/^(https?:|data:|\/)/.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return getPublicOrSignedUrl(bucket, pathOrUrl, expiresIn);
}

// --- Generated previews bucket ---

export async function ensureGeneratedPreviewsBucket() {
  if (isLocalStorageMode()) {
    const { ensureLocalUploadDirs } = await import("@/server/local-storage");
    return ensureLocalUploadDirs();
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.getBucket(GENERATED_PREVIEWS_BUCKET);

  if (error) {
    throw new Error("Generated previews storage bucket is not available.");
  }

  return true;
}

export async function uploadGeneratedPreview(
  sessionId: string,
  buffer: Buffer,
  mimeType: string,
  prefix = "preview",
): Promise<UploadedStorageObject> {
  if (isLocalStorageMode()) {
    const { saveLocalGeneratedPreview } = await import("@/server/local-storage");
    return saveLocalGeneratedPreview(buffer, sessionId);
  }

  const supabase = createSupabaseAdminClient();
  const ext = mimeType.split("/")[1] || "png";
  const path = `${sessionId}/${prefix}-${randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(GENERATED_PREVIEWS_BUCKET).upload(path, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw error;
  }

  return {
    bucket: GENERATED_PREVIEWS_BUCKET,
    path,
    fileUrl: path,
  };
}

export async function uploadGeneratedPreviewFromUrl(sessionId: string, imageUrl: string) {
  if (isLocalStorageMode()) {
    const { saveLocalGeneratedPreview } = await import("@/server/local-storage");
    return saveLocalGeneratedPreview(imageUrl, sessionId);
  }

  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download generated preview: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());

  return uploadGeneratedPreview(sessionId, buffer, contentType, "replicate");
}

// --- Load uploaded images from storage ---

export async function loadImageFromStorageAsBase64(
  bucket: string,
  path: string,
): Promise<{ mimeType: string; base64: string; dataUrl: string }> {
  if (isLocalStorageMode()) {
    const { loadLocalImageAsBase64 } = await import("@/server/local-storage");
    return loadLocalImageAsBase64(path);
  }

  const supabase = createSupabaseAdminClient();

  // Download the file from storage
  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Failed to download image from ${bucket}/${path}: ${error.message}`);
  }

  // Convert to base64
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Determine mime type from buffer or default to image/jpeg
  const mimeType = "image/jpeg";

  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  return {
    mimeType,
    base64,
    dataUrl,
  };
}
