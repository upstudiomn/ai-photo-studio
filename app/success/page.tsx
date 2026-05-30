import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";

const nextSteps = [
  "Payment confirmed",
  "Final file prepared",
  "Print starts if selected",
  "Delivered when ready",
];

export default function SuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell grid min-h-[66vh] place-items-center py-12 sm:py-16">
        <section className="w-full max-w-3xl rounded-[28px] border border-[var(--line)] bg-white p-6 text-center shadow-[0_24px_80px_var(--shadow-soft)] sm:p-10">
          <span className="mx-auto inline-flex size-18 items-center justify-center rounded-[26px] bg-[var(--soft-accent)] text-[var(--primary-dark)]">
            <CheckCircle2 size={44} aria-hidden="true" />
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
            Order confirmed
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Your selected preview and digital/print selection confirmed. Track the next steps on your order status page.
          </p>

          <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">
            {nextSteps.map((step, index) => (
              <div key={step} className="rounded-[20px] border border-[var(--line)] bg-[var(--muted-surface)] p-4">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-extrabold text-white">
                  {index + 1}
                </span>
                <p className="mt-3 font-extrabold leading-snug text-[var(--foreground)]">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/create" className="gap-2">
              Start another preview
              <ArrowRight size={17} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/templates" variant="ghost">
              Browse other templates
            </ButtonLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
