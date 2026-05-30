# AI API Setup

## Current implementation sync

- Mock provider is implemented and required for no-credit local/E2E tests.
- Replicate provider and model validation guard are implemented.
- `stability-ai/stable-diffusion-img2img` is the current valid image-to-image candidate.
- `black-forest-labs/flux-schnell` is blocked/deprecated for uploaded photo editing.
- Gemini provider is paused.
- OpenAI provider remains later.
- Do not spend live Replicate/OpenAI credits in Playwright E2E.

## Provider env settings

```env
# AI Provider Settings
# Options: mock, gemini, replicate
# Default: mock (safe for local development)
AI_PROVIDER=mock

# Gemini API (for Phase 6 test foundation)
# Get key from: https://aistudio.google.com/
GEMINI_API_KEY=

# Replicate API (for Phase 6 live test)
# Get token from: https://replicate.com/
REPLICATE_API_TOKEN=

# Replicate image-to-image model (REQUIRED)
# IMPORTANT: Must support "image" input parameter
# DO NOT use: flux-schnell, flux-dev, sd3-medium (text-to-image only)
# Example: stability-ai/stable-diffusion-img2img
# Run: npx tsx scripts/check-replicate-model.ts
REPLICATE_IMAGE_MODEL=
```

## AI provider files

```text
server/ai/
  index.ts      # main exports + validation helpers
  types.ts     # interfaces
  provider.ts  # provider selector
  mock.ts      # default mock provider
  gemini.ts    # Gemini provider (paused)
  replicate.ts # Replicate provider (live)
  replicate-models.ts # Model validation helpers
```

## Provider interface

All AI providers use the same interface:

```ts
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
  provider: "mock" | "gemini" | "replicate";
  model: string;
};
```

## Provider selection

Provider selection is centralized in `getImageProvider()`:

- `AI_PROVIDER=mock` → mock provider (default/fallback)
- `AI_PROVIDER=gemini` → Gemini provider (paused)
- `AI_PROVIDER=replicate` → Replicate provider (blocked until image-to-image model configured)
- unknown/missing → mock provider fallback

Replicate requires:
- Image-to-image model with "image" input parameter
- Credit in Replicate account
- Guard blocks text-to-image-only models

## Model validation

### Validation helper

Use `server/ai/replicate-models.ts` to validate models:

```ts
import { validateReplicateImageEditModel } from "@/server/ai/replicate-models";

const result = validateReplicateImageEditModel("stability-ai/stable-diffusion-img2img");
if (!result.ok) {
  console.error(result.reason);
}
```

### Safe validation script

Run `scripts/check-replicate-model.ts` to validate without spending credits:

```bash
npx tsx scripts/check-replicate-model.ts
```

This script:
1. Reads `REPLICATE_IMAGE_MODEL` from `.env.local`
2. Validates against known blocklists
3. Checks if it's a known candidate model
4. Fetches model schema metadata from Replicate API (no predictions)

### Blocked models (text-to-image only)

These models do NOT accept uploaded images:
- `black-forest-labs/flux-schnell`
- `black-forest-labs/flux-dev`
- `stability-ai/sd3-medium`
- `stability-ai/sd3`

### Candidate models for uploaded photo editing

These models have been identified as supporting image input:

| Slug | Category | Notes |
|------|----------|-------|
| `stability-ai/stable-diffusion-img2img` | image-to-image | Recommended for start |
| `tomfreeman/transformerlm-1` | image-to-image | Experimental |
| `lucataco/flux-dev-3d` | image-to-image | May accept image |
| `lucataco/sdxl-img2img` | image-to-image | SDXL-based |
| `gantry-ai/instantphoto` | image-to-image | Portrait enhancement |
| `doevent/photomaker-ocr` | restoration | Photo + OCR |
| `goofy/ai-portrait` | face | Portrait transformation |

### How to verify a model supports image input

1. Go to https://replicate.com/{model-slug}/versions
2. Look at the input schema
3. Must have "image", "input_image", "init_image", or "source_image" parameter
4. If only prompt/width/height/num_outputs exist, it is text-to-image ONLY

## Mock provider

Use during local MVP and development:
- Does not call real API
- Creates fake preview images
- Returns 3 preview outputs
- Lets the UI and order flow work

## Gemini provider (paused)

Implementation status: implemented but paused
- Read `GEMINI_API_KEY` server-side only
- Uses gemini-1.5-flash model
- Text-to-image generation: implemented
- Image-input generation: implemented
- Output saved to generated-previews storage bucket
- Mock fallback verified working
- Docs: https://ai.google.dev/
- API Key: https://aistudio.google.com/

Paused reason:
- Model returned 404 Not Found
- API key may not have image generation enabled
- Requires model name verification from AI Studio

Gemini can be reactivated once correct model is verified.

## Replicate provider (live)

Implementation status: implemented with safety guard
- Read `REPLICATE_API_TOKEN` server-side only
- Uses model from `REPLICATE_IMAGE_MODEL` env (must support "image" input)
- Model capability guard blocks text-to-image-only models
- Model validation via `validateReplicateImageEditModel()`
- Clear error message if wrong model configured
- Mock fallback if API fails
- Docs: https://replicate.com/
- API Token: https://replicate.com/account/api-tokens

Replicate safety guard:
- Text-to-image-only models blocked: flux-schnell, flux-dev, sd3-medium
- Guard prevents fake image-to-image success
- Clear error message guides to correct model type

Replicate requirements for uploaded photo flow:
1. Credit in Replicate account
2. Image-to-image model with "image" input parameter
3. Example: stability-ai/stable-diffusion-img2img

Previous test findings:
- `black-forest-labs/flux-schnell` is text-to-image only
- Model has no `image` input parameter
- Not suitable for uploaded photo restoration/editing
- 402 Payment Required also returned (insufficient credit)
- Mock fallback creates preview outputs if Replicate fails
- Safety guard now blocks flux-schnell before spending credit

## Provider switch

To switch providers, update `.env.local`:

```env
AI_PROVIDER=mock
```

Allowed values:
- mock
- gemini
- replicate

## Important rule

Do not block MVP because real AI is not ready. Build the site with mock provider first.

OpenAI is optional/later. Focus on Gemini or Replicate for Phase 6 test.
