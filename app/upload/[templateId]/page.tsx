import { ArrowRight, ImagePlus, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { getTemplateById, getTemplateDisplayTitle } from "@/lib/templates";

export default async function UploadPage({ params }: { params: Promise<{ templateId: string }> }) {
  const { templateId } = await params;
  const template = getTemplateById(templateId);

  return (
    <>
      <SiteHeader />
      <main className="shell py-10 sm:py-16">
        <section className="mx-auto max-w-3xl rounded-[28px] border border-[var(--line)] bg-white p-6 text-center shadow-[0_20px_70px_var(--shadow-soft)] sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-[24px] bg-[var(--soft-accent)] text-[var(--primary-dark)]">
            <ImagePlus size={30} aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
            AI PREVIEW FLOW
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
            Start by uploading a photo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            New flow: upload a photo first, then choose your AI template.
            {template ? ` You can continue with ${getTemplateDisplayTitle(template)} template.` : ""}
          </p>

          <div className="mx-auto mt-8 grid max-w-xl gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--soft-accent)] p-5 text-left">
            {["Upload photo", "Choose AI template", "Create preview", "View results and confirm"].map(
              (step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-white text-sm font-extrabold text-[var(--primary-dark)]">
                    {index + 1}
                  </span>
                  <span className="font-extrabold text-[var(--foreground)]">{step}</span>
                </div>
              ),
            )}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href={template ? `/create?template=${template.slug}` : "/create"} className="gap-2 px-6">
              Upload Photo
              <ArrowRight size={17} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink
              href="/templates"
              variant="ghost"
              className="gap-2"
            >
              <Sparkles size={17} aria-hidden="true" />
              Browse Templates
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
