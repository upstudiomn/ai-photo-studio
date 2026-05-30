/**
 * Replicate AI Image Generation Provider
 *
 * Phase 6 live test - uses Replicate API for image generation.
 *
 * IMPORTANT: This provider requires an image-to-image model that accepts
 * an 'image' input parameter for uploaded photo editing/restoration.
 *
 * Known text-to-image-only models (DO NOT USE for uploaded photo flow):
 * - black-forest-labs/flux-schnell
 * - black-forest-labs/flux-dev
 * - stability-ai/sd3-medium
 *
 * Suitable models for uploaded photo editing:
 * - Models with 'image' input parameter
 * - Image-to-image or inpainting models
 *
 * Docs: https://replicate.com/
 * API Token: https://replicate.com/account/api-tokens
 *
 * Validation: Use `validateReplicateImageEditModel()` from replicate-models.ts
 * before running any predictions.
 */

import "server-only";
import Replicate from "replicate";
import type { GenerateImageInput, GenerateImageOutput, ImageProvider } from "@/server/ai/types";
import { isTextToImageOnlyModel, getBlockedModelList } from "@/server/ai/replicate-models";

function getReplicateApiToken(): string {
  const apiToken = process.env.REPLICATE_API_TOKEN;

  if (!apiToken) {
    throw new Error(
      "REPLICATE_API_TOKEN is not set. Please add your Replicate API token to .env.local. " +
        "Get a token from: https://replicate.com/account/api-tokens",
    );
  }

  return apiToken;
}

function getReplicateImageModel(): string {
  return process.env.REPLICATE_IMAGE_MODEL ?? "";
}

/**
 * Get a list of known text-to-image-only models for error messages.
 */
function getTextToImageModelList(): string {
  return getBlockedModelList();
}

export const replicateImageProvider: ImageProvider = {
  async generate(input: GenerateImageInput): Promise<GenerateImageOutput[]> {
    const apiToken = getReplicateApiToken();
    const model = getReplicateImageModel();

    // Guard: Check if model supports image input
    if (isTextToImageOnlyModel(model)) {
      const errorMessage =
        `Configured Replicate model "${model || "(empty)"}" does not support uploaded image editing. ` +
        `This model is text-to-image only.\n\n` +
        `Known text-to-image-only models:\n${getTextToImageModelList()}\n\n` +
        `For uploaded photo editing/restoration, configure REPLICATE_IMAGE_MODEL to an ` +
        `image-to-image model that accepts an "image" input parameter. ` +
        `Example: stability-ai/stable-diffusion-img2img or similar.\n\n` +
        `Set AI_PROVIDER=mock in .env.local to use mock generation for development.`;

      console.error(`Replicate: ${errorMessage}`);

      throw new Error(
        `Configured Replicate model does not support uploaded image editing. ` +
          `Current model "${model || "(empty)"}" is text-to-image only. ` +
          `Set AI_PROVIDER=mock in .env.local to use mock generation.`,
      );
    }

    // Check if we have an uploaded image
    const hasUploadedImage =
      input.imageUrls &&
      input.imageUrls.length > 0 &&
      input.imageUrls[0].startsWith("data:");

    if (!hasUploadedImage) {
      const errorMessage =
        `Replicate provider requires an uploaded image for photo editing. ` +
        `No image was provided in the request. ` +
        `Set AI_PROVIDER=mock in .env.local to use mock generation.`;

      console.error(`Replicate: ${errorMessage}`);

      throw new Error(
        `Replicate provider requires an uploaded image. ` +
          `No image was provided. ` +
          `Set AI_PROVIDER=mock in .env.local to use mock generation.`,
      );
    }

    try {
      const replicate = new Replicate({ auth: apiToken });

      // Build input parameters
      const inputParams: Record<string, unknown> = {
        prompt: input.prompt,
      };

      // Attach uploaded image as base64 data URL
      // Note: The model must support the 'image' input parameter
      const base64Match = input.imageUrls[0].match(/^data:([^;]+);base64,(.+)$/);
      if (base64Match) {
        const mimeType = base64Match[1];
        const base64Data = base64Match[2];
        inputParams.image = `data:${mimeType};base64,${base64Data}`;
        console.log(`Replicate: Attached uploaded image as ${mimeType}`);
      }

      console.log(`Replicate: Running model ${model}`);
      console.log(`Replicate: Prompt: ${input.prompt.substring(0, 100)}...`);

      // Run prediction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const output = await replicate.run(model as any, { input: inputParams });

      console.log(`Replicate: Output received:`, typeof output);

      // Parse output
      let outputUrls: string[] = [];

      if (typeof output === "string") {
        outputUrls = [output];
      } else if (Array.isArray(output)) {
        outputUrls = output.filter((url) => typeof url === "string") as string[];
      }

      if (outputUrls.length === 0) {
        throw new Error("Replicate did not return any image URLs");
      }

      console.log(`Replicate: Generated ${outputUrls.length} images`);

      return outputUrls.map((url) => ({
        previewUrl: url,
        fullResUrl: url,
        provider: "replicate" as const,
        model,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown Replicate error";
      console.error(`Replicate API error: ${errorMessage}`);

      throw new Error(
        `Replicate generation failed: ${errorMessage}. ` +
          "Set AI_PROVIDER=mock in .env.local to use mock generation.",
      );
    }
  },
};
