import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { loginCustomerAction } from "@/app/auth/actions";

const errorMessages: Record<string, string> = {
  "missing-identifier": "Please enter your email or phone.",
  "missing-password": "Please enter your password.",
  invalid: "Invalid login credentials.",
};

const noticeMessages: Record<string, string> = {
  "check-email": "Please verify your email and try logging in again.",
  "signed-up": "Account created successfully.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const errorMessage = error ? errorMessages[error] : null;
  const noticeMessage = message ? noticeMessages[message] : null;

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_20px_70px_var(--shadow-soft)] sm:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
              CUSTOMER ACCESS
            </p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.04] text-[var(--foreground)] sm:text-5xl">
              Sign In
            </h1>
            <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
              Sign in with your email or phone to track your previews and orders.
            </p>
            <div className="mt-8 rounded-[22px] border border-[var(--line)] bg-[var(--soft-accent)] p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 text-[var(--primary-dark)]" size={20} aria-hidden="true" />
                <p className="text-sm font-bold leading-6 text-[var(--foreground)]">
                  Phone + password login does not use SMS OTP. Your registered phone is securely linked to your email.
                </p>
              </div>
            </div>
          </div>

          <form
            action={loginCustomerAction}
            className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-[0_20px_70px_var(--shadow-soft)] sm:p-7"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-[var(--foreground)]">My Account</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Enter your login details.
              </p>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-[var(--foreground)]">Email or phone</span>
                <input
                  name="identifier"
                  className="min-h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[var(--primary)]"
                  autoComplete="username"
                  required
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-[var(--foreground)]">Password</span>
                <input
                  name="password"
                  type="password"
                  className="min-h-12 rounded-2xl border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[var(--primary)]"
                  autoComplete="current-password"
                  required
                />
              </label>
            </div>

            {noticeMessage ? (
              <p className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--soft-accent)] px-4 py-3 text-sm font-bold text-[var(--primary-dark)]">
                {noticeMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="mt-5 rounded-2xl border border-[#C84646]/25 bg-[#C84646]/10 px-4 py-3 text-sm font-bold text-[#9F3333]">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" className="gap-2">
                Sign In
                <ArrowRight size={17} aria-hidden="true" />
              </Button>
              <Link href="/auth/signup" className="text-sm font-extrabold text-[var(--primary-dark)]">
                Create new account
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-[var(--line)] bg-[var(--muted-surface)] p-4">
              <LockKeyhole className="mt-0.5 text-[var(--primary-dark)]" size={18} aria-hidden="true" />
              <p className="text-sm font-semibold leading-6 text-[var(--muted)]">
                We do not show detailed reasons for incorrect login credentials.
              </p>
            </div>
          </form>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
