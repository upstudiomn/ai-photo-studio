import type { AITemplate } from "@/types/studio";

const identityBlock =
  "Preserve the exact identity, facial features, face shape, eye shape, nose, mouth, hairstyle, age, skin tone, expression, pose, and natural proportions of every person. Do not change the person into someone else. Do not over-beautify. Do not change age or ethnicity.";

const outputBlock =
  "Output must be photorealistic, clean, high-quality, print-ready, natural, and suitable for premium photo printing. No text, no logo, no watermark.";

export const aiTemplates: AITemplate[] = [
  {
    id: "tpl_restore",
    slug: "old-photo-restoration",
    titleMn: "Хуучин зураг сэргээх",
    titleEn: "Old Photo Restoration",
    category: "Restoration",
    descriptionMn: "Зураас, тоос, бүдгэрэлтийг цэвэрлэж дурсамжийн зургийг байгалийн харагдацтай сэргээнэ.",
    descriptionEn: "Clean scratches, dust, fading, and blur while preserving the natural look of treasured old photos.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 1,
    requiredImagesMax: 1,
    prompt:
      "Restore this old damaged photograph naturally. Preserve the exact identity and facial features of every person. Remove scratches, dust, cracks, stains, fading, and blur. Improve sharpness, contrast, and clarity carefully without making the image look artificial. Keep the original composition, clothing, pose, and historical feeling. Make the result photorealistic, respectful, clean, and print-ready. No text, no logo, no watermark.",
    defaultAspectRatio: "A4",
    outputType: "both",
    requiresAdminReview: false,
    isActive: true,
    startingPriceMnt: 15000,
    badge: "MVP",
  },
  {
    id: "tpl_colorize",
    slug: "black-white-colorization",
    titleMn: "Хар цагаан зураг өнгө оруулах",
    titleEn: "Black and White Colorization",
    category: "Restoration",
    descriptionMn: "Хуучин хар цагаан зургийг өнгө оруулж, тоос зураасыг хамт цэвэрлэнэ.",
    descriptionEn: "Add realistic color to black and white photos while cleaning dust, scratches, and fading.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 1,
    requiredImagesMax: 1,
    prompt:
      "Colorize and restore this black and white photograph naturally. Preserve the exact identity, facial features, age, expression, hairstyle, clothing design, pose, and original composition. Add realistic natural colors based on the era, skin tones, clothing, and environment. Remove fading, dust, scratches, and stains while keeping the photo authentic and respectful. Photorealistic, clean, print-ready. No text, no logo, no watermark.",
    defaultAspectRatio: "A4",
    outputType: "both",
    requiresAdminReview: false,
    isActive: true,
    startingPriceMnt: 19000,
    badge: "MVP",
  },
  {
    id: "tpl_repair",
    slug: "scratch-damage-removal",
    titleMn: "Зураас, гэмтэл арилгах",
    titleEn: "Scratch and Damage Removal",
    category: "Repair",
    descriptionMn: "Нугалаа, цууралт, толбо, гэмтлийг засаж эх зургийн зохиомжийг хадгална.",
    descriptionEn: "Repair folds, cracks, stains, and damage while keeping the original composition intact.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 1,
    requiredImagesMax: 1,
    prompt:
      "Repair this damaged photo while keeping the original photo realistic and unchanged in identity. Remove visible scratches, dust, stains, cracks, folds, and damaged marks. Preserve all faces, clothing, pose, background layout, and original composition. Improve clarity and contrast only where needed. Do not create a new person or change the scene. Clean, natural, print-ready result. No text, no logo, no watermark.",
    defaultAspectRatio: "A4",
    outputType: "both",
    requiresAdminReview: false,
    isActive: true,
    startingPriceMnt: 15000,
    badge: "MVP",
  },
  {
    id: "tpl_portrait",
    slug: "ai-studio-portrait",
    titleMn: "AI студийн хөрөг",
    titleEn: "AI Studio Portrait",
    category: "Portrait",
    descriptionMn: "Reference зураг дээр тулгуурлан гэрэл, фон, студийн чанарыг сайжруулсан хөрөг үүсгэнэ.",
    descriptionEn: "Create a polished studio portrait from your reference photo with refined lighting and background.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 1,
    requiredImagesMax: 3,
    prompt:
      "Create a clean realistic studio portrait based on the uploaded person photo. Preserve the exact identity, face shape, eyes, nose, mouth, hairstyle, age, skin tone, and expression. Improve lighting, background, clarity, and professional portrait quality. Use a modern studio background, soft flattering light, natural skin texture, and premium camera look. Do not change the person into someone else. Photorealistic, high-quality, print-ready. No text, no logo, no watermark.",
    defaultAspectRatio: "4:5",
    outputType: "both",
    requiresAdminReview: true,
    isActive: true,
    startingPriceMnt: 29000,
    badge: "Review",
  },
  {
    id: "tpl_product",
    slug: "product-background-upgrade",
    titleMn: "Бүтээгдэхүүний фон сайжруулах",
    titleEn: "Product Photo Background Upgrade",
    category: "Business",
    descriptionMn: "Бүтээгдэхүүний хэлбэр, өнгө, шошгыг хадгалж ecommerce-д тохиромжтой фон үүсгэнэ.",
    descriptionEn: "Upgrade product backgrounds for ecommerce while preserving shape, color, labels, and details.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 1,
    requiredImagesMax: 3,
    prompt:
      "Improve this product photo for ecommerce. Preserve the exact product shape, color, material, logo, label, proportions, and details. Clean the background and place the product in a premium minimal studio setting with soft shadows, realistic lighting, and high-end ecommerce presentation. Do not distort the product. No fake text. No watermark. Print-ready and web-ready.",
    defaultAspectRatio: "1:1",
    outputType: "both",
    requiresAdminReview: false,
    isActive: true,
    startingPriceMnt: 25000,
    badge: "Business",
  },
  {
    id: "tpl_family",
    slug: "family-merge-beta",
    titleMn: "Гэр бүлийн зураг нэгтгэх beta",
    titleEn: "Family Merge Beta",
    category: "Family",
    descriptionMn: "Тусдаа зургуудыг нэг premium гэр бүлийн хөрөг болгон нэгтгэх beta үйлчилгээ.",
    descriptionEn: "Combine separate reference photos into one premium family portrait for gifting or print.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 2,
    requiredImagesMax: 5,
    prompt: `${identityBlock} Create one realistic family portrait using the uploaded reference photos. Place them together naturally in one believable studio portrait composition with matching lighting, camera angle, perspective, skin tone consistency, and realistic shadows. ${outputBlock}`,
    defaultAspectRatio: "A3",
    outputType: "both",
    requiresAdminReview: true,
    isActive: true,
    startingPriceMnt: 59000,
    badge: "Beta",
  },
  {
    id: "tpl_couple",
    slug: "couple-cinematic-portrait-beta",
    titleMn: "Хосын cinematic хөрөг beta",
    titleEn: "Couple Cinematic Portrait Beta",
    category: "Gift",
    descriptionMn: "Хосын reference зургаас дулаан, cinematic premium хөрөг үүсгэнэ.",
    descriptionEn: "Create a warm cinematic couple portrait from reference photos with a premium finish.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 2,
    requiredImagesMax: 4,
    prompt: `${identityBlock} Create a realistic premium couple portrait using the uploaded reference photos. Place them together naturally in a cinematic romantic portrait composition with matching lighting, realistic shadows, and premium camera look. ${outputBlock}`,
    defaultAspectRatio: "4:5",
    outputType: "both",
    requiresAdminReview: true,
    isActive: true,
    startingPriceMnt: 49000,
    badge: "Beta",
  },
  {
    id: "tpl_kids",
    slug: "kids-storybook-poster-beta",
    titleMn: "Хүүхдийн storybook poster beta",
    titleEn: "Kids Storybook Poster Beta",
    category: "Kids",
    descriptionMn: "Хүүхдийн царай төрхийг хадгалсан зөөлөн үлгэрийн poster хэв маяг.",
    descriptionEn: "Turn a child's photo into a soft storybook-style poster while keeping them recognizable.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 1,
    requiredImagesMax: 2,
    prompt:
      "Transform the child into a magical storybook-style portrait while preserving the child's face, identity, expression, hairstyle, and pose. Create a soft dreamy illustrated environment with warm lighting, gentle colors, and premium children's book art style. Keep the child recognizable and natural. No text, no logo, no watermark. Print-ready composition.",
    defaultAspectRatio: "A4",
    outputType: "both",
    requiresAdminReview: true,
    isActive: true,
    startingPriceMnt: 39000,
    badge: "Beta",
  },
  {
    id: "tpl_pet",
    slug: "pet-portrait-beta",
    titleMn: "Амьтны premium хөрөг beta",
    titleEn: "Pet Portrait Beta",
    category: "Gift",
    descriptionMn: "Тэжээвэр амьтны онцлог, өнгө, зан төрхийг хадгалсан premium хөрөг.",
    descriptionEn: "Create a premium pet portrait while preserving your pet's markings, character, and expression.",
    previewImageUrl:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
    requiredImagesMin: 1,
    requiredImagesMax: 3,
    prompt:
      "Create a premium pet portrait based on the uploaded pet photo. Preserve the pet's exact breed, face, fur color, markings, eyes, expression, and body shape. Improve lighting and composition. Use a clean studio or elegant artistic background. Do not change the pet into a different animal. High-quality, cute, premium, print-ready. No text, no logo, no watermark.",
    defaultAspectRatio: "4:5",
    outputType: "both",
    requiresAdminReview: true,
    isActive: true,
    startingPriceMnt: 29000,
    badge: "Beta",
  },
];

export function getTemplateBySlug(slug: string) {
  return aiTemplates.find((template) => template.slug === slug);
}

export function getTemplateById(id: string) {
  return aiTemplates.find((template) => template.id === id);
}

export function getTemplateDisplayTitle(template: Pick<AITemplate, "titleEn" | "titleMn">) {
  return template.titleEn || "Template";
}

export function getTemplateDisplayDescription(template: Pick<AITemplate, "descriptionEn" | "descriptionMn">) {
  return template.descriptionEn || "No English description available.";
}

export function getTemplateDisplayDescriptionBySlug(slug?: string | null) {
  if (!slug) return "No English description available.";

  return getTemplateBySlug(slug)?.descriptionEn ?? "No English description available.";
}
