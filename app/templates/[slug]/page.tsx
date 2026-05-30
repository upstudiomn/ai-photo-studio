import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicTemplateCard, getTemplateCategoryLabel } from "@/components/public/template-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiTemplates, getTemplateBySlug, getTemplateDisplayDescription, getTemplateDisplayTitle } from "@/lib/templates";
import { formatMnt } from "@/lib/utils";
import type { AITemplate } from "@/types/studio";

const steps = [
  "Upload your photo",
  "Choose this template",
  "View AI preview",
  "Get digital file or print after payment",
];

function getUseCases(template: AITemplate) {
  if (template.id === "tpl_restore") {
    return ["Old family photos", "Faded images", "Dusty or scratched prints", "Print-ready restoration"];
  }

  if (template.id === "tpl_colorize") {
    return ["Black and white photos", "Faded color memories", "Family archive photos", "A4/A3 prints"];
  }

  if (template.id === "tpl_repair") {
    return ["Folded photos", "Torn prints", "Stained images", "Preserve original look"];
  }

  if (template.id === "tpl_portrait") {
    return ["Profile photos", "Gift portraits", "Clean studio lighting", "Premium prints"];
  }

  if (template.id === "tpl_product") {
    return ["Ecommerce photos", "Clean background", "Product catalog", "Social media posts"];
  }

  if (template.id === "tpl_family") {
    return ["Individual photos", "Family gift", "A3 wall prints", "Quality check required"];
  }

  return ["Gift photos", "Clean AI preview", "Print-ready files", "Quality check required"];
}

function getRelatedTemplates(template: AITemplate) {
  const sameCategory = aiTemplates.filter(
    (item) => item.isActive && item.id !== template.id && item.category === template.category,
  );
  const others = aiTemplates.filter(
    (item) => item.isActive && item.id !== template.id && item.category !== template.category,
  );

  return [...sameCategory, ...others].slice(0, 3);
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  const categoryLabel = getTemplateCategoryLabel(template.category);
  const templateTitle = getTemplateDisplayTitle(template);
  const templateDescription = getTemplateDisplayDescription(template);
  const useCases = getUseCases(template);
  const relatedTemplates = getRelatedTemplates(template);

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--muted)]">
          <Link href="/" className="transition hover:text-[var(--primary-dark)]">
            Home
          </Link>
          <ChevronRight size={15} aria-hidden="true" />
          <Link href="/templates" className="transition hover:text-[var(--primary-dark)]">
            Templates
          </Link>
          <ChevronRight size={15} aria-hidden="true" />
          <span className="text-[var(--foreground)]">{templateTitle}</span>
        </nav>

        <Card className="mt-6 rounded-[28px]">
          <CardContent className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:p-10">
          <div>
            <Badge>{categoryLabel}</Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.04] text-[var(--foreground)] sm:text-5xl">
              {templateTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {templateDescription}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Card className="shadow-none">
                <CardContent className="p-4">
                <p className="text-sm font-bold text-[var(--muted)]">Starting price</p>
                <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">
                  From {formatMnt(template.startingPriceMnt)}
                </p>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardContent className="p-4">
                <p className="text-sm font-bold text-[var(--muted)]">Photos needed</p>
                <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">
                  {template.requiredImagesMin}-{template.requiredImagesMax} photos
                </p>
                </CardContent>
              </Card>
              <Card className="shadow-none">
                <CardContent className="p-4">
                <p className="text-sm font-bold text-[var(--muted)]">Preview</p>
                <p className="mt-1 text-lg font-extrabold text-[var(--foreground)]">1-3 hours</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Badge variant="outline" className="gap-2 px-4 py-2 text-sm">
                <Clock3 size={16} aria-hidden="true" />
                Preview within 1-3 hours
              </Badge>
              {template.requiresAdminReview ? (
                <Badge className="gap-2 px-4 py-2 text-sm">
                  <ShieldCheck size={16} aria-hidden="true" />
                  Quality review
                </Badge>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/create?template=${template.slug}`} className="gap-2">
                Upload with this template
                <ArrowRight size={17} aria-hidden="true" />
              </ButtonLink>
              <ButtonLink href="/templates" variant="ghost">
                Browse other templates
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--muted-surface)] p-3 shadow-[0_18px_55px_var(--shadow-soft)]">
            <div className="grid gap-3 overflow-hidden rounded-[20px] bg-white p-3 sm:grid-cols-2">
              <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-[var(--muted-surface)]">
                <Image
                  src={template.previewImageUrl}
                  alt={`${templateTitle} before`}
                  width={520}
                  height={680}
                  className="h-full min-h-[280px] w-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-[rgba(21,23,22,0.18)]" />
                <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-extrabold text-[var(--foreground)]">
                  Upload photo
                </span>
              </div>
              <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-[var(--soft-accent)]">
                <Image
                  src={template.previewImageUrl}
                  alt={`${templateTitle} preview`}
                  width={520}
                  height={680}
                  className="h-full min-h-[280px] w-full object-cover saturate-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(79,111,82,0.28)] via-transparent to-transparent" />
                <span className="absolute left-4 top-4 rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-extrabold text-white">
                  AI preview
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[20px] bg-white px-4 py-3">
              <div>
                <p className="font-extrabold text-[var(--foreground)]">Print-ready quality</p>
                <p className="text-sm text-[var(--muted)]">Available as digital file or A4/A3 print.</p>
              </div>
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--soft-accent)] text-[var(--primary-dark)]">
                <Sparkles size={20} aria-hidden="true" />
              </span>
            </div>
          </div>
          </CardContent>
        </Card>

        <section className="mt-12">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--primary-dark)]">
              Best use cases
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--foreground)]">
              What is this template best for?
            </h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((item) => (
              <Card
                key={item}
                className="rounded-[22px]"
              >
                <CardContent className="p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[var(--soft-accent)] text-[var(--primary-dark)]">
                  <CheckCircle2 size={19} aria-hidden="true" />
                </span>
                <p className="mt-4 font-extrabold leading-snug text-[var(--foreground)]">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.7fr_1fr] lg:items-start">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--primary-dark)]">
              Process
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[var(--foreground)]">
              How does it work?
            </h2>
            <p className="mt-4 leading-7 text-[var(--muted)]">
              After you upload your photo and choose this template, we prepare a preview. Once confirmed, we finalize the digital file or print order.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <Card
                key={step}
                className="rounded-[22px]"
              >
                <CardContent className="p-5">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="mt-4 font-extrabold leading-snug text-[var(--foreground)]">{step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-[var(--line)] bg-[var(--soft-accent)] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--primary-dark)]">
              <ShieldCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--foreground)]">
                Identity and quality check
              </h2>
              <p className="mt-3 max-w-4xl leading-7 text-[var(--muted)]">
                For photos with faces and identities, we take extra care to preserve natural features. Face-sensitive orders include admin quality review.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--primary-dark)]">
                Next steps
              </p>
              <h2 className="mt-3 text-3xl font-extrabold text-[var(--foreground)]">
                Related templates
              </h2>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-[var(--primary-dark)] transition hover:text-[var(--primary)]"
            >
              View all templates
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {relatedTemplates.map((item) => (
              <PublicTemplateCard
                key={item.id}
                template={item}
                compact
                ctaHref={`/create?template=${item.slug}`}
                ctaLabel="Upload with this template"
              />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
