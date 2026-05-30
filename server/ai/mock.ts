import type { GenerateImageInput, GenerateImageOutput, ImageProvider } from "@/server/ai/types";

const mockPreviewUrls = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
];

export const mockImageProvider: ImageProvider = {
  async generate(input: GenerateImageInput): Promise<GenerateImageOutput[]> {
    return mockPreviewUrls.slice(0, 3).map((previewUrl, index) => ({
      previewUrl,
      fullResUrl: previewUrl,
      provider: "mock",
      model: `mock-${input.aspectRatio}-${index + 1}`,
    }));
  },
};
