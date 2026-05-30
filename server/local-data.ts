import "server-only";
import { localQuery, getLocalPool } from "@/lib/db/local";
import { demoProductChoices } from "@/lib/preview-flow";
import { getTemplateBySlug } from "@/lib/templates";
import { getActiveAIProvider, getImageProvider } from "@/server/ai/provider";
import { mockImageProvider } from "@/server/ai/mock";
import { getLocalPublicUrl, loadLocalImageAsBase64, saveLocalGeneratedPreview } from "@/server/local-storage";
import type { Database, GenerationSessionStatus, OrderStatus, PaymentStatus } from "@/types/database";
import type { ProductChoiceId } from "@/types/studio";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type AITemplateRow = Database["public"]["Tables"]["ai_templates"]["Row"];
type AITemplatePromptPatch = {
  title_mn: string;
  title_en: string | null;
  description_mn: string | null;
  prompt: string;
  negative_prompt: string | null;
  is_active: boolean;
};
type GenerationSessionRow = Database["public"]["Tables"]["generation_sessions"]["Row"];
type GenerationSessionInsert = Database["public"]["Tables"]["generation_sessions"]["Insert"];
type GenerationSessionUpdate = Database["public"]["Tables"]["generation_sessions"]["Update"];
type UploadedImageRow = Database["public"]["Tables"]["uploaded_images"]["Row"];
type UploadedImageInsert = Database["public"]["Tables"]["uploaded_images"]["Insert"];
type GeneratedOutputRow = Database["public"]["Tables"]["generated_outputs"]["Row"];
type GeneratedOutputInsert = Database["public"]["Tables"]["generated_outputs"]["Insert"];
type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];
type PrintJobRow = Database["public"]["Tables"]["print_jobs"]["Row"];
type PrintJobInsert = Database["public"]["Tables"]["print_jobs"]["Insert"];
type AdminNoteRow = Database["public"]["Tables"]["admin_notes"]["Row"];

type AdminGenerationSession = GenerationSessionRow & {
  ai_templates: AITemplateRow | null;
  uploaded_images: Pick<UploadedImageRow, "id">[];
  generated_outputs: Pick<GeneratedOutputRow, "id">[];
};

type AdminConfirmedOrder = OrderRow & {
  generation_sessions: (GenerationSessionRow & { ai_templates: AITemplateRow | null }) | null;
  order_items: OrderItemRow[];
  payments: PaymentRow[];
  print_jobs: PrintJobRow[];
};

type AdminPrintJob = PrintJobRow & {
  orders:
    | (OrderRow & {
        generation_sessions: (GenerationSessionRow & { ai_templates: AITemplateRow | null }) | null;
        order_items: OrderItemRow[];
        payments: PaymentRow[];
      })
    | null;
};

type AdminReviewOutput = GeneratedOutputRow & {
  generation_sessions: (GenerationSessionRow & { ai_templates: AITemplateRow | null }) | null;
};

async function one<T>(sql: string, values: unknown[] = []) {
  const result = await localQuery<T>(sql, values);
  if (!result.rows[0]) {
    throw new Error("Local row not found.");
  }
  return result.rows[0];
}

async function maybeOne<T>(sql: string, values: unknown[] = []) {
  const result = await localQuery<T>(sql, values);
  return result.rows[0] ?? null;
}

async function many<T>(sql: string, values: unknown[] = []) {
  const result = await localQuery<T>(sql, values);
  return result.rows;
}

export async function createLocalProfile(input: ProfileInsert) {
  return one<ProfileRow>(
    `
      insert into profiles (id, first_name, last_name, email, full_name, phone, role)
      values ($1, $2, $3, $4, $5, $6, coalesce($7, 'customer'))
      on conflict (id) do update set
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        full_name = excluded.full_name,
        phone = excluded.phone,
        role = excluded.role,
        updated_at = now()
      returning *
    `,
    [
      input.id,
      input.first_name ?? null,
      input.last_name ?? null,
      input.email ?? null,
      input.full_name ?? null,
      input.phone ?? null,
      input.role ?? "customer",
    ],
  );
}

export async function getLocalProfileById(id: string) {
  return maybeOne<ProfileRow>("select * from profiles where id = $1", [id]);
}

export async function getLocalProfileByEmail(email: string) {
  return maybeOne<ProfileRow>("select * from profiles where lower(email) = lower($1)", [email]);
}

export async function getLocalProfileByPhone(phone: string) {
  return maybeOne<ProfileRow>("select * from profiles where phone = $1", [phone.trim().replace(/\s+/g, "")]);
}

export async function listLocalTemplates() {
  return many<AITemplateRow>("select * from ai_templates where is_active = true order by created_at asc");
}

export async function getLocalTemplateBySlug(slug: string) {
  return one<AITemplateRow>("select * from ai_templates where slug = $1", [slug]);
}

export async function getLocalTemplateById(id: string) {
  return one<AITemplateRow>("select * from ai_templates where id = $1", [id]);
}

export async function createLocalGenerationSession(input: GenerationSessionInsert = {}) {
  const userId = input.user_id && (await getLocalProfileById(input.user_id)) ? input.user_id : null;

  return one<GenerationSessionRow>(
    `
      insert into generation_sessions (user_id, template_id, status, customer_note, selected_output_id, converted_order_id)
      values ($1, $2, coalesce($3, 'draft'), $4, $5, $6)
      returning *
    `,
    [
      userId,
      input.template_id ?? null,
      input.status ?? "draft",
      input.customer_note ?? null,
      input.selected_output_id ?? null,
      input.converted_order_id ?? null,
    ],
  );
}

export async function getLocalGenerationSessionById(id: string) {
  return one<GenerationSessionRow>("select * from generation_sessions where id = $1", [id]);
}

export async function updateLocalSessionStatus(
  id: string,
  status: GenerationSessionStatus,
  patch: Omit<GenerationSessionUpdate, "status"> = {},
) {
  return one<GenerationSessionRow>(
    `
      update generation_sessions set
        status = $2,
        template_id = coalesce($3, template_id),
        customer_note = coalesce($4, customer_note),
        selected_output_id = coalesce($5, selected_output_id),
        converted_order_id = coalesce($6, converted_order_id),
        updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      status,
      patch.template_id ?? null,
      patch.customer_note ?? null,
      patch.selected_output_id ?? null,
      patch.converted_order_id ?? null,
    ],
  );
}

export async function selectLocalSessionTemplate(sessionId: string, templateId: string) {
  return one<GenerationSessionRow>(
    `
      update generation_sessions set
        template_id = $2,
        status = 'template_selected',
        updated_at = now()
      where id = $1
      returning *
    `,
    [sessionId, templateId],
  );
}

export async function selectLocalSessionTemplateBySlug(sessionId: string, templateSlug: string) {
  const template = await getLocalTemplateBySlug(templateSlug);
  return selectLocalSessionTemplate(sessionId, template.id);
}

export async function addLocalUploadedImage(input: UploadedImageInsert) {
  return one<UploadedImageRow>(
    `
      insert into uploaded_images (session_id, file_url, file_path, image_type)
      values ($1, $2, $3, coalesce($4, 'source'))
      returning *
    `,
    [input.session_id, input.file_url, input.file_path ?? null, input.image_type ?? "source"],
  );
}

export async function listLocalUploadedImages(sessionId: string) {
  return many<UploadedImageRow>(
    "select * from uploaded_images where session_id = $1 order by created_at asc",
    [sessionId],
  );
}

export async function createLocalGeneratedOutputs(inputs: GeneratedOutputInsert[] | GeneratedOutputInsert) {
  const rows = Array.isArray(inputs) ? inputs : [inputs];
  const created: GeneratedOutputRow[] = [];

  for (const input of rows) {
    created.push(
      await one<GeneratedOutputRow>(
        `
          insert into generated_outputs
            (session_id, provider, model, preview_url, watermarked_url, full_res_url, is_selected)
          values ($1, coalesce($2, 'mock'), $3, $4, $5, $6, coalesce($7, false))
          returning *
        `,
        [
          input.session_id,
          input.provider ?? "mock",
          input.model ?? null,
          input.preview_url ?? null,
          input.watermarked_url ?? null,
          input.full_res_url ?? null,
          input.is_selected ?? false,
        ],
      ),
    );
  }

  return created;
}

export async function listLocalGeneratedOutputs(sessionId: string) {
  return many<GeneratedOutputRow>(
    "select * from generated_outputs where session_id = $1 order by created_at desc",
    [sessionId],
  );
}

export async function selectLocalGeneratedOutput(sessionId: string, outputId: string) {
  await localQuery("update generated_outputs set is_selected = false where session_id = $1", [sessionId]);
  const output = await one<GeneratedOutputRow>(
    `
      update generated_outputs set is_selected = true
      where id = $1 and session_id = $2
      returning *
    `,
    [outputId, sessionId],
  );

  await localQuery(
    "update generation_sessions set selected_output_id = $2, updated_at = now() where id = $1",
    [sessionId, outputId],
  );

  return output;
}

export async function createLocalMockGeneratedOutputsForSession(sessionId: string, templateSlug?: string | null) {
  const existingOutputs = await listLocalGeneratedOutputs(sessionId);

  if (existingOutputs.length > 0) {
    await updateLocalSessionStatus(sessionId, "preview_ready");
    return existingOutputs;
  }

  const session = await getLocalGenerationSessionById(sessionId);
  const dbTemplate = session.template_id ? await getLocalTemplateById(session.template_id) : null;
  const localTemplate = getTemplateBySlug(templateSlug ?? "") ?? getTemplateBySlug("old-photo-restoration");
  const provider = getImageProvider();
  const activeProvider = getActiveAIProvider();

  await updateLocalSessionStatus(sessionId, "generating");

  let imageUrls: string[] = [];
  try {
    const uploadedImages = await listLocalUploadedImages(sessionId);
    const firstImage = uploadedImages[0];
    if (firstImage?.file_path) {
      const loadedImage = await loadLocalImageAsBase64(firstImage.file_path);
      imageUrls = [loadedImage.dataUrl];
    }
  } catch (error) {
    console.warn("Could not load local uploaded image:", error);
  }

  const generateInput = {
    templateId: dbTemplate?.id ?? localTemplate?.id ?? "template",
    prompt: dbTemplate?.prompt ?? localTemplate?.prompt ?? "Create a clean premium AI photo preview.",
    imageUrls,
    aspectRatio: dbTemplate?.default_aspect_ratio ?? localTemplate?.defaultAspectRatio ?? "A4",
  };

  let generated;
  try {
    generated = await provider.generate(generateInput);
  } catch (error) {
    console.error(`AI provider ${activeProvider} failed, falling back to mock:`, error);

    if (activeProvider === "mock") {
      await updateLocalSessionStatus(sessionId, "failed");
      return [];
    }

    generated = await mockImageProvider.generate(generateInput);
  }

  const rows: GeneratedOutputInsert[] = [];

  for (const output of generated.slice(0, 3)) {
    let previewUrl = output.previewUrl;
    let watermarkedUrl = output.previewUrl;

    if (previewUrl.startsWith("data:") || /^https?:\/\//.test(previewUrl)) {
      try {
        const uploaded = await saveLocalGeneratedPreview(previewUrl, sessionId);
        previewUrl = uploaded.fileUrl;
        watermarkedUrl = uploaded.fileUrl;
      } catch (error) {
        console.error("Failed to save local generated preview:", error);
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

  await createLocalGeneratedOutputs(rows);
  await updateLocalSessionStatus(sessionId, "preview_ready");

  return listLocalGeneratedOutputs(sessionId);
}

export async function createLocalOrderFromSession(input: OrderInsert) {
  const order = await one<OrderRow>(
    `
      insert into orders
        (user_id, session_id, selected_output_id, status, payment_status, customer_name, customer_phone, customer_email, delivery_address, total_price)
      values ($1, $2, $3, coalesce($4, 'pending_payment'), coalesce($5, 'unpaid'), $6, $7, $8, $9, coalesce($10, 0))
      returning *
    `,
    [
      input.user_id ?? null,
      input.session_id,
      input.selected_output_id ?? null,
      input.status ?? "pending_payment",
      input.payment_status ?? "unpaid",
      input.customer_name ?? null,
      input.customer_phone ?? null,
      input.customer_email ?? null,
      input.delivery_address ?? null,
      input.total_price ?? 0,
    ],
  );

  await localQuery(
    `
      update generation_sessions set
        status = 'converted_to_order',
        converted_order_id = $2,
        selected_output_id = $3,
        updated_at = now()
      where id = $1
    `,
    [input.session_id, order.id, input.selected_output_id ?? null],
  );

  return order;
}

export async function createLocalOrderItem(input: OrderItemInsert) {
  return one<OrderItemRow>(
    `
      insert into order_items (order_id, item_type, title, quantity, unit_price, total_price)
      values ($1, $2, $3, coalesce($4, 1), coalesce($5, 0), coalesce($6, 0))
      returning *
    `,
    [
      input.order_id,
      input.item_type,
      input.title ?? null,
      input.quantity ?? 1,
      input.unit_price ?? 0,
      input.total_price ?? 0,
    ],
  );
}

export async function createLocalManualPayment(input: PaymentInsert) {
  return one<PaymentRow>(
    `
      insert into payments (order_id, provider, amount, currency, status, invoice_id, payment_reference, paid_at)
      values ($1, coalesce($2, 'manual'), $3, coalesce($4, 'MNT'), coalesce($5, 'pending'), $6, $7, $8)
      returning *
    `,
    [
      input.order_id,
      input.provider ?? "manual",
      input.amount,
      input.currency ?? "MNT",
      input.status ?? "pending",
      input.invoice_id ?? null,
      input.payment_reference ?? null,
      input.paid_at ?? null,
    ],
  );
}

export async function createLocalPrintJob(input: PrintJobInsert) {
  return one<PrintJobRow>(
    `
      insert into print_jobs (order_id, status, print_size, paper_type, delivery_address)
      values ($1, coalesce($2, 'print_ready'), $3, $4, $5)
      returning *
    `,
    [
      input.order_id,
      input.status ?? "print_ready",
      input.print_size ?? null,
      input.paper_type ?? null,
      input.delivery_address ?? null,
    ],
  );
}

export async function createLocalCheckoutOrderFromSession(input: {
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

  const output = await selectLocalGeneratedOutput(input.sessionId, input.outputId);
  const session = await getLocalGenerationSessionById(input.sessionId);
  const order = await createLocalOrderFromSession({
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

  await createLocalOrderItem({
    order_id: order.id,
    item_type: product.id,
    title: product.titleMn,
    quantity: 1,
    unit_price: product.priceMnt,
    total_price: product.priceMnt,
  });

  if (product.includesPrint) {
    await createLocalPrintJob({
      order_id: order.id,
      status: "print_ready",
      print_size: product.printSize ?? null,
      paper_type: "premium",
      delivery_address: input.deliveryAddress ?? null,
    });
  }

  await createLocalManualPayment({
    order_id: order.id,
    provider: "manual",
    amount: product.priceMnt,
    currency: "MNT",
    status: "pending",
  });

  return order;
}

export async function getLocalConfirmedOrderById(id: string) {
  return one<OrderRow>("select * from orders where id = $1", [id]);
}

export async function getLocalConfirmedOrderDetailById(id: string) {
  const order = await getLocalConfirmedOrderById(id);
  const [items, payments, printJobs, selectedOutput, session, uploadedImages] = await Promise.all([
    many<OrderItemRow>("select * from order_items where order_id = $1 order by created_at asc", [id]),
    many<PaymentRow>("select * from payments where order_id = $1 order by created_at asc", [id]),
    many<PrintJobRow>("select * from print_jobs where order_id = $1 order by created_at asc", [id]),
    order.selected_output_id
      ? maybeOne<GeneratedOutputRow>("select * from generated_outputs where id = $1", [order.selected_output_id])
      : Promise.resolve(null),
    maybeOne<GenerationSessionRow & { ai_templates: AITemplateRow | null }>(
      `
        select gs.*, row_to_json(t.*) as ai_templates
        from generation_sessions gs
        left join ai_templates t on t.id = gs.template_id
        where gs.id = $1
      `,
      [order.session_id],
    ),
    listLocalUploadedImages(order.session_id),
  ]);

  return {
    order,
    items,
    payments,
    printJobs,
    selectedOutput,
    session,
    uploadedImages,
  };
}

async function getOrderNested(order: OrderRow): Promise<AdminConfirmedOrder> {
  const [session, items, payments, printJobs] = await Promise.all([
    maybeOne<GenerationSessionRow & { ai_templates: AITemplateRow | null }>(
      `
        select gs.*, row_to_json(t.*) as ai_templates
        from generation_sessions gs
        left join ai_templates t on t.id = gs.template_id
        where gs.id = $1
      `,
      [order.session_id],
    ),
    many<OrderItemRow>("select * from order_items where order_id = $1 order by created_at asc", [order.id]),
    many<PaymentRow>("select * from payments where order_id = $1 order by created_at asc", [order.id]),
    many<PrintJobRow>("select * from print_jobs where order_id = $1 order by created_at asc", [order.id]),
  ]);

  return {
    ...order,
    generation_sessions: session,
    order_items: items,
    payments,
    print_jobs: printJobs,
  };
}

export async function listLocalAdminOrders(limit = 50) {
  const orders = await many<OrderRow>(
    "select * from orders order by created_at desc limit $1",
    [limit],
  );
  return Promise.all(orders.map(getOrderNested));
}

export async function listLocalAdminGenerationSessions(limit = 50) {
  const sessions = await many<GenerationSessionRow & { ai_templates: AITemplateRow | null }>(
    `
      select gs.*, row_to_json(t.*) as ai_templates
      from generation_sessions gs
      left join ai_templates t on t.id = gs.template_id
      order by gs.created_at desc
      limit $1
    `,
    [limit],
  );

  return Promise.all(
    sessions.map(async (session): Promise<AdminGenerationSession> => {
      const [uploadedImages, generatedOutputs] = await Promise.all([
        many<Pick<UploadedImageRow, "id">>("select id from uploaded_images where session_id = $1", [session.id]),
        many<Pick<GeneratedOutputRow, "id">>("select id from generated_outputs where session_id = $1", [session.id]),
      ]);

      return {
        ...session,
        uploaded_images: uploadedImages,
        generated_outputs: generatedOutputs,
      };
    }),
  );
}

export async function listLocalPrintJobs(limit = 50) {
  const jobs = await many<PrintJobRow>(
    "select * from print_jobs order by created_at desc limit $1",
    [limit],
  );

  return Promise.all(
    jobs.map(async (job): Promise<AdminPrintJob> => {
      const order = await getLocalConfirmedOrderById(job.order_id).catch(() => null);
      return {
        ...job,
        orders: order ? await getOrderNested(order) : null,
      };
    }),
  );
}

export async function listLocalAdminReviewOutputs(limit = 50) {
  const outputs = await many<GeneratedOutputRow>(
    "select * from generated_outputs order by created_at desc limit $1",
    [limit],
  );

  return Promise.all(
    outputs.map(async (output): Promise<AdminReviewOutput> => {
      const session = await maybeOne<GenerationSessionRow & { ai_templates: AITemplateRow | null }>(
        `
          select gs.*, row_to_json(t.*) as ai_templates
          from generation_sessions gs
          left join ai_templates t on t.id = gs.template_id
          where gs.id = $1
        `,
        [output.session_id],
      );

      return {
        ...output,
        generation_sessions: session,
      };
    }),
  );
}

export async function listLocalAdminTemplates() {
  return many<AITemplateRow>("select * from ai_templates order by created_at asc");
}

export async function updateLocalAdminTemplatePrompt(
  id: string,
  patch: AITemplatePromptPatch,
) {
  const template = await one<AITemplateRow>(
    `
      update ai_templates set
        title_mn = $2,
        title_en = $3,
        description_mn = $4,
        prompt = $5,
        negative_prompt = $6,
        is_active = $7,
        updated_at = now()
      where id = $1
      returning *
    `,
    [
      id,
      patch.title_mn,
      patch.title_en ?? null,
      patch.description_mn ?? null,
      patch.prompt,
      patch.negative_prompt ?? null,
      patch.is_active,
    ],
  );

  return { success: true, template };
}

export async function getLocalAdminDashboardMetrics() {
  const [sessions, orders, printJobs] = await Promise.all([
    listLocalAdminGenerationSessions(500),
    listLocalAdminOrders(500),
    listLocalPrintJobs(500),
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

export async function getLocalAdminOrderDetail(id: string) {
  const detail = await getLocalConfirmedOrderDetailById(id);
  const order = await getOrderNested(detail.order);
  const generatedOutputs = await listLocalGeneratedOutputs(detail.order.session_id);

  return {
    order,
    uploadedImages: detail.uploadedImages,
    generatedOutputs,
    selectedOutput: detail.selectedOutput,
  };
}

export async function updateLocalOrderStatus(id: string, status: OrderStatus) {
  await one<OrderRow>(
    "update orders set status = $2, updated_at = now() where id = $1 returning *",
    [id, status],
  );
  return { success: true };
}

export async function updateLocalPaymentStatus(orderId: string, paymentId: string, status: PaymentStatus) {
  const pool = getLocalPool();
  const client = await pool.connect();

  try {
    await client.query("begin");
    await client.query(
      "update payments set status = $2, paid_at = case when $2 = 'paid' then now() else null end where id = $1",
      [paymentId, status],
    );
    if (status === "paid") {
      await client.query("update orders set payment_status = 'paid', updated_at = now() where id = $1", [orderId]);
    }
    await client.query("commit");
    return { success: true };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateLocalPrintJobStatus(printJobId: string, status: string) {
  await one<PrintJobRow>(
    "update print_jobs set status = $2, updated_at = now() where id = $1 returning *",
    [printJobId, status],
  );
  return { success: true };
}

export async function addLocalAdminOrderNote(orderId: string, note: string, sessionId?: string | null) {
  const created = await one<AdminNoteRow>(
    `
      insert into admin_notes (order_id, session_id, note)
      values ($1, $2, $3)
      returning *
    `,
    [orderId, sessionId ?? null, note.trim()],
  );

  return { success: true, noteId: created.id };
}

export async function listLocalAdminOrderNotes(orderId: string) {
  return many<AdminNoteRow>(
    "select * from admin_notes where order_id = $1 order by created_at desc",
    [orderId],
  );
}

export function resolveLocalImageUrl(pathOrUrl: string) {
  return getLocalPublicUrl(pathOrUrl);
}
