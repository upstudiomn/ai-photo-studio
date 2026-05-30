import { ArrowRight, CheckCircle2, ImageIcon, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { selectTemplateAction } from "@/app/create/template/actions";
import { aiTemplates, getTemplateDisplayDescription, getTemplateDisplayTitle } from "@/lib/templates";
import { formatMnt } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  Restoration: "Restoration",
  Repair: "Restoration",
  Portrait: "Portrait",
  Family: "Family",
  Business: "Business",
  Gift: "Gift",
  Kids: "Kids",
};

const filterLabels = ["All", "Restoration", "Portrait", "Family", "Business", "Gift"];

export default async function CreateTemplatePage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; template?: string; error?: string }>;
}) {
  const { sessionId, template: selectedSlug, error } = await searchParams;
  const selectedTemplateSlug = selectedSlug;
  const missingSession = !sessionId;
  const templates = aiTemplates.filter((item) => item.isActive);

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="grid gap-6 rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_20px_70px_var(--shadow-soft)] sm:p-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
              CHOOSE TEMPLATE
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.04] text-[var(--foreground)] sm:text-5xl">
              Choose AI template
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
              Select an AI photo editing template that matches your uploaded image.
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--soft-accent)] p-5">
            <div className="flex gap-3">
            <Sparkles className="mt-0.5 text-[var(--primary-dark)]" size={20} aria-hidden="true" />
              <p className="text-sm font-bold leading-6 text-[var(--foreground)]">
                After choosing a template, the AI preview will be generated.
              </p>
            </div>
          </div>
        </section>

        {missingSession ? (
          <section className="mt-5 grid gap-3 rounded-[22px] border border-[#C84646]/25 bg-[#C84646]/10 px-5 py-4 text-sm font-bold text-[#9F3333]">
            <p>Upload a photo first, then choose a template for that preview session.</p>
            <ButtonLink href="/create" className="w-fit">
              Upload photo
            </ButtonLink>
          </section>
        ) : error ? (
          <section className="mt-5 rounded-[22px] border border-[#C84646]/25 bg-[#C84646]/10 px-5 py-4 text-sm font-bold text-[#9F3333]">
            There was a temporary issue saving the template. Please select again.
          </section>
        ) : null}

        <section className="mt-8 flex flex-wrap gap-3" aria-label="Template categories">
          {filterLabels.map((label, index) => (
            <span
              key={label}
              className={
                index === 0
                  ? "rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white"
                  : "rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-bold text-[var(--foreground)] shadow-[0_10px_30px_var(--shadow-soft)]"
              }
            >
              {label}
            </span>
          ))}
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((item) => {
            const selected = item.slug === selectedTemplateSlug;

            return (
              <article
                key={item.id}
                className={
                  selected
                    ? "group overflow-hidden rounded-[24px] border border-[var(--primary)] bg-[var(--soft-accent)] shadow-[0_18px_55px_var(--shadow-soft)]"
                    : "group overflow-hidden rounded-[24px] border border-[var(--line)] bg-white shadow-[0_18px_55px_var(--shadow-soft)] transition hover:-translate-y-1 hover:border-[var(--primary)]"
                }
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--muted-surface)]">
                  <Image
                    src={item.previewImageUrl}
                    alt={getTemplateDisplayTitle(item)}
                    width={720}
                    height={540}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-extrabold text-[var(--primary-dark)]">
                    {categoryLabels[item.category] ?? item.category}
                  </span>
                  {selected ? (
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-1.5 text-xs font-extrabold text-white">
                      <CheckCircle2 size={14} aria-hidden="true" />
                      Selected
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-4 p-5">
                  <div>
                    <h2 className="text-xl font-extrabold leading-snug text-[var(--foreground)]">
                      {getTemplateDisplayTitle(item)}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                      {getTemplateDisplayDescription(item)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-extrabold text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-3 py-1.5">
                      <ImageIcon size={14} aria-hidden="true" />
                      {item.requiredImagesMin}-{item.requiredImagesMax} photos
                    </span>
                    {item.requiresAdminReview ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[var(--primary-dark)]">
                        <ShieldCheck size={14} aria-hidden="true" />
                        Admin quality check
                      </span>
                    ) : null}
                  </div>
                  <form action={selectTemplateAction} className="flex items-center justify-between gap-3">
                    <input type="hidden" name="sessionId" value={sessionId ?? ""} />
                    <input type="hidden" name="templateSlug" value={item.slug} />
                    <span className="text-sm font-extrabold text-[var(--foreground)]">
                      From {formatMnt(item.startingPriceMnt)}
                    </span>
                    <Button type="submit" className="gap-2">
                      Continue with this template
                      <ArrowRight size={16} aria-hidden="true" />
                    </Button>
                  </form>
                  <Link
                    href={`/templates/${item.slug}`}
                    className="text-sm font-extrabold text-[var(--primary-dark)] transition hover:text-[var(--primary)]"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
