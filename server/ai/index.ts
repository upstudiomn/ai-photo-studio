/**
 * AI Provider Index
 *
 * Exports all AI providers and the provider selector.
 *
 * Usage:
 *   import { getImageProvider, getActiveAIProvider } from "@/server/ai";
 */

export { getImageProvider, getActiveAIProvider, type AIProviderType } from "@/server/ai/provider";
export { mockImageProvider } from "@/server/ai/mock";

// Re-export types for convenience
export type {
  GeneratePreviewInput,
  GeneratePreviewOutput,
  GenerateImageInput,
  GenerateImageOutput,
  ImageProvider,
} from "@/server/ai/types";

// Re-export model validation helpers
export {
  validateReplicateImageEditModel,
  validateCurrentReplicateModelConfig,
  isTextToImageOnlyModel,
  getBlockedModelList,
  getKnownImageInputFields,
  CANDIDATE_IMAGE_EDIT_MODELS,
  TEXT_TO_IMAGE_ONLY_MODELS,
  printModelValidationReport,
  type ModelValidationResult,
} from "@/server/ai/replicate-models";
