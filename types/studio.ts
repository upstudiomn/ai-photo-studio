export type AspectRatio = "1:1" | "4:5" | "3:4" | "2:3" | "A4" | "A3";

export type OutputType = "digital" | "print-ready" | "both";

export type AITemplate = {
  id: string;
  slug: string;
  titleMn: string;
  titleEn: string;
  category: string;
  descriptionMn: string;
  descriptionEn: string;
  previewImageUrl: string;
  requiredImagesMin: number;
  requiredImagesMax: number;
  prompt: string;
  negativePrompt?: string;
  defaultAspectRatio: AspectRatio;
  outputType: OutputType;
  requiresAdminReview: boolean;
  isActive: boolean;
  startingPriceMnt: number;
  badge?: string;
};

export type OrderStatus =
  | "uploaded"
  | "ai_processing"
  | "preview_ready"
  | "waiting_approval"
  | "payment_pending"
  | "paid"
  | "print_ready"
  | "printing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "revision_requested";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "refunded";

export type PrintOption = {
  id: string;
  label: string;
  description: string;
  priceMnt: number;
  size?: "A4" | "A3";
  paper?: "matte" | "satin" | "lustre";
};

export type UploadedImage = {
  id: string;
  fileUrl: string;
  fileName: string;
  imageType: "source" | "reference";
};

export type GeneratedOutput = {
  id: string;
  sessionId?: string;
  title?: string;
  previewUrl: string;
  watermarkedUrl: string;
  fullResUrl?: string;
  watermarkLabel?: string;
  isSelected: boolean;
};

export type ProductChoiceId = "digital_file" | "a4_print" | "a3_print" | "digital_plus_print";

export type ProductChoice = {
  id: ProductChoiceId;
  titleMn: string;
  descriptionMn: string;
  priceMnt: number;
  includesDigital: boolean;
  includesPrint: boolean;
  printSize?: "A4" | "A3";
};

export type GenerationSessionStatus =
  | "draft"
  | "uploaded"
  | "template_selected"
  | "generating"
  | "preview_ready"
  | "failed"
  | "converted_to_order";

export type GenerationSession = {
  id: string;
  templateId?: string;
  selectedTemplateSlug?: string;
  status: GenerationSessionStatus;
  customerNote?: string;
  uploadedImages: UploadedImage[];
  generatedOutputs: GeneratedOutput[];
  selectedOutputId?: string;
  selectedProductType?: ProductChoiceId;
};

export type ConfirmedOrder = {
  id: string;
  sessionId: string;
  selectedOutputId: string;
  selectedProductType: ProductChoiceId;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  totalPriceMnt: number;
};

export type StudioOrder = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNote: string;
  templateId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  printOption: string;
  printSize?: "A4" | "A3";
  deliveryAddress?: string;
  totalPriceMnt: number;
  createdAt: string;
  uploadedImages: UploadedImage[];
  generatedOutputs: GeneratedOutput[];
  selectedOutputId?: string;
};
