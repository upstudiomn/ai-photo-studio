import "server-only";
import { getTemplateBySlug } from "@/lib/templates";
import { demoProductChoices } from "@/lib/preview-flow";
import { mockImageProvider } from "@/server/ai/mock";
import { getImageProvider, getActiveAIProvider } from "@/server/ai/provider";
import { uploadGeneratedPreview, uploadGeneratedPreviewFromUrl, loadImageFromStorageAsBase64 } from "@/server/storage";
import { SOURCE_IMAGES_BUCKET } from "@/server/storage";
import { db } from "@/server/db/database-repo";
import type { Database, GenerationSessionStatus, OrderStatus } from "@/types/database";
import type { ProductChoiceId } from "@/types/studio";

type GenerationSessionInsert = Database["public"]["Tables"]["generation_sessions"]["Insert"];
type GenerationSessionUpdate = Database["public"]["Tables"]["generation_sessions"]["Update"];
type UploadedImageInsert = Database["public"]["Tables"]["uploaded_images"]["Insert"];
type GeneratedOutputInsert = Database["public"]["Tables"]["generated_outputs"]["Insert"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
type PrintJobInsert = Database["public"]["Tables"]["print_jobs"]["Insert"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];

export async function createGenerationSession(input: GenerationSessionInsert = {}) {
  return db.createGenerationSession(input);
}

export async function getGenerationSessionById(id: string) {
  return db.getGenerationSessionById(id);
}

export async function getAITemplateBySlug(slug: string) {
  return db.getTemplateBySlug(slug);
}

export async function getAITemplateById(id: string) {
  return db.getTemplateById(id);
}

export async function listActiveAITemplates() {
  return db.listActiveTemplates();
}

export async function updateGenerationSessionStatus(
  id: string,
  status: GenerationSessionStatus,
  patch: Omit<GenerationSessionUpdate, "status"> = {},
) {
  return db.updateGenerationSessionStatus(id, status, patch);
}

export async function selectSessionTemplate(sessionId: string, templateId: string) {
  return db.selectSessionTemplate(sessionId, templateId);
}

export async function selectSessionTemplateBySlug(sessionId: string, templateSlug: string) {
  try {
    const template = await getAITemplateBySlug(templateSlug);
    return selectSessionTemplate(sessionId, template.id);
  } catch (error) {
    console.warn("Template was not found. Marking session as template_selected without template_id.", error);
    return updateGenerationSessionStatus(sessionId, "template_selected");
  }
}

export async function addUploadedImage(input: UploadedImageInsert) {
  return db.addUploadedImage(input);
}

export async function listSessionUploadedImages(sessionId: string) {
  return db.listSessionUploadedImages(sessionId);
}

export async function saveGeneratedOutput(input: GeneratedOutputInsert) {
  return db.saveGeneratedOutput(input);
}

export async function createMockGeneratedOutputsForSession(sessionId: string, templateSlug?: string | null) {
  const existingOutputs = await listSessionGeneratedOutputs(sessionId);

  if (existingOutputs.length > 0) {
    await updateGenerationSessionStatus(sessionId, "preview_ready");
    return existingOutputs;
  }

  const session = await getGenerationSessionById(sessionId);
  const dbTemplate = session.template_id ? await getAITemplateById(session.template_id) : null;
  const localTemplate = getTemplateBySlug(templateSlug ?? "") ?? getTemplateBySlug("old-photo-restoration");
  const provider = getImageProvider();
  const activeProvider = getActiveAIProvider();

  await updateGenerationSessionStatus(sessionId, "generating");

  // Load uploaded images from storage if available
  let imageUrls: string[] = [];
  try {
    const uploadedImages = await listSessionUploadedImages(sessionId);
    if (uploadedImages.length > 0) {
      // Load first uploaded image as base64 data URL
      const firstImage = uploadedImages[0];
      const loadedImage = await loadImageFromStorageAsBase64(SOURCE_IMAGES_BUCKET, firstImage.file_url);
      imageUrls = [loadedImage.dataUrl];
      console.log(`Loaded uploaded image from storage: ${firstImage.file_url}`);
    }
  } catch (imageError) {
    console.warn("Could not load uploaded image from storage:", imageError);
    // Continue without image input
  }

  let generated;
  const generateInput = {
    templateId: dbTemplate?.id ?? localTemplate?.id ?? "template",
    prompt: dbTemplate?.prompt ?? localTemplate?.prompt ?? "Create a clean premium AI photo preview.",
    imageUrls,
    aspectRatio: dbTemplate?.default_aspect_ratio ?? localTemplate?.defaultAspectRatio ?? "A4",
  };

  try {
    generated = await provider.generate(generateInput);
  } catch (error) {
    console.error(`AI provider ${activeProvider} failed, falling back to mock:`, error);

    if (activeProvider === "mock") {
      await updateGenerationSessionStatus(sessionId, "failed");
      return [];
    }

    generated = await mockImageProvider.generate(generateInput);
  }

  // Save outputs to database and storage
  const rows = [];
  for (const output of generated.slice(0, 3)) {
    let previewUrl = output.previewUrl;
    let watermarkedUrl = output.previewUrl;

    // If provider returns base64 data URL, save to storage.
    if (previewUrl.startsWith("data:")) {
      try {
        const base64Match = previewUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (base64Match) {
          const mimeType = base64Match[1];
          const base64Data = base64Match[2];
          const buffer = Buffer.from(base64Data, "base64");
          const uploaded = await uploadGeneratedPreview(sessionId, buffer, mimeType);
          previewUrl = uploaded.fileUrl;
          watermarkedUrl = uploaded.fileUrl;
        }
      } catch (uploadError) {
        console.error("Failed to upload generated output to storage:", uploadError);
        // Keep the data URL as fallback
      }
    }

    if (output.provider === "replicate" && /^https?:\/\//.test(previewUrl)) {
      try {
        const uploaded = await uploadGeneratedPreviewFromUrl(sessionId, previewUrl);
        previewUrl = uploaded.fileUrl;
        watermarkedUrl = uploaded.fileUrl;
      } catch (uploadError) {
        console.error("Failed to upload Replicate output to storage:", uploadError);
      }
    }

    rows.push({
      session_id: sessionId,
      provider: output.provider,
      model: output.model,
      preview_url: previewUrl,
      watermarked_url: watermarkedUrl,
      full_res_url: output.fullResUrl ?? null,
      is_selected: false,
    });
  }

  for (const row of rows) {
    await saveGeneratedOutput(row);
  }

  await updateGenerationSessionStatus(sessionId, "preview_ready");

  return listSessionGeneratedOutputs(sessionId);
}

export async function listSessionGeneratedOutputs(sessionId: string) {
  return db.listSessionGeneratedOutputs(sessionId);
}

export async function selectGeneratedOutput(sessionId: string, outputId: string) {
  return db.selectGeneratedOutput(sessionId, outputId);
}

export async function createOrderFromSession(input: OrderInsert) {
  return db.createOrder(input);
}

export async function convertSessionToOrder(input: OrderInsert) {
  return createOrderFromSession(input);
}

export async function createOrderItem(input: OrderItemInsert) {
  return db.createOrderItem(input);
}

export async function createManualPayment(input: PaymentInsert) {
  return db.createPayment(input);
}

export async function getConfirmedOrderById(id: string) {
  return db.getOrderById(id);
}

export async function getConfirmedOrderDetailById(id: string) {
  return db.getOrderDetailById(id);
}

export async function createCheckoutOrderFromSession(input: {
  sessionId: string;
  outputId: string;
  productId: ProductChoiceId;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
}) {
  const product = demoProductChoices.find((choice) => choice.id === input.productId);

  if (!product) {
    throw new Error("Invalid product choice.");
  }

  const output = await selectGeneratedOutput(input.sessionId, input.outputId);
  const session = await getGenerationSessionById(input.sessionId);
  const order = await createOrderFromSession({
    user_id: session.user_id,
    session_id: input.sessionId,
    selected_output_id: output.id,
    status: "pending_payment",
    payment_status: "pending",
    customer_name: input.customerName ?? null,
    customer_phone: input.customerPhone ?? null,
    delivery_address: input.deliveryAddress ?? null,
    total_price: product.priceMnt,
  });

  await createOrderItem({
    order_id: order.id,
    item_type: product.id,
    title: product.titleMn,
    quantity: 1,
    unit_price: product.priceMnt,
    total_price: product.priceMnt,
  });

  if (product.includesPrint) {
    await createPrintJob({
      order_id: order.id,
      status: "print_ready",
      print_size: product.printSize ?? null,
      paper_type: "premium",
      delivery_address: input.deliveryAddress ?? null,
    });
  }

  await createManualPayment({
    order_id: order.id,
    provider: "manual",
    amount: product.priceMnt,
    currency: "MNT",
    status: "pending",
  });

  return order;
}

export async function listAdminOrders(limit = 50) {
  return db.listAdminOrders(limit);
}

export async function updateOrderStatus(id: string, status: OrderStatus, patch: Omit<OrderUpdate, "status"> = {}) {
  return db.updateOrderStatus(id, status, patch);
}

export async function createPrintJob(input: PrintJobInsert) {
  return db.createPrintJob(input);
}
