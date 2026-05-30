import { ArrowRight, CheckCircle2, Clock3, ImageIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { generatePreviewAction } from "@/app/generate/[sessionId]/actions";
import { DEMO_SESSION_ID, getDemoTemplate, getResultsHref, getSessionById } from "@/lib/preview-flow";
import { getTemplateDisplayTitle } from "@/lib/templates";
import { getGenerationSessionById, listSessionGeneratedOutputs } from "@/server/orders";

const processingSteps = ["Reading image", "Applying template", "Creating preview"];

export default async function GeneratePage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ template?: string; error?: string }>;
}) {
  const { sessionId } = await params;
  const { template: templateSlug, error } = await searchParams;
  const session = getSessionById(sessionId);
  const template = getDemoTemplate(templateSlug ?? session.selectedTemplateSlug);
  const templateTitle = getTemplateDisplayTitle(template);
  let liveReady = sessionId === DEMO_SESSION_ID;
  let liveExists = sessionId === DEMO_SESSION_ID;

  if (sessionId !== DEMO_SESSION_ID) {
    try {
      await getGenerationSessionById(sessionId);
      liveExists = true;
      liveReady = (await listSessionGeneratedOutputs(sessionId)).length > 0;
    } catch (error) {
      console.error("Failed to load generation session.", error);
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
              AI PREVIEW
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.04] text-[var(--foreground)] sm:text-5xl">
              Creating AI preview
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
              Processing your photo with the selected template.
            </p>

            <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-[var(--soft-accent)] p-5">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 text-[var(--primary-dark)]" size={20} aria-hidden="true" />
                <p className="text-sm font-bold leading-6 text-[var(--foreground)]">
                  Once preview is ready, you can choose digital files or prints.
                </p>
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-[22px] border border-[#C84646]/25 bg-[#C84646]/10 px-5 py-4 text-sm font-bold text-[#9F3333]">
                Preview generation failed. Please try again.
              </div>
            ) : null}
          </div>

          <section className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-[0_20px_70px_var(--shadow-soft)] sm:p-6">
            <div className="grid gap-5 sm:grid-cols-[240px_1fr]">
              <figure className="relative overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--muted-surface)]">
                <Image
                  src={template.previewImageUrl}
                  alt={templateTitle}
                  width={520}
                  height={620}
                  className="aspect-[4/5] h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-extrabold text-[var(--primary-dark)]">
                  {templateTitle}
                </span>
              </figure>

              <div className="grid content-center gap-4">
                <div className="rounded-[24px] border border-[var(--line)] bg-[var(--muted-surface)] p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-white text-[var(--primary-dark)]">
                      <Clock3 size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-2xl font-extrabold text-[var(--foreground)]">Processing</h2>
                      <p className="mt-1 text-sm text-[var(--muted)]">Session ID: {sessionId}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {processingSteps.map((step, index) => (
                    <div
                      key={step}
                      className={
                        index === 2
                          ? "flex items-center gap-3 rounded-2xl border border-[var(--primary)] bg-[var(--soft-accent)] p-4"
                          : "flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white p-4"
                      }
                    >
                      <span
                        className={
                          index < 2
                            ? "grid size-9 place-items-center rounded-full bg-[var(--primary)] text-white"
                            : "grid size-9 place-items-center rounded-full bg-white text-[var(--primary-dark)]"
                        }
                      >
                        {index < 2 ? <CheckCircle2 size={17} aria-hidden="true" /> : <ImageIcon size={17} aria-hidden="true" />}
                      </span>
                      <span className="font-extrabold text-[var(--foreground)]">{step}</span>
                    </div>
                  ))}
                </div>

                {liveReady ? (
                  <ButtonLink href={getResultsHref({ sessionId, templateSlug: template.slug })} className="gap-2">
                    View results
                    <ArrowRight size={17} aria-hidden="true" />
                  </ButtonLink>
                ) : liveExists ? (
                  <form action={generatePreviewAction}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <input type="hidden" name="templateSlug" value={template.slug} />
                    <Button type="submit" className="w-full gap-2">
                      Generate preview
                      <ArrowRight size={17} aria-hidden="true" />
                    </Button>
                  </form>
                ) : (
                  <ButtonLink href="/create" className="gap-2">
                    Upload photo
                    <ArrowRight size={17} aria-hidden="true" />
                  </ButtonLink>
                )}
              </div>
            </div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
