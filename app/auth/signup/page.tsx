import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck, UserPlus } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { signUpCustomerAction } from "@/app/auth/actions";

const errorMessages: Record<string, string> = {
  missing: "Please fill in all fields.",
  password: "Password must be at least 6 characters.",
  phone: "An account with this phone number already exists.",
  signup: "Account creation failed. Please check your details and try again.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] : null;

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_20px_70px_var(--shadow-soft)] sm:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
              ACCOUNT
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.04] text-[var(--foreground)] sm:text-5xl">
              Create Account
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
              Signing in is not required to start AI processing, but is needed to track your orders.
            </p>

            <div className="mt-8 grid gap-4">
              {[
                "Preview-first flow remains as is",
                "Easy order tracking after",
                "Password stored only in Supabase Auth",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--soft-accent)] px-4 py-3"
                >
                  <ShieldCheck className="text-[var(--primary-dark)]" size={20} aria-hidden="true" />
                  <span className="font-bold text-[var(--foreground)]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <form
            action={signUpCustomerAction}
            className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-[0_20px_70px_var(--shadow-soft)] sm:p-7"
          >
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-[var(--soft-accent)] text-[var(--primary-dark)]">
                <UserPlus size={23} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--foreground)]">New customer</h2>
                <p className="text-sm leading-6 text-[var(--muted)]">Please enter your details accurately.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-[var(--foreground)]">First name</span>
                <input
                  name="firstName"
                  className="min-h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[var(--primary)]"
                  autoComplete="given-name"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-[var(--foreground)]">Last name</span>
                <input
                  name="lastName"
                  className="min-h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[var(--primary)]"
                  autoComplete="family-name"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-[var(--foreground)]">Phone</span>
                <input
                  name="phone"
                  className="min-h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[var(--primary)]"
                  autoComplete="tel"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-[var(--foreground)]">Email</span>
                <input
                  name="email"
                  type="email"
                  className="min-h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[var(--primary)]"
                  autoComplete="email"
                  required
                />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-extrabold text-[var(--foreground)]">Password</span>
                <input
                  name="password"
                  type="password"
                  minLength={6}
                  className="min-h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[var(--primary)]"
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>

            {errorMessage ? (
              <p className="mt-5 rounded-2xl border border-[#C84646]/25 bg-[#C84646]/10 px-4 py-3 text-sm font-bold text-[#9F3333]">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" className="gap-2">
                Create Account
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
              <Link href="/auth/login" className="text-sm font-extrabold text-[var(--primary-dark)]">
                Already have an account
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--soft-accent)] p-4">
              <LockKeyhole className="mt-0.5 shrink-0 text-[var(--primary-dark)]" size={18} aria-hidden="true" />
              <p className="text-sm font-semibold leading-6 text-[var(--foreground)]">
                We do not store your password separately. Authentication is handled by Supabase Auth.
              </p>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
