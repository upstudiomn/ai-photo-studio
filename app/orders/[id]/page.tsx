import { CheckCircle2, Clock3, FileImage, PackageCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { getOrderById } from "@/lib/mock-data";
import {
  DEMO_ORDER_ID,
  demoConfirmedOrder,
  demoGeneratedOutputs,
  demoUploadedImage,
  getDemoProductChoice,
  getDemoTemplate,
  getSelectedOutput,
} from "@/lib/preview-flow";
import { printOptions } from "@/lib/pricing";
import { getTemplateById, getTemplateBySlug, getTemplateDisplayTitle } from "@/lib/templates";
import { formatMnt, shortId } from "@/lib/utils";
import { getAITemplateById, getConfirmedOrderDetailById } from "@/server/orders";
import { GENERATED_PREVIEWS_BUCKET, getPublicOrSignedUrl, getStoredImageDisplayUrl } from "@/server/storage";
import type { PaymentStatus } from "@/types/studio";

const timeline = [
  "Order confirmed",
  "Awaiting payment",
  "Preparing final file",
  "Print ready",
  "Printing",
  "Out for delivery",
  "Delivered",
];

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Processing",
  paid: "Paid",
  refunded: "Refunded",
};

function getTimelineIndex(paymentStatus: string, orderStatus: string) {
  if (orderStatus === "delivered") return 6;
  if (orderStatus === "out_for_delivery") return 5;
  if (orderStatus === "printing" || orderStatus === "packed") return 4;
  if (orderStatus === "print_ready") return 3;
  if (paymentStatus === "paid" || orderStatus === "paid") return 2;
  return 1;
}

export default async function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existingOrder = id === DEMO_ORDER_ID ? getOrderById(id) : undefined;

  let template = existingOrder ? getTemplateById(existingOrder.templateId) : getDemoTemplate();
  let selectedOutput = existingOrder
    ? existingOrder.generatedOutputs.find((output) => output.id === existingOrder.selectedOutputId) ??
      existingOrder.generatedOutputs[0] ??
      demoGeneratedOutputs[0]
    : getSelectedOutput(demoConfirmedOrder.selectedOutputId);
  let product = existingOrder
    ? printOptions.find((option) => option.id === existingOrder.printOption)
    : getDemoProductChoice(demoConfirmedOrder.selectedProductType);
  let uploadedImage = existingOrder?.uploadedImages[0] ?? demoUploadedImage;
  let totalPrice = existingOrder?.totalPriceMnt ?? demoConfirmedOrder.totalPriceMnt;
  let paymentStatus: string = existingOrder?.paymentStatus ?? demoConfirmedOrder.paymentStatus;
  let orderStatus: string = existingOrder?.status ?? demoConfirmedOrder.orderStatus;
  let printStatus: string | null = null;

  if (!existingOrder && id !== DEMO_ORDER_ID) {
    try {
      const detail = await getConfirmedOrderDetailById(id);
      const item = detail.items[0];
      const payment = detail.payments[0];
      const printJob = detail.printJobs[0];
      const liveSession = detail.session;

      if (liveSession?.template_id) {
        const liveTemplate = await getAITemplateById(liveSession.template_id);
        template = {
          ...getDemoTemplate(liveTemplate.slug),
          id: liveTemplate.id,
          slug: liveTemplate.slug,
          titleMn: liveTemplate.title_mn,
          titleEn: liveTemplate.title_en ?? getTemplateBySlug(liveTemplate.slug)?.titleEn ?? "Template",
          category: liveTemplate.category ?? "AI",
          descriptionMn: liveTemplate.description_mn ?? "",
          descriptionEn: getTemplateBySlug(liveTemplate.slug)?.descriptionEn ?? "",
          previewImageUrl: liveTemplate.preview_image_url ?? getDemoTemplate(liveTemplate.slug).previewImageUrl,
          requiredImagesMin: liveTemplate.required_images_min,
          requiredImagesMax: liveTemplate.required_images_max,
          prompt: liveTemplate.prompt,
          negativePrompt: liveTemplate.negative_prompt ?? undefined,
          defaultAspectRatio: getDemoTemplate(liveTemplate.slug).defaultAspectRatio,
          outputType: getDemoTemplate(liveTemplate.slug).outputType,
          requiresAdminReview: liveTemplate.requires_admin_review,
          isActive: liveTemplate.is_active,
        };
      }

      if (detail.selectedOutput) {
        const watermarkedUrl = detail.selectedOutput.watermarked_url
          ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, detail.selectedOutput.watermarked_url)
          : detail.selectedOutput.preview_url
            ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, detail.selectedOutput.preview_url)
            : template?.previewImageUrl ?? demoGeneratedOutputs[0].watermarkedUrl;
        const previewUrl = detail.selectedOutput.preview_url
          ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, detail.selectedOutput.preview_url)
          : watermarkedUrl;

        selectedOutput = {
          id: detail.selectedOutput.id,
          sessionId: detail.selectedOutput.session_id,
          title: "Confirmed preview",
          previewUrl,
          watermarkedUrl,
          fullResUrl: detail.selectedOutput.full_res_url ?? undefined,
          watermarkLabel: "Watermark preview",
          isSelected: true,
        };
      }

      const sourceImage = detail.uploadedImages[0];

      if (sourceImage?.file_path) {
        try {
          uploadedImage = {
            id: sourceImage.id,
            fileName: "Uploaded photo",
            fileUrl: await getPublicOrSignedUrl("source-images", sourceImage.file_path),
            imageType: "source",
          };
        } catch (error) {
          console.error("Failed to create signed order source image URL.", error);
        }
      }

      product = getDemoProductChoice(item?.item_type);
      totalPrice = detail.order.total_price;
      paymentStatus = payment?.status ?? detail.order.payment_status;
      orderStatus = detail.order.status;
      printStatus = printJob?.status ?? null;
    } catch (error) {
      console.error("Failed to read confirmed order.", error);
      notFound();
    }
  }

  const productLabel = product ? ("label" in product ? product.label : product.titleMn) : "Digital + print";
  const productDescription = product
    ? "description" in product
      ? product.description
      : product.descriptionMn
    : "Get both file and print versions";
  const templateTitle = template ? getTemplateDisplayTitle(template) : "Template";
  const currentTimelineIndex = getTimelineIndex(paymentStatus, orderStatus);

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
              ORDER {shortId(id)}
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
              Order Status
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Track your payment, digital file, and print fulfillment here.
            </p>
          </div>
          <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_16px_45px_var(--shadow-soft)]">
            <p className="text-sm font-bold text-[var(--muted)]">Current status</p>
            <div className="mt-3 inline-flex rounded-full bg-[var(--soft-accent)] px-4 py-2 text-sm font-extrabold text-[var(--primary-dark)]">
              {paymentLabels[paymentStatus as PaymentStatus] ?? "Processing"}
            </div>
          </section>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <section className="grid gap-8">
            <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_55px_var(--shadow-soft)] sm:p-6">
              <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Confirmed order</h2>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-[var(--muted-surface)] p-4">
                  <dt className="font-bold text-[var(--muted)]">Order</dt>
                  <dd className="mt-1 font-extrabold text-[var(--foreground)]">{shortId(id)}</dd>
                </div>
                <div className="rounded-2xl bg-[var(--muted-surface)] p-4">
                  <dt className="font-bold text-[var(--muted)]">Template</dt>
                  <dd className="mt-1 font-extrabold text-[var(--foreground)]">{templateTitle}</dd>
                </div>
                <div className="rounded-2xl bg-[var(--muted-surface)] p-4">
                  <dt className="font-bold text-[var(--muted)]">Payment</dt>
                  <dd className="mt-1 font-extrabold text-[var(--foreground)]">
                    {paymentLabels[paymentStatus as PaymentStatus] ?? paymentStatus}
                  </dd>
                </div>
                <div className="rounded-2xl bg-[var(--muted-surface)] p-4">
                  <dt className="font-bold text-[var(--muted)]">Selection</dt>
                  <dd className="mt-1 font-extrabold text-[var(--foreground)]">{productLabel}</dd>
                </div>
                {printStatus ? (
                  <div className="rounded-2xl bg-[var(--muted-surface)] p-4 sm:col-span-2">
                    <dt className="font-bold text-[var(--muted)]">Print status</dt>
                    <dd className="mt-1 font-extrabold text-[var(--foreground)]">{printStatus}</dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_55px_var(--shadow-soft)] sm:p-6">
              <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Order timeline</h2>
              <div className="mt-6 grid gap-3">
                {timeline.map((step, index) => {
                  const done = index < currentTimelineIndex;
                  const active = index === currentTimelineIndex;

                  return (
                    <div
                      key={step}
                      className={
                        active
                          ? "flex gap-4 rounded-2xl border border-[var(--primary)] bg-[var(--soft-accent)] p-4"
                          : done
                            ? "flex gap-4 rounded-2xl border border-[var(--line)] bg-[var(--soft-accent)]/55 p-4"
                            : "flex gap-4 rounded-2xl border border-[var(--line)] bg-white p-4"
                      }
                    >
                      <span
                        className={
                          done || active
                            ? "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white"
                            : "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--muted)]"
                        }
                      >
                        {done ? <CheckCircle2 size={17} aria-hidden="true" /> : <Clock3 size={16} aria-hidden="true" />}
                      </span>
                      <div>
                        <p className="font-extrabold text-[var(--foreground)]">{step}</p>
                        {active ? <p className="mt-1 text-sm text-[var(--muted)]">You are currently at this step.</p> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-5 rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_55px_var(--shadow-soft)] sm:grid-cols-[260px_1fr] sm:p-6">
              <figure className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--muted-surface)]">
                <Image
                  src={selectedOutput.watermarkedUrl}
                  alt="Selected preview"
                  width={720}
                  height={540}
                  className="aspect-[4/3] w-full object-cover"
                />
              </figure>
              <div className="content-center">
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--primary-dark)]">
                  Selected result
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-[var(--foreground)]">
                  Preparing final file
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Preview version confirmed. After payment, the watermark-free final file or print order will proceed.
                </p>
              </div>
            </section>
          </section>

          <aside className="grid content-start gap-5">
            <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_55px_var(--shadow-soft)]">
              <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Uploaded photo</h2>
              <figure className="mt-4 overflow-hidden rounded-[20px] border border-[var(--line)]">
                <Image
                  src={uploadedImage.fileUrl}
                  alt={uploadedImage.fileName}
                  width={720}
                  height={540}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="flex items-center gap-2 bg-white px-4 py-3 text-sm font-bold text-[var(--foreground)]">
                  <FileImage size={16} aria-hidden="true" />
                  {uploadedImage.fileName}
                </figcaption>
              </figure>
            </section>

            <section className="rounded-[24px] border border-[var(--line)] bg-[var(--soft-accent)] p-5 shadow-[0_16px_45px_var(--shadow-soft)]">
              <PackageCheck className="text-[var(--primary-dark)]" size={24} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-extrabold text-[var(--foreground)]">Product selection</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{productDescription}</p>
              <p className="mt-4 text-3xl font-extrabold text-[var(--foreground)]">{formatMnt(totalPrice)}</p>
              <ButtonLink href="/templates" variant="ghost" className="mt-5 w-full">
                Browse other templates
              </ButtonLink>
            </section>

            {template?.requiresAdminReview ? (
              <section className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_12px_35px_var(--shadow-soft)]">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 text-[var(--primary-dark)]" size={20} aria-hidden="true" />
                  <p className="text-sm font-bold leading-6 text-[var(--muted)]">
                    Face-sensitive orders include admin quality review.
                  </p>
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
