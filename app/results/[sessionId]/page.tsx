import { ArrowRight, CheckCircle2, FileImage, PackageCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { ProductChoiceCard } from "@/components/public/product-choice-card";
import { SectionHeading } from "@/components/public/section-heading";
import { PreviewGrid } from "@/components/preview-grid";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DEMO_SESSION_ID,
  demoProductChoices,
  demoUploadedImage,
  getDemoProductChoice,
  getDemoTemplate,
  getOutputsWithSelection,
  getResultsHref,
  getSessionById,
} from "@/lib/preview-flow";
import { getTemplateBySlug, getTemplateDisplayTitle } from "@/lib/templates";
import { formatMnt } from "@/lib/utils";
import {
  getAITemplateById,
  getGenerationSessionById,
  listSessionGeneratedOutputs,
  listSessionUploadedImages,
} from "@/server/orders";
import { GENERATED_PREVIEWS_BUCKET, getPublicOrSignedUrl, getStoredImageDisplayUrl } from "@/server/storage";
import type { GeneratedOutput } from "@/types/studio";

type UploadedImagePreview = {
  id: string;
  fileName: string;
  fileUrl: string;
  imageType: "source";
};

function getCheckoutHref(input: { sessionId: string; outputId: string; productId: string }) {
  const params = new URLSearchParams();
  params.set("output", input.outputId);
  params.set("product", input.productId);

  return `/checkout/${input.sessionId}?${params.toString()}`;
}

export default async function ResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ template?: string; output?: string; product?: string }>;
}) {
  const { sessionId } = await params;
  const { template: templateSlug, output, product } = await searchParams;
  const isDemoSession = sessionId === DEMO_SESSION_ID;
  const session = getSessionById(sessionId);
  let template = getDemoTemplate(templateSlug ?? session.selectedTemplateSlug);
  let outputs: GeneratedOutput[] = isDemoSession ? getOutputsWithSelection(output) : [];
  let uploadedImage: UploadedImagePreview | null = isDemoSession ? demoUploadedImage : null;
  let liveError = false;

  if (!isDemoSession) {
    try {
      const liveSession = await getGenerationSessionById(sessionId);
      const [liveOutputs, liveImages] = await Promise.all([
        listSessionGeneratedOutputs(sessionId),
        listSessionUploadedImages(sessionId),
      ]);

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

      outputs = await Promise.all(liveOutputs.map(async (item, index) => {
        const storedImageUrl = item.watermarked_url ?? item.preview_url;
        const imageUrl = storedImageUrl
          ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, storedImageUrl)
          : template.previewImageUrl;

        return {
          id: item.id,
          sessionId: item.session_id,
          title: `Version ${index + 1}`,
          previewUrl: item.preview_url
            ? await getStoredImageDisplayUrl(GENERATED_PREVIEWS_BUCKET, item.preview_url)
            : imageUrl,
          watermarkedUrl: imageUrl,
          fullResUrl: item.full_res_url ?? undefined,
          watermarkLabel: "Watermark preview",
          isSelected: output ? item.id === output : item.is_selected || (!output && index === 0),
        };
      }));

      const sourceImage = liveImages[0];

      if (sourceImage?.file_path) {
        try {
          uploadedImage = {
            id: sourceImage.id,
            fileName: "Uploaded photo",
            fileUrl: await getPublicOrSignedUrl("source-images", sourceImage.file_path),
            imageType: "source",
          };
        } catch (error) {
          console.error("Failed to create signed source image URL.", error);
        }
      }
    } catch (error) {
      console.error("Failed to read live generation results.", error);
      liveError = true;
      outputs = [];
      uploadedImage = null;
    }
  }

  const selectedOutput = outputs.find((item) => item.isSelected) ?? outputs[0];
  const selectedProduct = getDemoProductChoice(product);
  const templateTitle = getTemplateDisplayTitle(template);

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
              PREVIEW RESULTS
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
              AI preview ready
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--muted)]">
              Choose your favorite version and order digital files or prints.
            </p>
          </div>
          <Card className="rounded-[24px]">
            <CardContent className="p-5">
            <p className="text-sm font-bold text-[var(--muted)]">Selected template</p>
            <p className="mt-2 text-xl font-extrabold text-[var(--foreground)]">{templateTitle}</p>
            </CardContent>
          </Card>
        </section>

        {liveError ? (
          <Card className="mt-6 rounded-[24px]">
            <CardContent className="p-5 text-sm font-bold leading-6 text-[var(--muted)]">
            There was a temporary issue loading results. Please try again.
            </CardContent>
          </Card>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <section className="grid gap-8">
            <section>
              <SectionHeading
                className="mb-4"
                eyebrow="AI preview"
                title="Choose your favorite"
                action={
                  selectedOutput ? (
                  <Badge className="w-fit gap-2 px-4 py-2 text-sm">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    {selectedOutput.title ?? "Version"} selected
                  </Badge>
                  ) : null
                }
              />

              {outputs.length > 0 ? (
                <PreviewGrid
                  outputs={outputs}
                  getSelectHref={(item: GeneratedOutput) =>
                    getResultsHref({
                      sessionId,
                      templateSlug: template.slug,
                      outputId: item.id,
                      productId: selectedProduct.id,
                    })
                  }
                />
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Preview not ready yet</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                    Generate a preview with your chosen template first, then select digital files or prints.
                  </p>
                  <ButtonLink href={`/generate/${sessionId}?template=${template.slug}`} className="mt-5">
                    Generate AI preview
                  </ButtonLink>
                  </CardContent>
                </Card>
              )}
            </section>

            <section>
              <SectionHeading className="mb-5" eyebrow="Product options" title="Choose digital or print" />
              <div className="grid gap-4 md:grid-cols-2">
                {demoProductChoices.map((choice) => {
                  const selected = choice.id === selectedProduct.id;

                  return (
                    <ProductChoiceCard
                      key={choice.id}
                      choice={choice}
                      href={getResultsHref({
                        sessionId,
                        templateSlug: template.slug,
                        outputId: selectedOutput?.id,
                        productId: choice.id,
                      })}
                      selected={selected}
                    />
                  );
                })}
              </div>
            </section>
          </section>

          <aside className="grid content-start gap-5">
            {uploadedImage ? (
              <Card className="rounded-[24px]">
                <CardHeader className="p-5 pb-0">
                  <CardTitle>Uploaded photo</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
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
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[24px] border-dashed">
                <CardContent className="p-5 text-sm font-bold leading-6 text-[var(--muted)]">
                  Uploaded photo could not be loaded for this session.
                </CardContent>
              </Card>
            )}

            <Card className="rounded-[24px] bg-[var(--soft-accent)]">
              <CardContent className="p-5">
              <div className="flex gap-3">
                <PackageCheck className="mt-0.5 text-[var(--primary-dark)]" size={21} aria-hidden="true" />
                <div>
                  <h2 className="text-2xl font-extrabold text-[var(--foreground)]">{selectedProduct.titleMn}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{selectedProduct.descriptionMn}</p>
                  <p className="mt-4 text-2xl font-extrabold text-[var(--foreground)]">
                    {formatMnt(selectedProduct.priceMnt)}
                  </p>
                </div>
              </div>
              <ButtonLink
                href={
                  selectedOutput
                    ? getCheckoutHref({
                        sessionId,
                        outputId: selectedOutput.id,
                        productId: selectedProduct.id,
                      })
                    : `/generate/${sessionId}?template=${template.slug}`
                }
                className="mt-5 w-full gap-2"
              >
                {selectedOutput ? "Confirm selection" : "Generate AI preview"}
                <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
              </CardContent>
            </Card>

            {template.requiresAdminReview ? (
              <Card className="rounded-[24px]">
                <CardContent className="p-5">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 text-[var(--primary-dark)]" size={20} aria-hidden="true" />
                  <p className="text-sm font-bold leading-6 text-[var(--muted)]">
                    Face-sensitive photos include admin quality review.
                  </p>
                </div>
                </CardContent>
              </Card>
            ) : null}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
