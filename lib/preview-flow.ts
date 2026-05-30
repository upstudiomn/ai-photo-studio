import { aiTemplates, getTemplateBySlug } from "@/lib/templates";
import type { ConfirmedOrder, GeneratedOutput, GenerationSession, ProductChoice, ProductChoiceId } from "@/types/studio";

export const DEMO_SESSION_ID = "demo-session-001";
export const DEMO_ORDER_ID = "demo-order-001";

export const demoUploadedImage = {
  id: "uploaded-image-1",
  fileUrl: aiTemplates[0].previewImageUrl,
  fileName: "family-memory-photo.jpg",
  imageType: "source" as const,
};

export const demoGeneratedOutputs: GeneratedOutput[] = [
  {
    id: "output-1",
    sessionId: DEMO_SESSION_ID,
    title: "Gently restored version",
    previewUrl: aiTemplates[2].previewImageUrl,
    watermarkedUrl: aiTemplates[2].previewImageUrl,
    watermarkLabel: "Watermark preview",
    isSelected: true,
  },
  {
    id: "output-2",
    sessionId: DEMO_SESSION_ID,
    title: "More vibrant color version",
    previewUrl: aiTemplates[1].previewImageUrl,
    watermarkedUrl: aiTemplates[1].previewImageUrl,
    watermarkLabel: "Watermark preview",
    isSelected: false,
  },
  {
    id: "output-3",
    sessionId: DEMO_SESSION_ID,
    title: "Print-ready premium version",
    previewUrl: aiTemplates[3].previewImageUrl,
    watermarkedUrl: aiTemplates[3].previewImageUrl,
    watermarkLabel: "Watermark preview",
    isSelected: false,
  },
];

export const demoProductChoices: ProductChoice[] = [
  {
    id: "digital_file",
    titleMn: "Download digital file",
    descriptionMn: "Get your final image as a file",
    priceMnt: 15000,
    includesDigital: true,
    includesPrint: false,
  },
  {
    id: "a4_print",
    titleMn: "A4 print",
    descriptionMn: "21 x 29.7 cm premium print",
    priceMnt: 39000,
    includesDigital: false,
    includesPrint: true,
    printSize: "A4",
  },
  {
    id: "a3_print",
    titleMn: "A3 print",
    descriptionMn: "29.7 x 42 cm poster print",
    priceMnt: 69000,
    includesDigital: false,
    includesPrint: true,
    printSize: "A3",
  },
  {
    id: "digital_plus_print",
    titleMn: "Digital + print",
    descriptionMn: "Get both file and print versions",
    priceMnt: 84000,
    includesDigital: true,
    includesPrint: true,
    printSize: "A3",
  },
];

export const demoSession: GenerationSession = {
  id: DEMO_SESSION_ID,
  templateId: aiTemplates[0].id,
  selectedTemplateSlug: aiTemplates[0].slug,
  status: "preview_ready",
  customerNote: "Gently restore colors and make print-ready.",
  uploadedImages: [demoUploadedImage],
  generatedOutputs: demoGeneratedOutputs,
  selectedOutputId: "output-1",
  selectedProductType: "digital_plus_print",
};

export const demoConfirmedOrder: ConfirmedOrder = {
  id: DEMO_ORDER_ID,
  sessionId: DEMO_SESSION_ID,
  selectedOutputId: demoSession.selectedOutputId ?? "output-1",
  selectedProductType: demoSession.selectedProductType ?? "digital_plus_print",
  paymentStatus: "pending",
  orderStatus: "payment_pending",
  totalPriceMnt: 84000,
};

export function getSessionById(sessionId?: string | null) {
  if (!sessionId || sessionId === DEMO_SESSION_ID) {
    return demoSession;
  }

  return {
    ...demoSession,
    id: sessionId,
  };
}

export function getDemoTemplate(slug?: string | null) {
  return (slug ? getTemplateBySlug(slug) : null) ?? getTemplateBySlug(demoSession.selectedTemplateSlug ?? "") ?? aiTemplates[0];
}

export function getSelectedOutput(outputId?: string | null) {
  return (
    demoGeneratedOutputs.find((output) => output.id === outputId) ??
    demoGeneratedOutputs.find((output) => output.id === demoSession.selectedOutputId) ??
    demoGeneratedOutputs[0]
  );
}

export function getOutputsWithSelection(outputId?: string | null) {
  const selectedOutput = getSelectedOutput(outputId);

  return demoGeneratedOutputs.map((output) => ({
    ...output,
    isSelected: output.id === selectedOutput.id,
  }));
}

export function getDemoProductChoice(productId?: string | null) {
  return (
    demoProductChoices.find((choice) => choice.id === productId) ??
    demoProductChoices.find((choice) => choice.id === demoSession.selectedProductType) ??
    demoProductChoices[0]
  );
}

export function isProductChoiceId(value: string | null | undefined): value is ProductChoiceId {
  return demoProductChoices.some((choice) => choice.id === value);
}

function hasCyrillic(value?: string | null) {
  return Boolean(value && /[\u0400-\u04FF]/.test(value));
}

export function getProductChoiceDisplayTitle(productId?: string | null, fallback?: string | null) {
  if (isProductChoiceId(productId)) return getDemoProductChoice(productId).titleMn;
  if (fallback && !hasCyrillic(fallback)) return fallback;

  return "Product selection";
}

export function getResultsHref(input: {
  sessionId?: string | null;
  templateSlug?: string | null;
  outputId?: string | null;
  productId?: string | null;
}) {
  const params = new URLSearchParams();

  if (input.templateSlug) params.set("template", input.templateSlug);
  if (input.outputId) params.set("output", input.outputId);
  if (input.productId && isProductChoiceId(input.productId)) params.set("product", input.productId);

  const query = params.toString();
  return `/results/${input.sessionId ?? DEMO_SESSION_ID}${query ? `?${query}` : ""}`;
}

export function getCheckoutHref(input: {
  sessionId?: string | null;
  outputId?: string | null;
  productId?: string | null;
}) {
  const params = new URLSearchParams();

  params.set("output", getSelectedOutput(input.outputId).id);
  params.set("product", getDemoProductChoice(input.productId).id);

  return `/checkout/${input.sessionId ?? DEMO_SESSION_ID}?${params.toString()}`;
}
