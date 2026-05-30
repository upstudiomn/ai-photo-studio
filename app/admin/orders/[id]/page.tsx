import { FileText, PackageCheck, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminImageCard } from "@/components/admin/admin-image-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { AdminStatusUpdate } from "@/components/admin/admin-status-update";
import { AdminOrderNotes } from "@/components/admin/admin-order-notes";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderById, mockOrders } from "@/lib/mock-data";
import { DEMO_ORDER_ID, getProductChoiceDisplayTitle } from "@/lib/preview-flow";
import { getTemplateById } from "@/lib/templates";
import { formatDateTime, formatMnt, shortId } from "@/lib/utils";
import { getAdminOrderDetail, listAdminOrderNotes } from "@/server/admin";
import {
  GENERATED_PREVIEWS_BUCKET,
  SOURCE_IMAGES_BUCKET,
  getPublicOrSignedUrl,
  getStoredImageDisplayUrl,
} from "@/server/storage";

const qualityChecklist = [
  "Face identity preserved?",
  "Eyes, teeth, hands normal?",
  "No unwanted text/logo?",
  "Skin tone natural?",
  "Background realistic?",
  "Print resolution OK?",
  "Customer request followed?",
];

async function getAdminDetail(id: string) {
  try {
    const detail = await getAdminOrderDetail(id);
    const uploadedImages = await Promise.all(
      detail.uploadedImages.map(async (image) => ({
        id: image.id,
          title: "Uploaded image",
        src: image.file_path
          ? await getPublicOrSignedUrl(SOURCE_IMAGES_BUCKET, image.file_path)
          : image.file_url,
        meta: image.image_type,
      })),
    );
    const generatedOutputs = await Promise.all(
      detail.generatedOutputs.map(async (output, index) => {
        const pathOrUrl = output.watermarked_url ?? output.preview_url;
        return {
          id: output.id,
          title: output.is_selected ? "Selected preview" : `Preview ${index + 1}`,
          src: pathOrUrl
            ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, pathOrUrl)
            : "/",
          meta: `${output.provider} · ${output.model ?? "model"}`,
        };
      }),
    );

    return { detail, uploadedImages, generatedOutputs, source: "supabase" as const };
  } catch (error) {
    console.error("Failed to load admin order detail.", error);
    return null;
  }
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const live = await getAdminDetail(id);
  const fallbackOrder = id === DEMO_ORDER_ID ? getOrderById(id) ?? mockOrders[0] : null;

  if (!live && !fallbackOrder) {
    notFound();
  }

  const order = live?.detail.order;
  const adminNotes = live ? await listAdminOrderNotes(id) : [];
  const firstItem = order?.order_items?.[0];
  const firstPayment = order?.payments?.[0];
  const firstPrintJob = order?.print_jobs?.[0];
  const template = order?.generation_sessions?.ai_templates;
  const fallbackTemplate = fallbackOrder ? getTemplateById(fallbackOrder.templateId) : null;

  return (
    <section className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Order {shortId(id)}</Badge>
          <h1 className="mt-2 text-4xl font-extrabold text-[var(--foreground)]">
            {order?.customer_name ?? fallbackOrder?.customerName ?? "Confirmed order"}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Confirmed order tracking only. Generation session and AI preview work are separate from checkout.
          </p>
        </div>
        <AdminStatusBadge status={order?.status ?? fallbackOrder?.status} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="grid gap-6">
          <Card className="rounded-[24px]">
            <CardHeader className="p-5 pb-0">
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
            <dl className="grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-2xl bg-[var(--muted-surface)] p-4">
                <dt className="font-bold text-[var(--muted)]">Order ID</dt>
                <dd className="mt-1 font-extrabold">{shortId(id)}</dd>
              </div>
              <div className="rounded-2xl bg-[var(--muted-surface)] p-4">
                <dt className="font-bold text-[var(--muted)]">Product</dt>
                <dd className="mt-1 font-extrabold">
                  {getProductChoiceDisplayTitle(firstItem?.item_type, firstItem?.title ?? fallbackOrder?.printOption)}
                </dd>
              </div>
              <div className="rounded-2xl bg-[var(--muted-surface)] p-4">
                <dt className="font-bold text-[var(--muted)]">Total</dt>
                <dd className="mt-1 font-extrabold">
                  {formatMnt(order?.total_price ?? fallbackOrder?.totalPriceMnt ?? 0)}
                </dd>
              </div>
            </dl>
            </CardContent>
          </Card>

          <Card className="rounded-[24px]">
            <CardHeader className="p-5 pb-0">
              <CardTitle>Uploaded images</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              {live
                ? live.uploadedImages.map((image) => (
                    <AdminImageCard key={image.id} src={image.src} title={image.title} meta={image.meta} />
                  ))
                : fallbackOrder?.uploadedImages.map((image) => (
                    <AdminImageCard key={image.id} src={image.fileUrl} title={image.fileName} meta={image.imageType} />
                  ))}
            </CardContent>
          </Card>

          <Card className="rounded-[24px]">
            <CardHeader className="p-5 pb-0">
              <CardTitle>Generated outputs</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 md:grid-cols-2">
              {live
                ? live.generatedOutputs.map((image) => (
                    <AdminImageCard key={image.id} src={image.src} title={image.title} meta={image.meta} />
                  ))
                : fallbackOrder?.generatedOutputs.map((image, index) => (
                    <AdminImageCard
                      key={image.id}
                      src={image.watermarkedUrl}
                      title={image.isSelected ? "Selected preview" : `Preview ${index + 1}`}
                      meta="fallback"
                    />
                  ))}
            </CardContent>
          </Card>

          <Card className="rounded-[24px]">
            <CardHeader className="p-5 pb-0">
              <CardTitle>Quality checklist</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 md:grid-cols-2">
              {qualityChecklist.map((item) => (
                <label key={item} className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--muted-surface)] px-4 text-sm font-bold text-[var(--foreground)]">
                  <input type="checkbox" className="size-4 accent-[var(--primary)]" />
                  {item}
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <AdminOrderNotes orderId={id} sessionId={order?.session_id} initialNotes={adminNotes} />
        </section>

        <aside className="grid content-start gap-5">
          <Card className="rounded-[24px]">
            <CardHeader className="p-5 pb-0">
              <CardTitle>Customer info</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
            <dl className="grid gap-3 text-sm">
              <div><dt className="text-[var(--muted)]">Name</dt><dd className="font-extrabold">{order?.customer_name ?? fallbackOrder?.customerName ?? "-"}</dd></div>
              <div><dt className="text-[var(--muted)]">Phone</dt><dd className="font-extrabold">{order?.customer_phone ?? fallbackOrder?.customerPhone ?? "-"}</dd></div>
              <div><dt className="text-[var(--muted)]">Address</dt><dd className="font-extrabold">{order?.delivery_address ?? fallbackOrder?.deliveryAddress ?? "-"}</dd></div>
              <div><dt className="text-[var(--muted)]">Created</dt><dd className="font-extrabold">{formatDateTime(order?.created_at ?? fallbackOrder?.createdAt)}</dd></div>
            </dl>
            </CardContent>
          </Card>

          <Card className="rounded-[24px]">
            <CardContent className="p-5">
            <div className="flex gap-3">
              <FileText className="mt-1 text-[var(--primary-dark)]" size={20} />
              <div>
                <h2 className="text-xl font-extrabold text-[var(--foreground)]">Template</h2>
                <p className="mt-2 text-sm font-bold leading-6 text-[var(--muted)]">
                  {template?.title_en ?? fallbackTemplate?.titleEn ?? fallbackOrder?.templateId ?? "Template"}
                </p>
              </div>
            </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px]">
            <CardContent className="p-5">
            <div className="flex gap-3">
              <PackageCheck className="mt-1 text-[var(--primary-dark)]" size={20} />
              <div className="grid gap-3">
                <h2 className="text-xl font-extrabold text-[var(--foreground)]">Payment / Print</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--muted)]">Payment:</span>
                    {firstPayment && live ? (
                      <AdminStatusUpdate
                        type="payment"
                        currentStatus={firstPayment.status}
                        orderId={id}
                        paymentId={firstPayment.id}
                      />
                    ) : (
                      <AdminStatusBadge status={firstPayment?.status ?? fallbackOrder?.paymentStatus} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--muted)]">Print:</span>
                    {firstPrintJob && live ? (
                      <AdminStatusUpdate
                        type="print"
                        currentStatus={firstPrintJob.status}
                        printJobId={firstPrintJob.id}
                      />
                    ) : (
                      firstPrintJob ? <AdminStatusBadge status={firstPrintJob.status} /> : <span className="text-xs text-[var(--muted)]">No print job</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] bg-[var(--soft-accent)]">
            <CardContent className="p-5">
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 text-[var(--primary-dark)]" size={20} />
              <div className="grid gap-3">
                <h2 className="text-xl font-extrabold text-[var(--foreground)]">Order Status</h2>
                {order && live ? (
                  <AdminStatusUpdate
                    type="order"
                    currentStatus={order.status}
                    orderId={id}
                  />
                ) : (
                  <AdminStatusBadge status={order?.status ?? fallbackOrder?.status} />
                )}
              </div>
            </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
