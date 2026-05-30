import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  ImageIcon,
  LockKeyhole,
  PackageCheck,
  Printer,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ImageComparisonSlider } from "@/components/public/image-comparison-slider";
import { ButtonLink } from "@/components/ui/button";
import { aiTemplates, getTemplateDisplayDescription, getTemplateDisplayTitle } from "@/lib/templates";
import { formatMnt } from "@/lib/utils";
import type { AITemplate } from "@/types/studio";

const heroBefore = aiTemplates[0];
const heroAfter = aiTemplates[1];

const trustBadges = [
  { title: "100% Private", text: "Your photos are used only for your order", Icon: LockKeyhole },
  { title: "Fast Preview", text: "See your first result quickly", Icon: Clock3 },
  { title: "A4/A3 Premium Prints", text: "Ulaanbaatar delivery or pickup", Icon: Printer },
  { title: "Quality Review", text: "Faces, hands, and print quality checked", Icon: ShieldCheck },
];

const serviceTemplates = [
  aiTemplates.find((template) => template.id === "tpl_restore"),
  aiTemplates.find((template) => template.id === "tpl_colorize"),
  aiTemplates.find((template) => template.id === "tpl_portrait"),
  aiTemplates.find((template) => template.id === "tpl_family"),
].filter((template): template is AITemplate => Boolean(template));

const howItWorks = [
  {
    title: "Upload photo",
    text: "Add 1-5 reference images and a brief note.",
  },
  {
    title: "Choose a template",
    text: "Select restoration, colorization, portrait, or family package.",
  },
  {
    title: "View AI preview",
    text: "Watermarked preview appears, reviewed if needed.",
  },
  {
    title: "Download or print",
    text: "Get digital files or A4/A3 Premium prints delivered.",
  },
];

const printProducts = [
  {
    title: "A4 Premium Print",
    text: "Perfect for home frames and small gift packages.",
    Icon: ImageIcon,
  },
  {
    title: "A3 Poster Print",
    text: "Ideal for memory posters and premium family gifts.",
    Icon: Printer,
  },
  {
    title: "Premium Photo Paper",
    text: "Matte, satin, or lustre finish available.",
    Icon: BadgeCheck,
  },
  {
    title: "Ulaanbaatar Delivery",
    text: "Pickup or home delivery available.",
    Icon: Truck,
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="grain overflow-hidden border-b border-[var(--line)]">
          <div className="shell relative grid items-center gap-12 py-14 md:py-18 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
            <div className="relative z-10 max-w-[520px]">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--primary-dark)]">
                AI PHOTO & PRINT SERVICE
              </p>
              <h1 className="mt-5 text-[42px] font-extrabold leading-[1.01] tracking-[-0.02em] text-[var(--foreground)] sm:text-5xl lg:text-[64px]">
                Restore your photos.
                <br />
                Create memories.
                <br />
                Order prints delivered.
              </h1>
              <p className="mt-6 text-base font-medium leading-8 text-[var(--muted)] sm:text-lg">
                Restore old photos, add color, create AI portraits, or order A4/A3 prints with delivery.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/create" variant="accent">
                  Upload Photo <ArrowRight size={18} aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/templates" variant="ghost">
                  Browse Templates
                </ButtonLink>
              </div>
            </div>

            <div className="relative z-10">
              <div className="photo-frame relative overflow-hidden bg-white p-4 md:p-5 glass-premium">
                <ImageComparisonSlider
                  beforeImage={heroBefore.previewImageUrl}
                  afterImage={heroAfter.previewImageUrl}
                  beforeAlt="Before restoration"
                  afterAlt="After restoration"
                />

                <div className="mt-4 grid gap-3 rounded-[20px] border border-[var(--line)] bg-[var(--soft-accent)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-extrabold text-[var(--foreground)]">Family Memory Pack</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
                      AI preview + A3 print + quality check
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-white px-3 py-2 text-sm font-extrabold text-[var(--primary-dark)] shadow-sm">
                    From 59,000₮
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-2 hidden rounded-2xl border border-[var(--line)] bg-white px-4 py-3 shadow-[0_18px_45px_var(--shadow-soft)] sm:block glass-premium">
                <p className="flex items-center gap-2 text-sm font-extrabold text-[var(--foreground)]">
                  <CheckCircle2 size={18} className="text-[var(--success)]" aria-hidden="true" />
                  Preview includes watermark
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="shell py-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustBadges.map(({ title, text, Icon }) => (
              <article key={title} className="rounded-[22px] border border-[var(--line)] bg-white p-5 shadow-[0_14px_40px_var(--shadow-soft)] glass-premium card-glow">
                <Icon className="text-[var(--primary)]" size={24} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-extrabold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="shell py-14">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--primary-dark)]">
                Memory Services
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
                Main Services
              </h2>
            </div>
            <ButtonLink href="/templates" variant="ghost">
              View All Templates
            </ButtonLink>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {serviceTemplates.map((template) => (
              <article key={template.id} className="group overflow-hidden rounded-[24px] border border-[var(--line)] bg-white shadow-[0_18px_50px_var(--shadow-soft)] glass-premium card-glow">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--soft-accent)]">
                  <Image
                    src={template.previewImageUrl}
                    alt={getTemplateDisplayTitle(template)}
                    width={640}
                    height={480}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-extrabold text-[var(--primary-dark)] shadow-sm">
                    {template.category}
                  </span>
                </div>
                <div className="grid gap-4 p-5">
                  <div>
                    <h3 className="text-xl font-extrabold leading-tight">{getTemplateDisplayTitle(template)}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{getTemplateDisplayDescription(template)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-extrabold">From {formatMnt(template.startingPriceMnt)}</span>
                    <ButtonLink href={`/templates/${template.slug}`} variant="ghost" className="min-h-10 px-3 py-2">
                      Start
                    </ButtonLink>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[var(--muted-surface)] py-16">
          <div className="shell">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--primary-dark)]">
                Order Steps
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
                How It Works
              </h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {howItWorks.map((step, index) => (
                <article key={step.title} className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-[0_14px_36px_var(--shadow-soft)] glass-premium card-glow">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[var(--soft-accent)] text-lg font-extrabold text-[var(--primary-dark)]">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="print-products" className="shell py-16">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--primary-dark)]">
                Prints & Delivery
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
                Print Products
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                Turn your photos into family gifts, wall posters, or premium prints.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {printProducts.map(({ title, text, Icon }) => (
                <article key={title} className="rounded-[24px] border border-[var(--line)] bg-white p-6 shadow-[0_16px_44px_var(--shadow-soft)] glass-premium card-glow">
                  <Icon className="text-[var(--primary)]" size={28} aria-hidden="true" />
                  <h3 className="mt-5 text-2xl font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="shell pb-16">
          <div className="grid gap-6 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--soft-accent)] p-7 shadow-[0_18px_50px_var(--shadow-soft)] md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div className="max-w-2xl">
              <p className="flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[var(--primary-dark)]">
                <PackageCheck size={15} aria-hidden="true" />
                Private Photo Handling
              </p>
              <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.02em] md:text-5xl">
                Your photos are protected
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                Your photos are used only for processing your order. Preview images include watermarks, and full-resolution files are available only after payment confirmation.
              </p>
            </div>
              <ButtonLink href="/create" variant="accent" className="w-fit">
              Upload Photo
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
