import { mockImageProvider } from "@/server/ai/mock";
import { geminiImageProvider } from "@/server/ai/gemini";
import { replicateImageProvider } from "@/server/ai/replicate";
import type { ImageProvider, AIProviderType } from "@/server/ai/types";

export type { AIProviderType };

export function getImageProvider(): ImageProvider {
  const provider = (process.env.AI_PROVIDER ?? "mock") as AIProviderType;

  switch (provider) {
    case "gemini":
      return geminiImageProvider;
    case "replicate":
      return replicateImageProvider;
    case "mock":
    default:
      return mockImageProvider;
  }
}

export function getActiveAIProvider(): AIProviderType {
  const provider = (process.env.AI_PROVIDER ?? "mock") as AIProviderType;
  if (provider === "gemini" || provider === "replicate") {
    return provider;
  }
  return "mock";
}
