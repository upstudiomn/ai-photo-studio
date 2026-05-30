import { ArrowLeft, CreditCard, FileImage, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import { ProductChoiceCard } from "@/components/public/product-choice-card";
import { PrintOptionCard } from "@/components/print-option-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { confirmCheckoutAction } from "@/app/checkout/[sessionId]/actions";
import {
  DEMO_SESSION_ID,
  demoProductChoices,
  getDemoProductChoice,
  getDemoTemplate,
  getResultsHref,
  getSelectedOutput,
  getSessionById,
  isProductChoiceId,
} from "@/lib/preview-flow";
import { getTemplateBySlug, getTemplateDisplayTitle } from "@/lib/templates";
import { printOptions } from "@/lib/pricing";
import { formatMnt } from "@/lib/utils";
import {
  getAITemplateById,
  getGenerationSessionById,
  listSessionGeneratedOutputs,
} from "@/server/orders";
import { GENERATED_PREVIEWS_BUCKET, getStoredImageDisplayUrl } from "@/server/storage";
import type { GeneratedOutput } from "@/types/studio";

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ template?: string; output?: string; product?: string; error?: string }>;
}) {
  const { sessionId } = await params;
  const { template: templateSlug, output, product, error } = await searchParams;
  const isDemoSession = sessionId === DEMO_SESSION_ID;
  const session = getSessionById(sessionId);
  let template = getDemoTemplate(templateSlug ?? session.selectedTemplateSlug);
  let selectedOutput: GeneratedOutput | null = isDemoSession ? getSelectedOutput(output) : null;
  let liveError = false;

  if (!isDemoSession) {
    try {
      const liveSession = await getGenerationSessionById(sessionId);
      const outputs = await listSessionGeneratedOutputs(sessionId);
      const selectedRow =
        outputs.find((item) => item.id === output) ??
        outputs.find((item) => item.id === liveSession.selected_output_id) ??
        outputs[0];

      if (selectedRow) {
        const watermarkedUrl = selectedRow.watermarked_url
          ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, selectedRow.watermarked_url)
          : selectedRow.preview_url
            ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, selectedRow.preview_url)
            : template.previewImageUrl;
        const previewUrl = selectedRow.preview_url
          ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, selectedRow.preview_url)
          : watermarkedUrl;

        selectedOutput = {
          id: selectedRow.id,
          sessionId: selectedRow.session_id,
          title: "Selected preview",
          previewUrl,
          watermarkedUrl,
          fullResUrl: selectedRow.full_res_url ?? undefined,
          watermarkLabel: "Watermark preview",
          isSelected: true,
        };
      } else {
        selectedOutput = null;
      }

      if (liveSession.template_id) {
        const liveTemplate = await getAITemplateById(liveSession.template_id);
        template = {
          ...template,
          id: liveTemplate.id,
          slug: liveTemplate.slug,
          titleMn: liveTemplate.title_mn,
          titleEn: liveTemplate.title_en ?? getTemplateBySlug(liveTemplate.slug)?.titleEn ?? "Template",
          category: liveTemplate.category ?? template.category,
          descriptionMn: liveTemplate.description_mn ?? template.descriptionMn,
          descriptionEn: getTemplateBySlug(liveTemplate.slug)?.descriptionEn ?? template.descriptionEn,
          previewImageUrl: liveTemplate.preview_image_url ?? template.previewImageUrl,
          requiredImagesMin: liveTemplate.required_images_min,
          requiredImagesMax: liveTemplate.required_images_max,
          prompt: liveTemplate.prompt,
          negativePrompt: liveTemplate.negative_prompt ?? undefined,
          defaultAspectRatio: template.defaultAspectRatio,
          outputType: template.outputType,
          requiresAdminReview: liveTemplate.requires_admin_review,
          isActive: liveTemplate.is_active,
        };
      }
    } catch (readError) {
      console.error("Failed to read checkout session.", readError);
      liveError = true;
    }
  }

  const selectedProduct = isProductChoiceId(product) ? getDemoProductChoice(product) : getDemoProductChoice(product);
  const totalPrice = selectedProduct.priceMnt;
  const resultsHref = getResultsHref({
    sessionId: sessionId || DEMO_SESSION_ID,
    templateSlug: template.slug,
    outputId: selectedOutput?.id,
    productId: selectedProduct.id,
  });
  const selectedPrintOptionId =
    selectedProduct.id === "digital_file"
      ? "digital"
      : selectedProduct.id === "a4_print"
        ? "a4-matte"
        : selectedProduct.id === "a3_print"
          ? "a3-satin"
          : null;
  const templateTitle = getTemplateDisplayTitle(template);

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="max-w-3xl">
          <Badge>Confirm selection</Badge>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
            Confirm your selection
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
            Confirm your selected preview and digital/print option.
          </p>
        </section>

        {error || liveError || !selectedOutput ? (
          <Card className="mt-6 rounded-[24px]">
            <CardContent className="p-5 text-sm font-bold leading-6 text-[var(--muted)]">
            {liveError || !selectedOutput
              ? "Selected preview not found. Go back to results and select again."
              : "There was a temporary issue confirming the order. Please try again."}
            </CardContent>
          </Card>
        ) : null}

        <form action={confirmCheckoutAction} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
          <input type="hidden" name="sessionId" value={sessionId || DEMO_SESSION_ID} />
          <input type="hidden" name="outputId" value={selectedOutput?.id ?? ""} />
          <input type="hidden" name="productId" value={selectedProduct.id} />

          <section className="grid gap-6">
            <Card className="rounded-[24px]">
              <CardContent className="grid gap-5 p-5 sm:grid-cols-[220px_1fr] sm:p-6">
              <div className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--muted-surface)]">
                {selectedOutput ? (
                  <Image
                    src={selectedOutput.watermarkedUrl}
                    alt="Selected preview"
                    width={520}
                    height={390}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-[var(--primary-dark)]">
                  Selected preview
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-[var(--foreground)]">{templateTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  Final file or print fulfillment starts after payment confirmation.
                </p>
              </div>
              </CardContent>
            </Card>

            <section>
              <h2 className="text-3xl font-extrabold text-[var(--foreground)]">Package details</h2>
              <div className="mt-5 grid gap-4">
                {printOptions.map((option) => (
                  <PrintOptionCard
                    key={option.id}
                    option={option}
                    selected={
                      selectedProduct.id === "digital_plus_print"
                        ? option.id === "digital" || option.id === "a3-satin"
                        : selectedPrintOptionId === option.id
                    }
                  />
                ))}
              </div>
            </section>

            {selectedProduct.includesPrint ? (
              <Card className="rounded-[24px]">
                <CardHeader className="flex-row items-center gap-3 space-y-0 p-5 sm:p-6">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--soft-accent)] text-[var(--primary-dark)]">
                    <Truck size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle>Delivery details</CardTitle>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Used for print delivery if selected.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 p-5 pt-0 md:grid-cols-2 sm:p-6 sm:pt-0">
                  <div className="grid gap-2">
                    <Label htmlFor="customerName">Name</Label>
                    <Input id="customerName" name="customerName" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="customerPhone">Phone</Label>
                    <Input id="customerPhone" name="customerPhone" type="tel" />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="deliveryAddress">Address</Label>
                    <Textarea id="deliveryAddress" name="deliveryAddress" />
                  </div>
                  <div className="grid gap-2 md:col-span-2">
                    <Label htmlFor="deliveryNote">Additional notes</Label>
                    <Textarea
                      id="deliveryNote"
                      name="deliveryNote"
                      className="min-h-24"
                      placeholder="Example: deliver during work hours, will call before delivery..."
                    />
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <Card className="rounded-[24px] bg-[var(--soft-accent)]">
              <CardContent className="p-5 sm:p-6">
              <div className="flex gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--primary-dark)]">
                  <CreditCard size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Payment method</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Payment is currently confirmed manually. QPay integration will be added next.
                  </p>
                </div>
              </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={!selectedOutput} className="px-6 disabled:cursor-not-allowed disabled:opacity-60">
                Confirm Order
              </Button>
              <ButtonLink href={resultsHref} variant="ghost" className="gap-2">
                <ArrowLeft size={16} aria-hidden="true" />
                Back to results
              </ButtonLink>
            </div>
          </section>

          <aside className="grid content-start gap-5">
            <Card className="rounded-[24px]">
              <CardHeader className="p-5 pb-0">
                <CardTitle>Selected package</CardTitle>
              </CardHeader>
              <CardContent className="mt-5 grid gap-4 p-5 pt-0 md:grid-cols-2 lg:grid-cols-1">
                {demoProductChoices.map((choice) => (
                  <ProductChoiceCard
                    key={choice.id}
                    choice={choice}
                    href={getResultsHref({
                      sessionId: sessionId || DEMO_SESSION_ID,
                      templateSlug: template.slug,
                      outputId: selectedOutput?.id,
                      productId: choice.id,
                    })}
                    selected={choice.id === selectedProduct.id}
                  />
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[24px]">
              <CardHeader className="p-5 pb-0">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
              <dl className="grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Template</dt>
                  <dd className="text-right font-extrabold">{templateTitle}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[var(--muted)]">Selection</dt>
                  <dd className="text-right font-extrabold">{selectedProduct.titleMn}</dd>
                </div>
                <div className="mt-3 flex justify-between gap-4 border-t border-[var(--line)] pt-4 text-base">
                  <dt className="font-extrabold text-[var(--foreground)]">Total</dt>
                  <dd className="text-right text-xl font-extrabold text-[var(--foreground)]">
                    {formatMnt(totalPrice)}
                  </dd>
                </div>
              </dl>
              </CardContent>
            </Card>

            <Card className="rounded-[24px]">
              <CardContent className="p-5">
              <div className="flex gap-3">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--soft-accent)] text-[var(--primary-dark)]">
                  <ShieldCheck size={19} aria-hidden="true" />
                </span>
                <p className="text-sm leading-6 text-[var(--muted)]">
                  After confirmation, your order is created and fulfillment and payment tracking will be available on your order status page.
                </p>
              </div>
              </CardContent>
            </Card>

            <Card className="rounded-[24px]">
              <CardContent className="p-5">
              <div className="flex gap-3">
                <FileImage className="mt-0.5 text-[var(--primary-dark)]" size={20} aria-hidden="true" />
                <p className="text-sm font-bold leading-6 text-[var(--foreground)]">
                  Results ID: {sessionId || DEMO_SESSION_ID}
                </p>
              </div>
              </CardContent>
            </Card>
          </aside>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
