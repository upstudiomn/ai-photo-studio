import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { UploadedStorageObject } from "@/server/storage";

const LOCAL_BUCKET = "local";
const localFolders = ["source-images", "generated-previews", "final-outputs"] as const;

function getUploadRoot() {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.LOCAL_UPLOAD_DIR ?? "./uploads");
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_LOCAL_UPLOAD_BASE_URL ?? "/uploads";
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("png")) return "png";
  return "png";
}

function getPublicPath(filePath: string) {
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  return `${baseUrl}/${filePath.replace(/\\/g, "/").replace(/^\/+/, "")}`;
}

export async function ensureLocalUploadDirs() {
  const root = getUploadRoot();
  await Promise.all(localFolders.map((folder) => mkdir(path.join(root, folder), { recursive: true })));
  return true;
}

export function getLocalPublicUrl(filePath: string) {
  if (/^(https?:|data:|\/uploads\/)/.test(filePath)) {
    return filePath;
  }

  return getPublicPath(filePath);
}

async function writeLocalFile(folder: (typeof localFolders)[number], sessionId: string, fileName: string, buffer: Buffer) {
  await ensureLocalUploadDirs();

  const safeName = sanitizeFileName(fileName);
  const relativePath = `${folder}/${sessionId}/${randomUUID()}-${safeName}`;
  const absolutePath = path.join(getUploadRoot(), relativePath);

  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, buffer);

  return {
    bucket: LOCAL_BUCKET,
    path: relativePath,
    fileUrl: getPublicPath(relativePath),
  };
}

export async function saveLocalUploadedImage(file: Blob, sessionId: string, fileName = "upload") {
  const buffer = Buffer.from(await file.arrayBuffer());
  return writeLocalFile("source-images", sessionId, fileName, buffer);
}

export async function saveLocalGeneratedPreview(bufferOrUrl: Buffer | string, sessionId: string): Promise<UploadedStorageObject> {
  if (Buffer.isBuffer(bufferOrUrl)) {
    return writeLocalFile("generated-previews", sessionId, "preview.png", bufferOrUrl);
  }

  if (bufferOrUrl.startsWith("data:")) {
    const match = bufferOrUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error("Invalid generated preview data URL.");
    }

    const mimeType = match[1];
    const buffer = Buffer.from(match[2], "base64");
    return writeLocalFile("generated-previews", sessionId, `preview.${extensionFromMimeType(mimeType)}`, buffer);
  }

  if (/^https?:\/\//.test(bufferOrUrl)) {
    const response = await fetch(bufferOrUrl);

    if (!response.ok) {
      throw new Error(`Failed to download generated preview: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") ?? "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return writeLocalFile("generated-previews", sessionId, `preview.${extensionFromMimeType(contentType)}`, buffer);
  }

  return {
    bucket: LOCAL_BUCKET,
    path: bufferOrUrl,
    fileUrl: getLocalPublicUrl(bufferOrUrl),
  };
}

export async function loadLocalImageAsBase64(filePathOrUrl: string) {
  const publicUrl = getLocalPublicUrl(filePathOrUrl);
  const relativePath = publicUrl.replace(`${getBaseUrl().replace(/\/$/, "")}/`, "");
  const absolutePath = path.join(getUploadRoot(), relativePath);
  const buffer = await readFile(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const mimeType = ext === ".webp" ? "image/webp" : ext === ".png" ? "image/png" : "image/jpeg";
  const base64 = buffer.toString("base64");

  return {
    mimeType,
    base64,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}
