import { Sparkles } from "lucide-react";
import { PublicTemplateCard } from "@/components/public/template-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiTemplates } from "@/lib/templates";

const filterLabels = ["All", "Restoration", "Portrait", "Family", "Business", "Gift"];

export default function TemplatesPage() {
  const templates = aiTemplates.filter((template) => template.isActive);

  return (
    <>
      <SiteHeader />
      <main className="shell py-10 sm:py-14">
        <Card className="rounded-[28px]">
          <CardContent className="grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:px-10">
          <div className="max-w-3xl">
            <Badge>AI photo templates</Badge>
            <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-[1.03] text-[var(--foreground)] sm:text-5xl lg:text-6xl">
              Choose your photo editing template
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              No prompt writing needed. Just choose a template and upload your photo.
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--soft-accent)] p-5">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--primary-dark)]">
                <Sparkles size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="font-bold text-[var(--foreground)]">First step</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  After uploading your photo, select a template from this list.
                </p>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

        <section className="mt-8 flex flex-wrap gap-3" aria-label="Template categories">
          {filterLabels.map((label, index) => (
            <Badge
              key={label}
              variant={index === 0 ? "default" : "outline"}
              className={
                index === 0
                  ? "px-5 py-2.5 text-sm text-white"
                  : "bg-white px-5 py-2.5 text-sm shadow-[0_10px_30px_var(--shadow-soft)]"
              }
            >
              {label}
            </Badge>
          ))}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <PublicTemplateCard
              key={template.id}
              template={template}
              ctaHref={`/create?template=${template.slug}`}
            />
          ))}
        </section>

        <section className="mt-10 rounded-[28px] border border-[var(--line)] bg-[var(--soft-accent)] p-6 shadow-[0_18px_55px_var(--shadow-soft)] sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-3xl">
            <p className="text-2xl font-extrabold text-[var(--foreground)]">
              Not sure which template to choose?
            </p>
            <p className="mt-3 leading-7 text-[var(--muted)]">
              We recommend starting with old photo restoration, colorization, AI portrait, or product photo background for safe, reliable results.
            </p>
          </div>
          <ButtonLink href="/templates/old-photo-restoration" className="mt-5 lg:mt-0">
            Start with Old Photo Restoration
          </ButtonLink>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
