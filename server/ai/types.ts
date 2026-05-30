// New unified interfaces for AI generation (preview-first)
export type GeneratePreviewInput = {
  sessionId: string;
  templateSlug?: string;
  prompt: string;
  sourceImageUrls: string[];
  outputCount?: number;
};

export type GeneratePreviewOutput = {
  provider: "mock" | "gemini" | "replicate";
  model: string;
  outputs: {
    previewUrl: string;
    watermarkedUrl?: string | null;
    fullResUrl?: string | null;
  }[];
};

// Legacy interfaces (kept for backward compatibility)
export type GenerateImageInput = {
  templateId: string;
  prompt: string;
  imageUrls: string[];
  aspectRatio: string;
  quality?: "low" | "medium" | "high";
};

export type GenerateImageOutput = {
  previewUrl: string;
  fullResUrl?: string;
  provider: "mock" | "openai" | "replicate" | "gemini";
  model: string;
};

export type ImageProvider = {
  generate(input: GenerateImageInput): Promise<GenerateImageOutput[]>;
};

// Provider type for selection
export type AIProviderType = "mock" | "gemini" | "replicate";

// Replicate model validation result
export type ModelValidationResult = {
  ok: boolean;
  reason?: string;
  expectedImageFields?: string[];
  isBlocked?: boolean;
  isCandidate?: boolean;
};
