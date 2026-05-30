/**
 * Gemini AI Image Generation Provider
 *
 * Phase 6 live test - uses real Gemini API for image generation.
 *
 * Two modes:
 * 1. Text-to-image: Uses prompt only
 * 2. Image-input: Uses uploaded image + prompt (for photo editing)
 *
 * Docs: https://ai.google.dev/
 * API Key: https://aistudio.google.com/
 */

import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GenerateImageInput, GenerateImageOutput, ImageProvider } from "@/server/ai/types";

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Please add your Gemini API key to .env.local. " +
        "Get a key from: https://aistudio.google.com/",
    );
  }

  return apiKey;
}

/**
 * Gemini image generation model.
 * Using gemini-1.5-flash for image generation.
 * This model supports both text and image inputs.
 *
 * Available models for image generation:
 * - gemini-1.5-flash: Fast model with image support
 * - gemini-1.5-pro: Higher quality but slower
 *
 * If models are not found, check API key permissions at:
 * https://aistudio.google.com/app/apikey
 */
const GEMINI_IMAGE_MODEL = "gemini-1.5-flash";

/**
 * Generate image using text prompt only (text-to-image).
 * This is the fallback mode when no uploaded images are available.
 */
async function generateTextToImage(apiKey: string, prompt: string): Promise<GenerateImageOutput[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_IMAGE_MODEL });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const response = result.response;

  // Extract image from response
  const imageParts = response.candidates
    ?.flatMap((candidate) => candidate.content.parts)
    .filter((part) => part.inlineData?.mimeType?.startsWith("image/")) ?? [];

  if (imageParts.length === 0) {
    throw new Error("Gemini text-to-image returned no image. The model may not support text-to-image.");
  }

  return imageParts.map((part) => {
    const inlineData = part.inlineData!;
    const dataUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;
    return {
      previewUrl: dataUrl,
      fullResUrl: dataUrl,
      provider: "gemini" as const,
      model: GEMINI_IMAGE_MODEL,
    };
  });
}

/**
 * Generate image using uploaded image as input (image-to-image / edit).
 * This is the preferred mode for AI Photo Studio where user uploads a photo.
 *
 * IMPORTANT: Gemini's gemini-2.0-flash-exp model supports image input.
 * The image is sent as inlineData along with the text prompt.
 *
 * Note: Gemini processes images but may generate new images rather than
 * strictly editing the input. For strict photo editing, consider using
 * a model specifically designed for image-to-image tasks.
 */
async function generateWithImageInput(
  apiKey: string,
  prompt: string,
  imageBase64: string,
  mimeType: string = "image/jpeg",
): Promise<GenerateImageOutput[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_IMAGE_MODEL });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
  });

  const response = result.response;

  // Extract image from response
  const imageParts = response.candidates
    ?.flatMap((candidate) => candidate.content.parts)
    .filter((part) => part.inlineData?.mimeType?.startsWith("image/")) ?? [];

  if (imageParts.length === 0) {
    throw new Error("Gemini image-input returned no image. The model may not support image-input generation.");
  }

  return imageParts.map((part) => {
    const inlineData = part.inlineData!;
    const dataUrl = `data:${inlineData.mimeType};base64,${inlineData.data}`;
    return {
      previewUrl: dataUrl,
      fullResUrl: dataUrl,
      provider: "gemini" as const,
      model: GEMINI_IMAGE_MODEL,
    };
  });
}

export const geminiImageProvider: ImageProvider = {
  async generate(input: GenerateImageInput): Promise<GenerateImageOutput[]> {
    const apiKey = getGeminiApiKey();
    const prompt = input.prompt || "Create a beautiful photo preview";

    try {
      // Check if we have images to use as input
      const hasImageInput = input.imageUrls && input.imageUrls.length > 0;

      if (hasImageInput) {
        // Use image-input mode
        // Note: imageUrls should be base64 data URLs in format: data:image/jpeg;base64,xxxxx
        const firstImage = input.imageUrls[0];
        const base64Match = firstImage.match(/^data:([^;]+);base64,(.+)$/);

        if (base64Match) {
          const mimeType = base64Match[1];
          const base64Data = base64Match[2];
          return await generateWithImageInput(apiKey, prompt, base64Data, mimeType);
        } else {
          // If imageUrls are not data URLs, we can't use them directly
          // Fall back to text-to-image with enhanced prompt
          console.warn("Gemini: imageUrls provided but not in base64 format. Using text-to-image mode.");
          return await generateTextToImage(apiKey, prompt);
        }
      } else {
        // Use text-to-image mode
        return await generateTextToImage(apiKey, prompt);
      }
    } catch (error) {
      // Log the actual error server-side without exposing key
      const errorMessage = error instanceof Error ? error.message : "Unknown Gemini error";
      console.error(`Gemini API error: ${errorMessage}`);

      // Re-throw with clear message
      throw new Error(
        `Gemini generation failed: ${errorMessage}. ` +
          "Set AI_PROVIDER=mock in .env.local to use mock generation.",
      );
    }
  },
};

/**
 * Upload Gemini-generated image to Supabase storage.
 * This is a separate function to be called by the caller after generation.
 */
export async function uploadGeminiOutputToStorage(
  sessionId: string,
  base64Data: string,
  mimeType: string,
): Promise<{ path: string; url: string }> {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createSupabaseAdminClient();

  // Convert base64 to buffer
  const buffer = Buffer.from(base64Data, "base64");
  const fileName = `${sessionId}/gemini-${Date.now()}.${mimeType.split("/")[1] || "png"}`;

  // Upload to generated-previews bucket
  const { data, error } = await supabase.storage.from("generated-previews").upload(fileName, buffer, {
    contentType: mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Failed to upload Gemini output to storage: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from("generated-previews").getPublicUrl(data.path);

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
}
