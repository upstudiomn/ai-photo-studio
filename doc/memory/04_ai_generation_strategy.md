# AI Generation Strategy

## Phase 0: Test foundation

Add provider test foundation:
- Gemini provider stub added
- Replicate provider stub added
- Mock provider remains default

## Phase 1: Provider readiness (current)

Replicate provider is implemented with safety guard:
- Requires image-to-image model with "image" input parameter
- Blocks text-to-image-only models (flux-schnell, flux-dev, etc.)
- Clear error message if wrong model configured
- Text-to-image generation: safe guard added
- Image-input generation: safe guard added
- Output saved to generated-previews storage path/bucket depending on storage mode
- Mock fallback works correctly

Set in `.env.local`:
```env
AI_PROVIDER=replicate  # live test (requires image-to-image model)
AI_PROVIDER=mock       # fallback (default for development)
```

**Required model configuration:**
```env
REPLICATE_IMAGE_MODEL=<image-to-image model with "image" input>
```

**DO NOT use these text-to-image-only models:**
- black-forest-labs/flux-schnell
- black-forest-labs/flux-dev
- stability-ai/sd3-medium

**Model validation:**
- `server/ai/replicate-models.ts` provides `validateReplicateImageEditModel()` helper
- `scripts/check-replicate-model.ts` validates model without spending credits
- Blocklist and candidate model list maintained in `replicate-models.ts`
- Safe schema check via Replicate API metadata (no predictions)

**Candidate models for uploaded photo editing:**
- stability-ai/stable-diffusion-img2img (current valid candidate tested)
- tomfreeman/transformerlm-1
- lucataco/flux-dev-3d
- lucataco/sdxl-img2img

**How to verify a model supports image input:**
1. Go to https://replicate.com/{model-slug}/versions
2. Look at the input schema
3. Must have "image", "input_image", "init_image", or "source_image" parameter
4. If only prompt/width/height/num_outputs exist, it is text-to-image ONLY

NOTE: Gemini is paused - model/API limitation.

Latest Replicate status:
- `black-forest-labs/flux-schnell` is deprecated/blocked for this app because it is text-to-image only.
- `stability-ai/stable-diffusion-img2img` is the current valid image-input candidate.
- Live Replicate use still requires account credit and manual quality validation.
- Mock provider remains the primary local/E2E provider so no credits are spent.

## Phase 1b: Free testing

Before coding production AI flow, test templates with:

- Gemini AI Studio
- Replicate Try for Free
- Hugging Face models if needed

Goal:
Find which templates produce sellable preview results.

## Phase 2: MVP production

Provider strategy order:
1. Mock (default, always works locally)
2. Replicate with validated image-to-image model (test phase)
3. OpenAI (optional, later)

Use OpenAI image API for:
- Old photo restoration
- Colorization
- Simple edit tasks
- Product photo background
- AI portrait/poster preview

Do not connect OpenAI until the upload + generation session + results flow works with mock data.

## Phase 3: Premium pipeline

Add Replicate and/or Gemini for:
- FLUX image generation
- Face consistency experiments
- Old photo restoration models
- Upscaling
- Background removal
- IP-Adapter/InstantID style pipelines

Do not add paid production model as final without testing.

## AI quality rule

Never promise 100% exact face preservation. Use this wording:

> AI results are based on the reference photo and aim to preserve identity. Premium orders require admin quality review.

## Correct preview-first AI workflow

```text
User uploads images
→ Create generation session
→ Choose template/style
→ Save uploaded_images
→ Run mock/AI template prompt
→ Save generated_outputs
→ Apply watermark to preview
→ Show preview results to user
→ User selects output and digital/print product
→ Checkout/payment
→ Create confirmed order, order_items, and print_jobs if needed
→ Admin fulfillment
```

Key rule:
Do not create a confirmed order before AI preview/results exist.

## Generation session statuses

- draft
- uploaded
- template_selected
- generating
- preview_ready
- failed
- converted_to_order

## Face-sensitive services

Admin review is required for:

- Family merge
- Couple portrait
- Kids portrait transformation
- Memorial/family restoration
- Premium studio portrait

## Safe automatic services

Can be mostly automatic, but still need clear preview review:

- Old photo restore
- Colorization
- Scratch removal
- Background cleanup
- Product background upgrade
