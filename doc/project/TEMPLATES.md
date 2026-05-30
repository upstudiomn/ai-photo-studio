# AI Photo Studio Initial Templates

Current implementation status:

- Template data exists in code and seed data.
- Visible UI should use English fields (`titleEn`, `descriptionEn`, `badge`, `startingPriceMnt`) or English fallback.
- Mongolian/internal fields such as `titleMn` and `descriptionMn` may remain for seed/demo/history, but should not drive visible English UI unless explicitly localized later.
- Face-sensitive beta templates require admin review before final delivery.

## Template categories

### Safe MVP templates
These can be tested first and are safer for automation.

1. Old Photo Restoration
2. Black and White Colorization
3. Scratch and Damage Removal
4. AI Studio Portrait
5. Product Photo Background Upgrade

### Beta templates requiring admin review
These are more face-sensitive and should not auto-deliver.

6. Family Merge
7. Couple Cinematic Portrait
8. Kids Storybook Poster
9. Pet Portrait

## Universal identity block

```text
Preserve the exact identity, facial features, face shape, eye shape, nose, mouth, hairstyle, age, skin tone, expression, pose, and natural proportions of every person. Do not change the person into someone else. Do not over-beautify. Do not change age or ethnicity.
```

## Universal output block

```text
Output must be photorealistic, clean, high-quality, print-ready, natural, and suitable for premium photo printing. No text, no logo, no watermark.
```

## 1. Old Photo Restoration

```text
Restore this old damaged photograph naturally. Preserve the exact identity and facial features of every person. Remove scratches, dust, cracks, stains, fading, and blur. Improve sharpness, contrast, and clarity carefully without making the image look artificial. Keep the original composition, clothing, pose, and historical feeling. Make the result photorealistic, respectful, clean, and print-ready. No text, no logo, no watermark.
```

## 2. Black and White Colorization

```text
Colorize and restore this black and white photograph naturally. Preserve the exact identity, facial features, age, expression, hairstyle, clothing design, pose, and original composition. Add realistic natural colors based on the era, skin tones, clothing, and environment. Remove fading, dust, scratches, and stains while keeping the photo authentic and respectful. Photorealistic, clean, print-ready. No text, no logo, no watermark.
```

## 3. Scratch and Damage Removal

```text
Repair this damaged photo while keeping the original photo realistic and unchanged in identity. Remove visible scratches, dust, stains, cracks, folds, and damaged marks. Preserve all faces, clothing, pose, background layout, and original composition. Improve clarity and contrast only where needed. Do not create a new person or change the scene. Clean, natural, print-ready result. No text, no logo, no watermark.
```

## 4. AI Studio Portrait

```text
Create a clean realistic studio portrait based on the uploaded person photo. Preserve the exact identity, face shape, eyes, nose, mouth, hairstyle, age, skin tone, and expression. Improve lighting, background, clarity, and professional portrait quality. Use a modern studio background, soft flattering light, natural skin texture, and premium camera look. Do not change the person into someone else. Photorealistic, high-quality, print-ready. No text, no logo, no watermark.
```

## 5. Product Photo Background Upgrade

```text
Improve this product photo for ecommerce. Preserve the exact product shape, color, material, logo, label, proportions, and details. Clean the background and place the product in a premium minimal studio setting with soft shadows, realistic lighting, and high-end ecommerce presentation. Do not distort the product. No fake text. No watermark. Print-ready and web-ready.
```

## 6. Family Merge

```text
Create one realistic family portrait using the uploaded reference photos. Preserve each person's exact identity, facial features, age, hairstyle, skin tone, and natural expression. Place them together naturally in one believable studio portrait composition with matching lighting, camera angle, perspective, skin tone consistency, and realistic shadows. Do not change their faces. Do not make them look like different people. Do not over-beautify. Final image must look like a real photograph and be suitable for premium printing. No text, no logo, no watermark.
```

## 7. Couple Cinematic Portrait

```text
Create a realistic premium couple portrait using the uploaded reference photos. Preserve both people's exact identity, facial features, age, hairstyle, skin tone, and expression. Place them together naturally in a cinematic romantic portrait composition with matching lighting, realistic shadows, and premium camera look. Do not change their faces or make them look like different people. Photorealistic, warm, elegant, print-ready. No text, no logo, no watermark.
```

## 8. Kids Storybook Poster

```text
Transform the child into a magical storybook-style portrait while preserving the child's face, identity, expression, hairstyle, and pose. Create a soft dreamy illustrated environment with warm lighting, gentle colors, and premium children's book art style. Keep the child recognizable and natural. No text, no logo, no watermark. Print-ready composition.
```

## 9. Pet Portrait

```text
Create a premium pet portrait based on the uploaded pet photo. Preserve the pet's exact breed, face, fur color, markings, eyes, expression, and body shape. Improve lighting and composition. Use a clean studio or elegant artistic background. Do not change the pet into a different animal. High-quality, cute, premium, print-ready. No text, no logo, no watermark.
```
