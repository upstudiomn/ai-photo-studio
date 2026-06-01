import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isLocalDatabaseMode } from "@/lib/db/mode";
import * as localData from "@/server/local-data";
import { IDatabaseRepository, OrderDetail, AdminConfirmedOrder, AdminGenerationSession, AdminReviewOutput, AdminPrintJob, AdminDashboardMetrics } from "./repo-interface";
import {
  Database,
  GenerationSessionStatus,
  OrderStatus,
  PaymentStatus,
  GeneratedOutput,
  GenerationSession,
  AITemplate,
} from "@/types/database";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type GenerationSessionInsert = Database["public"]["Tables"]["generation_sessions"]["Insert"];
type GenerationSessionUpdate = Database["public"]["Tables"]["generation_sessions"]["Update"];
type UploadedImageInsert = Database["public"]["Tables"]["uploaded_images"]["Insert"];
type GeneratedOutputInsert = Database["public"]["Tables"]["generated_outputs"]["Insert"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PrintJobInsert = Database["public"]["Tables"]["print_jobs"]["Insert"];

class LocalRepository implements IDatabaseRepository {
  async getProfileById(id: string) { return localData.getLocalProfileById(id); }
  async getProfileByEmail(email: string) { return localData.getLocalProfileByEmail(email); }
  async getProfileByPhone(phone: string) { return localData.getLocalProfileByPhone(phone); }
  async upsertProfile(input: ProfileInsert) { return localData.createLocalProfile(input); }

  async listActiveTemplates() { return localData.listLocalTemplates(); }
  async getTemplateBySlug(slug: string) { return localData.getLocalTemplateBySlug(slug); }
  async getTemplateById(id: string) { return localData.getLocalTemplateById(id); }

  async createGenerationSession(input: GenerationSessionInsert) { return localData.createLocalGenerationSession(input); }
  async getGenerationSessionById(id: string) { return localData.getLocalGenerationSessionById(id); }
  async updateGenerationSessionStatus(id: string, status: GenerationSessionStatus, patch?: Omit<GenerationSessionUpdate, "status">) { return localData.updateLocalSessionStatus(id, status, patch); }
  async selectSessionTemplate(sessionId: string, templateId: string) { return localData.selectLocalSessionTemplate(sessionId, templateId); }

  async addUploadedImage(input: UploadedImageInsert) { return localData.addLocalUploadedImage(input); }
  async listSessionUploadedImages(sessionId: string) { return localData.listLocalUploadedImages(sessionId); }

  async saveGeneratedOutput(input: GeneratedOutputInsert) {
    const [output] = await localData.createLocalGeneratedOutputs(input);
    return output;
  }
  async listSessionGeneratedOutputs(sessionId: string) { return localData.listLocalGeneratedOutputs(sessionId); }
  async selectGeneratedOutput(sessionId: string, outputId: string) { return localData.selectLocalGeneratedOutput(sessionId, outputId); }

  async createOrder(input: OrderInsert) { return localData.createLocalOrderFromSession(input); }
  async getOrderById(id: string) { return localData.getLocalConfirmedOrderById(id); }
  async getOrderDetailById(id: string): Promise<OrderDetail> { return localData.getLocalConfirmedOrderDetailById(id) as unknown as OrderDetail; }
  async updateOrderStatus(id: string, status: OrderStatus) {
    const res = await localData.updateLocalOrderStatus(id, status);
    return res as unknown as Database["public"]["Tables"]["orders"]["Row"];
  }

  async createOrderItem(input: OrderItemInsert) { return localData.createLocalOrderItem(input); }

  async createPayment(input: PaymentInsert) { return localData.createLocalManualPayment(input); }
  async updatePaymentStatus(orderId: string, paymentId: string, status: PaymentStatus) { return localData.updateLocalPaymentStatus(orderId, paymentId, status); }

  async createPrintJob(input: PrintJobInsert) { return localData.createLocalPrintJob(input); }
  async updatePrintJobStatus(printJobId: string, status: string) { return localData.updateLocalPrintJobStatus(printJobId, status); }

  async listAdminOrders(limit?: number): Promise<AdminConfirmedOrder[]> { return localData.listLocalAdminOrders(limit) as unknown as AdminConfirmedOrder[]; }
  async listAdminGenerationSessions(limit?: number): Promise<AdminGenerationSession[]> { return localData.listLocalAdminGenerationSessions(limit) as unknown as AdminGenerationSession[]; }
  async listAdminReviewOutputs(limit?: number): Promise<AdminReviewOutput[]> { return localData.listLocalAdminReviewOutputs(limit) as unknown as AdminReviewOutput[]; }
  async listPrintJobs(limit?: number): Promise<AdminPrintJob[]> { return localData.listLocalPrintJobs(limit) as unknown as AdminPrintJob[]; }
  async getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> { return localData.getLocalAdminDashboardMetrics(); }
  async addAdminOrderNote(orderId: string, note: string, sessionId?: string | null) { return localData.addLocalAdminOrderNote(orderId, note, sessionId); }
  async listAdminOrderNotes(orderId: string) { return localData.listLocalAdminOrderNotes(orderId); }
}

class SupabaseRepository implements IDatabaseRepository {
  private client = createSupabaseAdminClient();

  async getProfileById(id: string) {
    const { data } = await this.client.from("profiles").select("*").eq("id", id).maybeSingle();
    return data;
  }
  async getProfileByEmail(email: string) {
    const { data } = await this.client.from("profiles").select("*").ilike("email", email).maybeSingle();
    return data;
  }
  async getProfileByPhone(phone: string) {
    const { data } = await this.client.from("profiles").select("*").eq("phone", phone).maybeSingle();
    return data;
  }
  async upsertProfile(input: ProfileInsert) {
    const { data, error } = await this.client.from("profiles").upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: "id" }).select("*").single();
    if (error) throw error;
    return data;
  }

  async listActiveTemplates() {
    const { data, error } = await this.client.from("ai_templates").select("*").eq("is_active", true).order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }
  async getTemplateBySlug(slug: string) {
    const { data, error } = await this.client.from("ai_templates").select("*").eq("slug", slug).single();
    if (error) throw error;
    return data;
  }
  async getTemplateById(id: string) {
    const { data, error } = await this.client.from("ai_templates").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  }

  async createGenerationSession(input: GenerationSessionInsert) {
    const { data, error } = await this.client.from("generation_sessions").insert(input).select("*").single();
    if (error) throw error;
    return data;
  }
  async getGenerationSessionById(id: string) {
    const { data, error } = await this.client.from("generation_sessions").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  }
  async updateGenerationSessionStatus(id: string, status: GenerationSessionStatus, patch?: Omit<GenerationSessionUpdate, "status">) {
    const { data, error } = await this.client.from("generation_sessions").update({ ...patch, status, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  }
  async selectSessionTemplate(sessionId: string, templateId: string) {
    const { data, error } = await this.client.from("generation_sessions").update({ template_id: templateId, status: "template_selected", updated_at: new Date().toISOString() }).eq("id", sessionId).select("*").single();
    if (error) throw error;
    return data;
  }

  async addUploadedImage(input: UploadedImageInsert) {
    const { data, error } = await this.client.from("uploaded_images").insert(input).select("*").single();
    if (error) throw error;
    return data;
  }
  async listSessionUploadedImages(sessionId: string) {
    const { data, error } = await this.client.from("uploaded_images").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  }

  async saveGeneratedOutput(input: GeneratedOutputInsert) {
    const { data, error } = await this.client.from("generated_outputs").insert(input).select("*").single();
    if (error) throw error;
    return data;
  }
  async listSessionGeneratedOutputs(sessionId: string) {
    const { data, error } = await this.client.from("generated_outputs").select("*").eq("session_id", sessionId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
  async selectGeneratedOutput(sessionId: string, outputId: string) {
    await this.client.from("generated_outputs").update({ is_selected: false }).eq("session_id", sessionId);
    const { data, error } = await this.client.from("generated_outputs").update({ is_selected: true }).eq("id", outputId).eq("session_id", sessionId).select("*").single();
    if (error) throw error;
    await this.client.from("generation_sessions").update({ selected_output_id: outputId, updated_at: new Date().toISOString() }).eq("id", sessionId);
    return data;
  }

  async createOrder(input: OrderInsert) {
    const { data, error } = await this.client.from("orders").insert(input).select("*").single();
    if (error) throw error;
    await this.client.from("generation_sessions").update({ status: "converted_to_order", converted_order_id: data.id, selected_output_id: data.selected_output_id, updated_at: new Date().toISOString() }).eq("id", data.session_id);
    return data;
  }
  async getOrderById(id: string) {
    const { data, error } = await this.client.from("orders").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  }
  async getOrderDetailById(id: string): Promise<OrderDetail> {
    const { data: order, error } = await this.client.from("orders").select("*").eq("id", id).single();
    if (error) throw error;
    const [items, payments, printJobs, output, session, uploadedImages] = await Promise.all([
      this.client.from("order_items").select("*").eq("order_id", id),
      this.client.from("payments").select("*").eq("order_id", id),
      this.client.from("print_jobs").select("*").eq("order_id", id),
      order.selected_output_id ? this.client.from("generated_outputs").select("*").eq("id", order.selected_output_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
      this.client.from("generation_sessions").select("*, ai_templates(*)").eq("id", order.session_id).maybeSingle(),
      this.client.from("uploaded_images").select("*").eq("session_id", order.session_id).order("created_at", { ascending: true }),
    ]);
    if (items.error || payments.error || printJobs.error || output.error || session.error || uploadedImages.error) {
       throw new Error("Failed to load order detail from Supabase");
    }
    return {
      order,
      items: items.data || [],
      payments: payments.data || [],
      printJobs: printJobs.data || [],
      selectedOutput: output.data as GeneratedOutput | null,
      session: session.data as (GenerationSession & { ai_templates: AITemplate | null }) | null,
      uploadedImages: uploadedImages.data || []
    };
  }
  async updateOrderStatus(id: string, status: OrderStatus, patch?: Omit<OrderUpdate, "status">) {
    const { data, error } = await this.client.from("orders").update({ ...patch, status, updated_at: new Date().toISOString() }).eq("id", id).select("*").single();
    if (error) throw error;
    return data;
  }

  async createOrderItem(input: OrderItemInsert) {
    const { data, error = null } = await this.client.from("order_items").insert(input).select("*").single();
    if (error) throw error;
    return data;
  }

  async createPayment(input: PaymentInsert) {
    const { data, error } = await this.client.from("payments").insert(input).select("*").single();
    if (error) throw error;
    return data;
  }
  async updatePaymentStatus(orderId: string, paymentId: string, status: PaymentStatus) {
    await this.client.from("payments").update({ status, paid_at: status === "paid" ? new Date().toISOString() : null }).eq("id", paymentId);
    if (status === "paid") {
      await this.client.from("orders").update({ payment_status: "paid", updated_at: new Date().toISOString() }).eq("id", orderId);
    }
    return { success: true };
  }

  async createPrintJob(input: PrintJobInsert) {
    const { data, error } = await this.client.from("print_jobs").insert(input).select("*").single();
    if (error) throw error;
    return data;
  }
  async updatePrintJobStatus(printJobId: string, status: string) {
    await this.client.from("print_jobs").update({ status, updated_at: new Date().toISOString() }).eq("id", printJobId);
    return { success: true };
  }

  async listAdminOrders(limit = 50): Promise<AdminConfirmedOrder[]> {
    const { data, error } = await this.client.from("orders").select("*, generation_sessions!orders_session_id_fkey(*, ai_templates(*)), order_items(*), payments(*), print_jobs(*)").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as unknown as AdminConfirmedOrder[];
  }
  async listAdminGenerationSessions(limit = 50): Promise<AdminGenerationSession[]> {
    const { data, error } = await this.client.from("generation_sessions").select("*, ai_templates(*), uploaded_images(id), generated_outputs!generated_outputs_session_id_fkey(id)").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as unknown as AdminGenerationSession[];
  }
  async listAdminReviewOutputs(limit = 50): Promise<AdminReviewOutput[]> {
    const { data, error } = await this.client.from("generated_outputs").select("*, generation_sessions!generated_outputs_session_id_fkey(*, ai_templates(*))").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as unknown as AdminReviewOutput[];
  }
  async listPrintJobs(limit = 50): Promise<AdminPrintJob[]> {
    const { data, error } = await this.client.from("print_jobs").select("*, orders(*, generation_sessions!orders_session_id_fkey(*, ai_templates(*)), order_items(*), payments(*))").order("created_at", { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as unknown as AdminPrintJob[];
  }
  async getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const sessions = await this.listAdminGenerationSessions(500);
    const orders = await this.listAdminOrders(500);
    const printJobs = await this.listPrintJobs(500);

    return {
      activeSessions: sessions.filter((item) => item.status !== "converted_to_order").length,
      previewReady: sessions.filter((item) => item.status === "preview_ready").length,
      confirmedOrders: orders.length,
      pendingPayment: orders.filter((item) => item.payment_status === "pending" || item.payment_status === "unpaid").length,
      printQueue: printJobs.filter((item) => item.status !== "delivered").length,
      delivered: orders.filter((item) => item.status === "delivered").length,
    };
  }
  async addAdminOrderNote(orderId: string, note: string, sessionId?: string | null) {
    const { data, error } = await this.client.from("admin_notes").insert({ order_id: orderId, session_id: sessionId ?? null, note: note.trim() }).select("id").single();
    if (error) throw error;
    return { success: true, noteId: data.id };
  }
  async listAdminOrderNotes(orderId: string) {
    const { data, error } = await this.client.from("admin_notes").select("*").eq("order_id", orderId).order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

export const db: IDatabaseRepository = isLocalDatabaseMode() ? new LocalRepository() : new SupabaseRepository();
