/**
 * Replicate Model Validation - Pure Logic
 *
 * This module contains ONLY pure validation constants and functions.
 * It does NOT import "server-only" and can be used by both:
 * 1. Next.js server code (via replicate-models.ts wrapper)
 * 2. Standalone Node scripts (via direct import)
 *
 * This module does NOT:
 * - Run predictions
 * - Spend credits
 * - Make API calls
 * - Import server-only
 *
 * Usage from scripts:
 *   import { validateReplicateImageEditModel } from "@/lib/replicate-model-validation";
 */

import type { ModelValidationResult } from "@/server/ai/types";

/**
 * Known image input field names that indicate a model supports uploaded images.
 * These are common parameter names used by Replicate models for image-to-image tasks.
 */
export const KNOWN_IMAGE_INPUT_FIELDS = [
  "image",
  "input_image",
  "init_image",
  "source_image",
  "image_url",
  "input_image_url",
  "mask_image",
] as const;

/**
 * Models known to be text-to-image only (no image input support).
 * These should NOT be used for AI Photo Studio's uploaded photo editing flow.
 *
 * Sources:
 * - black-forest-labs/flux-schnell: Replicate page shows no image input, only prompt
 * - black-forest-labs/flux-dev: Same as schnell
 * - stability-ai/sd3-medium: Text-to-image only, no image input
 * - stability-ai/sd3: Text-to-image only, no image input
 */
export const TEXT_TO_IMAGE_ONLY_MODELS: readonly string[] = [
  "black-forest-labs/flux-schnell",
  "black-forest-labs/flux-dev",
  "black-forest-labs/flux-schnell-fp8",
  "black-forest-labs/flux-dev-fp8",
  "stability-ai/sd3-medium",
  "stability-ai/sd3",
  "stability-ai/sd3-large",
  "stability-ai/sd3-large-turbo",
] as const;

/**
 * Candidate models for uploaded photo editing/restoration.
 *
 * These models have been identified as supporting image input.
 * Master should verify the current model configuration before running predictions.
 *
 * Format: { slug, name, description, expectedImageFields }
 */
export const CANDIDATE_IMAGE_EDIT_MODELS: readonly {
  slug: string;
  name: string;
  description: string;
  expectedImageFields: readonly string[];
  category: "image-to-image" | "instruct-pix2pix" | "restoration" | "face";
}[] = [
  {
    slug: "stability-ai/stable-diffusion-img2img",
    name: "Stable Diffusion img2img",
    description: "Classic image-to-image model. Converts uploaded image based on prompt.",
    expectedImageFields: ["image"],
    category: "image-to-image",
  },
  {
    slug: "tomfreeman/transformerlm-1",
    name: "TransformerLM",
    description: "Experimental transformer model for image tasks.",
    expectedImageFields: ["image"],
    category: "image-to-image",
  },
  {
    slug: "lucataco/flux-dev-3d",
    name: "FLUX Dev 3D",
    description: "FLUX-based 3D render model. May accept image input.",
    expectedImageFields: ["image"],
    category: "image-to-image",
  },
  {
    slug: "gantry-ai/instantphoto",
    name: "InstantPhoto",
    description: "Realistic portrait enhancement. May support image input.",
    expectedImageFields: ["image"],
    category: "image-to-image",
  },
  {
    slug: "lucataco/sdxl-img2img",
    name: "SDXL img2img",
    description: "SDXL-based image-to-image model.",
    expectedImageFields: ["image"],
    category: "image-to-image",
  },
  {
    slug: "doevent/photomaker-ocr",
    name: "PhotoMaker OCR",
    description: "Photo enhancement and OCR. May support image input.",
    expectedImageFields: ["image"],
    category: "restoration",
  },
  {
    slug: "goofy/ai-portrait",
    name: "AI Portrait",
    description: "Portrait transformation model.",
    expectedImageFields: ["image"],
    category: "face",
  },
] as const;

/**
 * Validate if a Replicate model slug is suitable for uploaded photo editing.
 *
 * This function:
 * 1. Checks if the model is on the text-to-image-only blocklist
 * 2. Checks if the model is a known candidate for image editing
 * 3. Returns structured validation result
 *
 * IMPORTANT: This does NOT call the Replicate API or run predictions.
 * It only validates against known lists. For schema verification,
 * use `scripts/check-replicate-model.ts` or manually check the model page.
 *
 * @param modelSlug - The Replicate model slug to validate (e.g., "stability-ai/stable-diffusion-img2img")
 * @returns ModelValidationResult with ok=false if blocked, ok=true if valid candidate
 */
export function validateReplicateImageEditModel(modelSlug: string): ModelValidationResult {
  if (!modelSlug || modelSlug.trim() === "") {
    return {
      ok: false,
      reason:
        "REPLICATE_IMAGE_MODEL is empty. " +
        "Set it to an image-to-image model that accepts an 'image' input parameter. " +
        "Example: stability-ai/stable-diffusion-img2img",
      isBlocked: true,
    };
  }

  const trimmedSlug = modelSlug.trim();

  // Check blocklist first
  if (isTextToImageOnlyModel(trimmedSlug)) {
    return {
      ok: false,
      reason:
        `Model "${trimmedSlug}" is text-to-image only and does NOT accept uploaded images. ` +
        `This model can only generate images from text prompts. ` +
        `For AI Photo Studio's uploaded photo editing flow, use an image-to-image model. ` +
        `Example: stability-ai/stable-diffusion-img2img`,
      isBlocked: true,
    };
  }

  // Check if it's a known candidate
  const candidate = CANDIDATE_IMAGE_EDIT_MODELS.find((m) => m.slug === trimmedSlug);

  if (candidate) {
    return {
      ok: true,
      reason: `Model "${trimmedSlug}" is a known image editing candidate.`,
      expectedImageFields: [...candidate.expectedImageFields],
      isCandidate: true,
    };
  }

  // Unknown model - cannot auto-validate
  return {
    ok: false,
    reason:
      `Model "${trimmedSlug}" is not on the known blocklist but is also not a verified candidate. ` +
      `Manual verification required: ` +
      `Check the model's Replicate page at https://replicate.com/${trimmedSlug}/versions ` +
      `and verify it has an "image", "input_image", or similar parameter in the input schema. ` +
      `If the model only has prompt/width/height/num_outputs, it is text-to-image only.`,
    isBlocked: false,
    expectedImageFields: [...KNOWN_IMAGE_INPUT_FIELDS],
  };
}

/**
 * Check if a model is on the text-to-image-only blocklist.
 */
export function isTextToImageOnlyModel(modelSlug: string): boolean {
  if (!modelSlug) return false;
  return TEXT_TO_IMAGE_ONLY_MODELS.includes(modelSlug as (typeof TEXT_TO_IMAGE_ONLY_MODELS)[number]);
}

/**
 * Get a list of all blocked (text-to-image-only) models for error messages.
 */
export function getBlockedModelList(): string {
  return TEXT_TO_IMAGE_ONLY_MODELS.map((m) => `- ${m}`).join("\n");
}

/**
 * Get the list of known image input field names.
 */
export function getKnownImageInputFields(): string[] {
  return [...KNOWN_IMAGE_INPUT_FIELDS];
}

/**
 * Print a human-readable validation report for a model.
 * Useful for debugging and CLI scripts.
 */
export function printModelValidationReport(modelSlug: string): string {
  const result = validateReplicateImageEditModel(modelSlug);

  const lines: string[] = [];
  lines.push(`=== Replicate Model Validation Report ===`);
  lines.push(`Model: ${modelSlug || "(empty)"}`);
  lines.push(`Status: ${result.ok ? "VALID" : "INVALID"}`);
  lines.push(`Blocked: ${result.isBlocked ? "YES" : "NO"}`);
  lines.push(`Known Candidate: ${result.isCandidate ? "YES" : "NO"}`);

  if (result.reason) {
    lines.push(`Reason: ${result.reason}`);
  }

  if (result.expectedImageFields && result.expectedImageFields.length > 0) {
    lines.push(`Expected image input fields: ${result.expectedImageFields.join(", ")}`);
  }

  if (!result.ok) {
    lines.push(``);
    lines.push(`=== How to verify manually ===`);
    lines.push(`1. Go to https://replicate.com/${modelSlug || "<model-slug>"}/versions`);
    lines.push(`2. Look at the input schema`);
    lines.push(`3. Check for one of: ${KNOWN_IMAGE_INPUT_FIELDS.join(", ")}`);
    lines.push(`4. If only prompt/width/height/num_outputs exist, the model is text-to-image only.`);
  }

  return lines.join("\n");
}
