/**
 * Replicate Model Validation - Server-Side Wrapper
 *
 * Phase 6 model discovery - validates that the configured model
 * supports uploaded image input for AI Photo Studio's photo editing flow.
 *
 * This is the server-side wrapper that imports server-only and re-exports
 * the pure validation logic from lib/replicate-model-validation.ts.
 *
 * Usage (server-side):
 *   import { validateReplicateImageEditModel } from "@/server/ai/replicate-models";
 *   const result = validateReplicateImageEditModel("stability-ai/stable-diffusion-img2img");
 *   if (!result.ok) throw new Error(result.reason);
 */

import "server-only";

// Re-export everything from the pure module
export {
  validateReplicateImageEditModel,
  isTextToImageOnlyModel,
  getBlockedModelList,
  getKnownImageInputFields,
  CANDIDATE_IMAGE_EDIT_MODELS,
  TEXT_TO_IMAGE_ONLY_MODELS,
  KNOWN_IMAGE_INPUT_FIELDS,
  printModelValidationReport,
} from "@/lib/replicate-model-validation";

// Re-export types
export type { ModelValidationResult } from "@/server/ai/types";

// Import for use in server-only helper
import { validateReplicateImageEditModel } from "@/lib/replicate-model-validation";

/**
 * Check if the currently configured REPLICATE_IMAGE_MODEL env is valid.
 * Returns the validation result for the current configuration.
 *
 * Does NOT call Replicate API.
 */
export function validateCurrentReplicateModelConfig() {
  const model = process.env.REPLICATE_IMAGE_MODEL ?? "";
  return validateReplicateImageEditModel(model);
}
