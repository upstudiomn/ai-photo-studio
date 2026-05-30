# AI Template System

## Purpose
Users should not write prompts. They choose ready-made templates.

## Template schema
```ts
export type AITemplate = {
  id: string;
  slug: string;
  titleMn: string;
  titleEn: string;
  category: string;
  descriptionMn: string;
  descriptionEn?: string;
  badge?: string;
  startingPriceMnt?: number;
  previewImageUrl: string;
  requiredImagesMin: number;
  requiredImagesMax: number;
  prompt: string;
  negativePrompt?: string;
  defaultAspectRatio: "1:1" | "4:5" | "3:4" | "2:3" | "A4" | "A3";
  outputType: "digital" | "print-ready" | "both";
  requiresAdminReview: boolean;
  isActive: boolean;
};
```

## Current implementation status

- Static template data and local/Supabase seed data exist.
- Visible English UI should read `titleEn`, `descriptionEn`, `badge`, and `startingPriceMnt` where available.
- `titleMn` and `descriptionMn` can remain for seed/demo/history, but should not be the visible English UI source unless a localization task reintroduces Mongolian UI.
- `/admin/templates` includes a prompt editor for existing template fields.
- Template creation/deletion and slug mutation remain planned.

## Universal identity preservation block
Use this in all people-related prompts:

```text
Preserve the exact identity, facial features, face shape, eye shape, nose, mouth, hairstyle, age, skin tone, expression, pose, and natural proportions of every person. Do not change the person into someone else. Do not over-beautify. Do not change age or ethnicity.
```

## Universal output block
```text
Output must be photorealistic, clean, high-quality, print-ready, natural, and suitable for premium photo printing. No text, no logo, no watermark.
```

## Template 1: Old Photo Restore
```text
Restore this old damaged photograph naturally. Preserve the exact identity and facial features of every person. Remove scratches, dust, cracks, stains, fading, and blur. Improve sharpness, contrast, and clarity carefully without making the image look artificial. Keep the original composition, clothing, pose, and historical feeling. Make the result photorealistic, respectful, clean, and print-ready. No text, no logo, no watermark.
```

## Template 2: Colorize Old Photo
```text
Colorize and restore this black and white photograph naturally. Preserve the exact identity, facial features, age, expression, hairstyle, clothing design, pose, and original composition. Add realistic natural colors based on the era, skin tones, clothing, and environment. Remove fading, dust, scratches, and stains while keeping the photo authentic and respectful. Photorealistic, clean, print-ready. No text, no logo, no watermark.
```

## Template 3: Family Merge
```text
Create one realistic family portrait using the uploaded reference photos. Preserve each person's exact identity, facial features, age, hairstyle, skin tone, and natural expression. Place them together naturally in one believable studio portrait composition with matching lighting, camera angle, perspective, skin tone consistency, and realistic shadows. Do not change their faces. Do not make them look like different people. Do not over-beautify. Final image must look like a real photograph and be suitable for premium printing. No text, no logo, no watermark.
```

## Template 4: AI Studio Portrait
```text
Create a clean realistic studio portrait based on the uploaded person photo. Preserve the exact identity, face shape, eyes, nose, mouth, hairstyle, age, skin tone, and expression. Improve lighting, background, clarity, and professional portrait quality. Use a modern studio background, soft flattering light, natural skin texture, and premium camera look. Do not change the person into someone else. Photorealistic, high-quality, print-ready. No text, no logo, no watermark.
```

## Template 5: Product Photo Background Upgrade
```text
Improve this product photo for ecommerce. Preserve the exact product shape, color, material, logo, label, proportions, and details. Clean the background and place the product in a premium minimal studio setting with soft shadows, realistic lighting, and high-end ecommerce presentation. Do not distort the product. No fake text. No watermark. Print-ready and web-ready.
```
