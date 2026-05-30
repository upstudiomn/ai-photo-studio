import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isLocalDatabaseMode } from "@/lib/db/mode";
import { getTemplateBySlug } from "@/lib/templates";
import { demoProductChoices } from "@/lib/preview-flow";
import { mockImageProvider } from "@/server/ai/mock";
import { getImageProvider, getActiveAIProvider } from "@/server/ai/provider";
import { uploadGeneratedPreview, uploadGeneratedPreviewFromUrl, loadImageFromStorageAsBase64 } from "@/server/storage";
import { SOURCE_IMAGES_BUCKET } from "@/server/storage";
import {
  addLocalUploadedImage,
  createLocalCheckoutOrderFromSession,
  createLocalGeneratedOutputs,
  createLocalGenerationSession,
  createLocalManualPayment,
  createLocalMockGeneratedOutputsForSession,
  createLocalOrderFromSession,
  createLocalOrderItem,
  createLocalPrintJob,
  getLocalConfirmedOrderById,
  getLocalConfirmedOrderDetailById,
  getLocalGenerationSessionById,
  getLocalTemplateById,
  getLocalTemplateBySlug,
  listLocalAdminOrders,
  listLocalGeneratedOutputs,
  listLocalTemplates,
  listLocalUploadedImages,
  selectLocalGeneratedOutput,
  selectLocalSessionTemplate,
  selectLocalSessionTemplateBySlug,
  updateLocalSessionStatus,
  updateLocalOrderStatus,
} from "@/server/local-data";
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
  if (isLocalDatabaseMode()) {
    return createLocalGenerationSession(input);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("generation_sessions").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getGenerationSessionById(id: string) {
  if (isLocalDatabaseMode()) {
    return getLocalGenerationSessionById(id);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("generation_sessions").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAITemplateBySlug(slug: string) {
  if (isLocalDatabaseMode()) {
    return getLocalTemplateBySlug(slug);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("ai_templates").select("*").eq("slug", slug).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAITemplateById(id: string) {
  if (isLocalDatabaseMode()) {
    return getLocalTemplateById(id);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("ai_templates").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listActiveAITemplates() {
  if (isLocalDatabaseMode()) {
    return listLocalTemplates();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ai_templates")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateGenerationSessionStatus(
  id: string,
  status: GenerationSessionStatus,
  patch: Omit<GenerationSessionUpdate, "status"> = {},
) {
  if (isLocalDatabaseMode()) {
    return updateLocalSessionStatus(id, status, patch);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("generation_sessions")
    .update({
      ...patch,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function selectSessionTemplate(sessionId: string, templateId: string) {
  if (isLocalDatabaseMode()) {
    return selectLocalSessionTemplate(sessionId, templateId);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("generation_sessions")
    .update({
      template_id: templateId,
      status: "template_selected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function selectSessionTemplateBySlug(sessionId: string, templateSlug: string) {
  if (isLocalDatabaseMode()) {
    return selectLocalSessionTemplateBySlug(sessionId, templateSlug);
  }

  try {
    const template = await getAITemplateBySlug(templateSlug);

    return selectSessionTemplate(sessionId, template.id);
  } catch (error) {
    console.warn("Template was not found in Supabase. Marking session as template_selected without template_id.", error);

    return updateGenerationSessionStatus(sessionId, "template_selected");
  }
}

export async function addUploadedImage(input: UploadedImageInsert) {
  if (isLocalDatabaseMode()) {
    return addLocalUploadedImage(input);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("uploaded_images").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listSessionUploadedImages(sessionId: string) {
  if (isLocalDatabaseMode()) {
    return listLocalUploadedImages(sessionId);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("uploaded_images")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function saveGeneratedOutput(input: GeneratedOutputInsert) {
  if (isLocalDatabaseMode()) {
    const [output] = await createLocalGeneratedOutputs(input);
    return output;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("generated_outputs").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createMockGeneratedOutputsForSession(sessionId: string, templateSlug?: string | null) {
  if (isLocalDatabaseMode()) {
    return createLocalMockGeneratedOutputsForSession(sessionId, templateSlug);
  }

  const existingOutputs = await listSessionGeneratedOutputs(sessionId);

  if (existingOutputs.length > 0) {
    await updateGenerationSessionStatus(sessionId, "preview_ready");
    return existingOutputs;
  }

  const session = await getGenerationSessionById(sessionId);
  const supabase = createSupabaseAdminClient();
  const { data: dbTemplate } = session.template_id
    ? await supabase.from("ai_templates").select("*").eq("id", session.template_id).single()
    : await supabase.from("ai_templates").select("*").eq("slug", templateSlug ?? "").maybeSingle();
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
  if (isLocalDatabaseMode()) {
    return listLocalGeneratedOutputs(sessionId);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("generated_outputs")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function selectGeneratedOutput(sessionId: string, outputId: string) {
  if (isLocalDatabaseMode()) {
    return selectLocalGeneratedOutput(sessionId, outputId);
  }

  const supabase = createSupabaseAdminClient();

  const { error: resetError } = await supabase
    .from("generated_outputs")
    .update({ is_selected: false })
    .eq("session_id", sessionId);

  if (resetError) {
    throw resetError;
  }

  const { data, error } = await supabase
    .from("generated_outputs")
    .update({ is_selected: true })
    .eq("id", outputId)
    .eq("session_id", sessionId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const { error: sessionError } = await supabase
    .from("generation_sessions")
    .update({
      selected_output_id: outputId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (sessionError) {
    throw sessionError;
  }

  return data;
}

export async function createOrderFromSession(input: OrderInsert) {
  if (isLocalDatabaseMode()) {
    return createLocalOrderFromSession(input);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("orders").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  const { error: sessionError } = await supabase
    .from("generation_sessions")
    .update({
      status: "converted_to_order",
      converted_order_id: data.id,
      selected_output_id: data.selected_output_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", data.session_id);

  if (sessionError) {
    throw sessionError;
  }

  return data;
}

export async function convertSessionToOrder(input: OrderInsert) {
  return createOrderFromSession(input);
}

export async function createOrderItem(input: OrderItemInsert) {
  if (isLocalDatabaseMode()) {
    return createLocalOrderItem(input);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("order_items").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createManualPayment(input: PaymentInsert) {
  if (isLocalDatabaseMode()) {
    return createLocalManualPayment(input);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("payments").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getConfirmedOrderById(id: string) {
  if (isLocalDatabaseMode()) {
    return getLocalConfirmedOrderById(id);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getConfirmedOrderDetailById(id: string) {
  if (isLocalDatabaseMode()) {
    return getLocalConfirmedOrderDetailById(id);
  }

  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  const [items, payments, printJobs, output, session, uploadedImages] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", id),
    supabase.from("payments").select("*").eq("order_id", id),
    supabase.from("print_jobs").select("*").eq("order_id", id),
    order.selected_output_id
      ? supabase.from("generated_outputs").select("*").eq("id", order.selected_output_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("generation_sessions").select("*, ai_templates(*)").eq("id", order.session_id).maybeSingle(),
    supabase.from("uploaded_images").select("*").eq("session_id", order.session_id).order("created_at", { ascending: true }),
  ]);

  const tableError = items.error ?? payments.error ?? printJobs.error ?? output.error ?? session.error ?? uploadedImages.error;

  if (tableError) {
    throw tableError;
  }

  return {
    order,
    items: items.data ?? [],
    payments: payments.data ?? [],
    printJobs: printJobs.data ?? [],
    selectedOutput: output.data,
    session: session.data,
    uploadedImages: uploadedImages.data ?? [],
  };
}

export async function createCheckoutOrderFromSession(input: {
  sessionId: string;
  outputId: string;
  productId: ProductChoiceId;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
}) {
  if (isLocalDatabaseMode()) {
    return createLocalCheckoutOrderFromSession(input);
  }

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
  if (isLocalDatabaseMode()) {
    return listLocalAdminOrders(limit);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, generation_sessions(*), order_items(*), print_jobs(*), payments(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus, patch: Omit<OrderUpdate, "status"> = {}) {
  if (isLocalDatabaseMode()) {
    return updateLocalOrderStatus(id, status);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      ...patch,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createPrintJob(input: PrintJobInsert) {
  if (isLocalDatabaseMode()) {
    return createLocalPrintJob(input);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("print_jobs").insert(input).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}
