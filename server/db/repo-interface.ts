import type {
  Database,
  GenerationSessionStatus,
  OrderStatus,
  PaymentStatus,
} from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type AITemplateRow = Database["public"]["Tables"]["ai_templates"]["Row"];
type GenerationSessionRow = Database["public"]["Tables"]["generation_sessions"]["Row"];
type GenerationSessionInsert = Database["public"]["Tables"]["generation_sessions"]["Insert"];
type GenerationSessionUpdate = Database["public"]["Tables"]["generation_sessions"]["Update"];
type UploadedImageRow = Database["public"]["Tables"]["uploaded_images"]["Row"];
type UploadedImageInsert = Database["public"]["Tables"]["uploaded_images"]["Insert"];
type GeneratedOutputRow = Database["public"]["Tables"]["generated_outputs"]["Row"];
type GeneratedOutputInsert = Database["public"]["Tables"]["generated_outputs"]["Insert"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PrintJobRow = Database["public"]["Tables"]["print_jobs"]["Row"];
type PrintJobInsert = Database["public"]["Tables"]["print_jobs"]["Insert"];
type AdminNoteRow = Database["public"]["Tables"]["admin_notes"]["Row"];

export type AdminGenerationSession = GenerationSessionRow & {
  ai_templates: AITemplateRow | null;
  uploaded_images: Pick<UploadedImageRow, "id">[] | null;
  generated_outputs: Pick<GeneratedOutputRow, "id">[] | null;
};

export type AdminConfirmedOrder = OrderRow & {
  generation_sessions: (GenerationSessionRow & { ai_templates: AITemplateRow | null }) | null;
  order_items: OrderItemRow[] | null;
  payments: PaymentRow[] | null;
  print_jobs: PrintJobRow[] | null;
};

export type AdminPrintJob = PrintJobRow & {
  orders: (OrderRow & {
    generation_sessions: (GenerationSessionRow & { ai_templates: AITemplateRow | null }) | null;
    order_items: OrderItemRow[] | null;
    payments: PaymentRow[] | null;
  }) | null;
};

export type AdminReviewOutput = GeneratedOutputRow & {
  generation_sessions: (GenerationSessionRow & { ai_templates: AITemplateRow | null }) | null;
};

export type OrderDetail = {
  order: OrderRow;
  items: OrderItemRow[];
  payments: PaymentRow[];
  printJobs: PrintJobRow[];
  selectedOutput: GeneratedOutputRow | null;
  session: (GenerationSessionRow & { ai_templates: AITemplateRow | null }) | null;
  uploadedImages: UploadedImageRow[];
};

export type AdminDashboardMetrics = {
  activeSessions: number;
  previewReady: number;
  confirmedOrders: number;
  pendingPayment: number;
  printQueue: number;
  delivered: number;
};

export interface IDatabaseRepository {
  // Profiles
  getProfileById(id: string): Promise<ProfileRow | null>;
  getProfileByEmail(email: string): Promise<ProfileRow | null>;
  getProfileByPhone(phone: string): Promise<ProfileRow | null>;
  upsertProfile(input: ProfileInsert): Promise<ProfileRow>;

  // Templates
  listActiveTemplates(): Promise<AITemplateRow[]>;
  getTemplateBySlug(slug: string): Promise<AITemplateRow>;
  getTemplateById(id: string): Promise<AITemplateRow>;

  // Generation Sessions
  createGenerationSession(input: GenerationSessionInsert): Promise<GenerationSessionRow>;
  getGenerationSessionById(id: string): Promise<GenerationSessionRow>;
  updateGenerationSessionStatus(
    id: string,
    status: GenerationSessionStatus,
    patch?: Omit<GenerationSessionUpdate, "status">,
  ): Promise<GenerationSessionRow>;
  selectSessionTemplate(sessionId: string, templateId: string): Promise<GenerationSessionRow>;

  // Uploaded Images
  addUploadedImage(input: UploadedImageInsert): Promise<UploadedImageRow>;
  listSessionUploadedImages(sessionId: string): Promise<UploadedImageRow[]>;

  // Generated Outputs
  saveGeneratedOutput(input: GeneratedOutputInsert): Promise<GeneratedOutputRow>;
  listSessionGeneratedOutputs(sessionId: string): Promise<GeneratedOutputRow[]>;
  selectGeneratedOutput(sessionId: string, outputId: string): Promise<GeneratedOutputRow>;

  // Orders
  createOrder(input: OrderInsert): Promise<OrderRow>;
  getOrderById(id: string): Promise<OrderRow>;
  getOrderDetailById(id: string): Promise<OrderDetail>;
  updateOrderStatus(id: string, status: OrderStatus, patch?: Omit<OrderUpdate, "status">): Promise<OrderRow>;

  // Order Items
  createOrderItem(input: OrderItemInsert): Promise<OrderItemRow>;

  // Payments
  createPayment(input: PaymentInsert): Promise<PaymentRow>;
  updatePaymentStatus(orderId: string, paymentId: string, status: PaymentStatus): Promise<{ success: boolean }>;

  // Print Jobs
  createPrintJob(input: PrintJobInsert): Promise<PrintJobRow>;
  updatePrintJobStatus(printJobId: string, status: string): Promise<{ success: boolean }>;

  // Admin
  listAdminOrders(limit?: number): Promise<AdminConfirmedOrder[]>;
  listAdminGenerationSessions(limit?: number): Promise<AdminGenerationSession[]>;
  listAdminReviewOutputs(limit?: number): Promise<AdminReviewOutput[]>;
  listPrintJobs(limit?: number): Promise<AdminPrintJob[]>;
  getAdminDashboardMetrics(): Promise<AdminDashboardMetrics>;
  addAdminOrderNote(orderId: string, note: string, sessionId?: string | null): Promise<{ success: boolean; noteId: string }>;
  listAdminOrderNotes(orderId: string): Promise<AdminNoteRow[]>;
}
