import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isLocalDatabaseMode } from "@/lib/db/mode";
import { getAdminAuth } from "@/server/admin-auth";
import {
  addLocalAdminOrderNote,
  getLocalAdminDashboardMetrics,
  getLocalAdminOrderDetail,
  listLocalAdminGenerationSessions,
  listLocalAdminOrderNotes,
  listLocalAdminOrders,
  listLocalAdminReviewOutputs,
  listLocalAdminTemplates,
  listLocalPrintJobs,
  updateLocalAdminTemplatePrompt,
  updateLocalOrderStatus,
  updateLocalPaymentStatus,
  updateLocalPrintJobStatus,
} from "@/server/local-data";
import type { Database } from "@/types/database";

type AITemplateRow = Database["public"]["Tables"]["ai_templates"]["Row"];
type GenerationSessionRow = Database["public"]["Tables"]["generation_sessions"]["Row"];
type UploadedImageRow = Database["public"]["Tables"]["uploaded_images"]["Row"];
type GeneratedOutputRow = Database["public"]["Tables"]["generated_outputs"]["Row"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type PrintJobRow = Database["public"]["Tables"]["print_jobs"]["Row"];
type AdminNoteRow = Database["public"]["Tables"]["admin_notes"]["Row"];

async function ensureAdminMutationAccess() {
  const admin = await getAdminAuth();

  if (!admin.ok) {
    return {
      success: false as const,
      error: admin.reason === "unauthenticated" ? "Authentication required" : "Admin access required",
    };
  }

  return { success: true as const, admin };
}

// Status types
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing_final"
  | "print_ready"
  | "printing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export type PrintJobStatus =
  | "print_ready"
  | "printing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

// Status validation
const VALID_ORDER_STATUSES: OrderStatus[] = [
  "pending_payment",
  "paid",
  "preparing_final",
  "print_ready",
  "printing",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const VALID_PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "pending", "paid", "failed", "refunded"];

const VALID_PRINT_STATUSES: PrintJobStatus[] = [
  "print_ready",
  "printing",
  "packed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function isValidOrderStatus(status: string): status is OrderStatus {
  return VALID_ORDER_STATUSES.includes(status as OrderStatus);
}

function isValidPaymentStatus(status: string): status is PaymentStatus {
  return VALID_PAYMENT_STATUSES.includes(status as PaymentStatus);
}

function isValidPrintStatus(status: string): status is PrintJobStatus {
  return VALID_PRINT_STATUSES.includes(status as PrintJobStatus);
}

export type AdminGenerationSession = GenerationSessionRow & {
  ai_templates: AITemplateRow | null;
  uploaded_images: Pick<UploadedImageRow, "id">[] | null;
  generated_outputs: Pick<GeneratedOutputRow, "id">[] | null;
};

export type AdminConfirmedOrder = OrderRow & {
  generation_sessions:
    | (GenerationSessionRow & {
        ai_templates: AITemplateRow | null;
      })
    | null;
  order_items: OrderItemRow[] | null;
  payments: PaymentRow[] | null;
  print_jobs: PrintJobRow[] | null;
};

export type AdminPrintJob = PrintJobRow & {
  orders:
    | (OrderRow & {
        generation_sessions:
          | (GenerationSessionRow & {
              ai_templates: AITemplateRow | null;
            })
          | null;
        order_items: OrderItemRow[] | null;
        payments: PaymentRow[] | null;
      })
    | null;
};

export type AdminReviewOutput = GeneratedOutputRow & {
  generation_sessions:
    | (GenerationSessionRow & {
        ai_templates: AITemplateRow | null;
      })
    | null;
};

export type AdminOrderDetail = {
  order: AdminConfirmedOrder;
  uploadedImages: UploadedImageRow[];
  generatedOutputs: GeneratedOutputRow[];
  selectedOutput: GeneratedOutputRow | null;
};

export type AdminDashboardMetrics = {
  activeSessions: number;
  previewReady: number;
  confirmedOrders: number;
  pendingPayment: number;
  printQueue: number;
  delivered: number;
};

export type AdminNote = AdminNoteRow;

export type AdminTemplatePromptPatch = {
  title_mn: string;
  title_en: string | null;
  description_mn: string | null;
  prompt: string;
  negative_prompt: string | null;
  is_active: boolean;
};

export async function listAdminGenerationSessions(limit = 50) {
  if (isLocalDatabaseMode()) {
    return listLocalAdminGenerationSessions(limit) as unknown as AdminGenerationSession[];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("generation_sessions")
    .select("*, ai_templates(*), uploaded_images(id), generated_outputs!generated_outputs_session_id_fkey(id)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as unknown as AdminGenerationSession[];
}

export async function listAdminConfirmedOrders(limit = 50) {
  if (isLocalDatabaseMode()) {
    return listLocalAdminOrders(limit) as unknown as AdminConfirmedOrder[];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, generation_sessions!orders_session_id_fkey(*, ai_templates(*)), order_items(*), payments(*), print_jobs(*)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as unknown as AdminConfirmedOrder[];
}

export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail> {
  if (isLocalDatabaseMode()) {
    return getLocalAdminOrderDetail(id) as unknown as AdminOrderDetail;
  }

  const supabase = createSupabaseAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, generation_sessions!orders_session_id_fkey(*, ai_templates(*)), order_items(*), payments(*), print_jobs(*)")
    .eq("id", id)
    .single();

  if (error) throw error;

  const typedOrder = order as unknown as AdminConfirmedOrder;
  const [uploadedImages, generatedOutputs, selectedOutput] = await Promise.all([
    supabase
      .from("uploaded_images")
      .select("*")
      .eq("session_id", typedOrder.session_id)
      .order("created_at", { ascending: true }),
    supabase
      .from("generated_outputs")
      .select("*")
      .eq("session_id", typedOrder.session_id)
      .order("created_at", { ascending: false }),
    typedOrder.selected_output_id
      ? supabase.from("generated_outputs").select("*").eq("id", typedOrder.selected_output_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const tableError = uploadedImages.error ?? generatedOutputs.error ?? selectedOutput.error;

  if (tableError) throw tableError;

  return {
    order: typedOrder,
    uploadedImages: uploadedImages.data ?? [],
    generatedOutputs: generatedOutputs.data ?? [],
    selectedOutput: selectedOutput.data,
  };
}

export async function listAdminPrintJobs(limit = 50) {
  if (isLocalDatabaseMode()) {
    return listLocalPrintJobs(limit) as unknown as AdminPrintJob[];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("print_jobs")
    .select("*, orders(*, generation_sessions!orders_session_id_fkey(*, ai_templates(*)), order_items(*), payments(*))")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as unknown as AdminPrintJob[];
}

export async function listAdminReviewOutputs(limit = 50) {
  if (isLocalDatabaseMode()) {
    return listLocalAdminReviewOutputs(limit) as unknown as AdminReviewOutput[];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("generated_outputs")
    .select("*, generation_sessions!generated_outputs_session_id_fkey(*, ai_templates(*))")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as unknown as AdminReviewOutput[];
}

export async function listAdminTemplates() {
  if (isLocalDatabaseMode()) {
    return listLocalAdminTemplates();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ai_templates")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data ?? [];
}

function cleanRequiredText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function cleanOptionalText(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

export async function updateAdminTemplatePrompt(
  templateId: string,
  patch: AdminTemplatePromptPatch,
): Promise<{ success: boolean; error?: string }> {
  const adminAccess = await ensureAdminMutationAccess();

  if (!adminAccess.success) {
    return adminAccess;
  }

  const nextPatch: AdminTemplatePromptPatch = {
    title_mn: cleanRequiredText(patch.title_mn),
    title_en: cleanOptionalText(patch.title_en),
    description_mn: cleanOptionalText(patch.description_mn),
    prompt: cleanRequiredText(patch.prompt),
    negative_prompt: cleanOptionalText(patch.negative_prompt),
    is_active: Boolean(patch.is_active),
  };

  if (!templateId) {
    return { success: false, error: "Missing template id" };
  }

  if (!nextPatch.title_mn) {
    return { success: false, error: "Template title is required" };
  }

  if (!nextPatch.prompt) {
    return { success: false, error: "Prompt is required" };
  }

  try {
    if (isLocalDatabaseMode()) {
      await updateLocalAdminTemplatePrompt(templateId, nextPatch);
      return { success: true };
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("ai_templates")
      .update({
        ...nextPatch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update template prompt";
    console.error("Failed to update template prompt.", error);
    return { success: false, error: message };
  }
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  if (isLocalDatabaseMode()) {
    return getLocalAdminDashboardMetrics();
  }

  const [sessions, orders, printJobs] = await Promise.all([
    listAdminGenerationSessions(500),
    listAdminConfirmedOrders(500),
    listAdminPrintJobs(500),
  ]);

  return {
    activeSessions: sessions.filter((item) => item.status !== "converted_to_order").length,
    previewReady: sessions.filter((item) => item.status === "preview_ready").length,
    confirmedOrders: orders.length,
    pendingPayment: orders.filter((item) => item.payment_status === "pending" || item.payment_status === "unpaid").length,
    printQueue: printJobs.filter((item) => item.status !== "delivered").length,
    delivered: orders.filter((item) => item.status === "delivered").length,
  };
}

// ============ Admin Update Functions ============

export async function updateAdminOrderStatus(orderId: string, status: string): Promise<{ success: boolean; error?: string }> {
  const adminAccess = await ensureAdminMutationAccess();

  if (!adminAccess.success) {
    return adminAccess;
  }

  if (!isValidOrderStatus(status)) {
    return {
      success: false,
      error: `Invalid order status: ${status}. Valid values: ${VALID_ORDER_STATUSES.join(", ")}`,
    };
  }

  if (isLocalDatabaseMode()) {
    return updateLocalOrderStatus(orderId, status);
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: status as OrderStatus, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error(`Failed to update order status: ${error.message}`);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateAdminPaymentStatus(
  orderId: string,
  paymentId: string,
  status: string,
): Promise<{ success: boolean; error?: string }> {
  const adminAccess = await ensureAdminMutationAccess();

  if (!adminAccess.success) {
    return adminAccess;
  }

  if (!isValidPaymentStatus(status)) {
    return {
      success: false,
      error: `Invalid payment status: ${status}. Valid values: ${VALID_PAYMENT_STATUSES.join(", ")}`,
    };
  }

  if (isLocalDatabaseMode()) {
    return updateLocalPaymentStatus(orderId, paymentId, status);
  }

  const supabase = createSupabaseAdminClient();

  // Update payment record
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: status as PaymentStatus,
      paid_at: status === "paid" ? new Date().toISOString() : null,
    })
    .eq("id", paymentId);

  if (paymentError) {
    console.error(`Failed to update payment status: ${paymentError.message}`);
    return { success: false, error: paymentError.message };
  }

  // If payment is paid, update order payment_status to paid
  if (status === "paid") {
    const { error: orderError } = await supabase
      .from("orders")
      .update({ payment_status: "paid", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (orderError) {
      console.error(`Failed to update order payment_status: ${orderError.message}`);
      return { success: false, error: orderError.message };
    }
  }

  return { success: true };
}

export async function updateAdminPrintJobStatus(
  printJobId: string,
  status: string,
): Promise<{ success: boolean; error?: string }> {
  const adminAccess = await ensureAdminMutationAccess();

  if (!adminAccess.success) {
    return adminAccess;
  }

  if (!isValidPrintStatus(status)) {
    return {
      success: false,
      error: `Invalid print job status: ${status}. Valid values: ${VALID_PRINT_STATUSES.join(", ")}`,
    };
  }

  if (isLocalDatabaseMode()) {
    return updateLocalPrintJobStatus(printJobId, status);
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("print_jobs")
    .update({ status: status as PrintJobStatus, updated_at: new Date().toISOString() })
    .eq("id", printJobId);

  if (error) {
    console.error(`Failed to update print job status: ${error.message}`);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function addAdminOrderNote(
  orderId: string,
  note: string,
  sessionId?: string,
): Promise<{ success: boolean; error?: string; noteId?: string }> {
  const adminAccess = await ensureAdminMutationAccess();

  if (!adminAccess.success) {
    return adminAccess;
  }

  if (!note.trim()) {
    return { success: false, error: "Note cannot be empty" };
  }

  if (isLocalDatabaseMode()) {
    return addLocalAdminOrderNote(orderId, note, sessionId);
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_notes")
    .insert({
      order_id: orderId,
      session_id: sessionId ?? null,
      note: note.trim(),
    })
    .select("id")
    .single();

  if (error) {
    console.error(`Failed to add admin note: ${error.message}`);
    return { success: false, error: error.message };
  }

  return { success: true, noteId: data.id };
}

export async function listAdminOrderNotes(orderId: string): Promise<AdminNote[]> {
  if (isLocalDatabaseMode()) {
    return listLocalAdminOrderNotes(orderId) as unknown as AdminNote[];
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_notes")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Failed to list admin notes: ${error.message}`);
    return [];
  }

  return (data ?? []) as unknown as AdminNote[];
}
