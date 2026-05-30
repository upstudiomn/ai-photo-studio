import Link from "next/link";
import { Mail, Phone, UserRound } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentProfile, getCurrentUser } from "@/server/auth";

export default async function AccountPage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  return (
    <>
      <SiteHeader />
      <main className="shell py-8 sm:py-12">
        <section className="mx-auto max-w-4xl rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_20px_70px_var(--shadow-soft)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
                ACCOUNT
              </p>
              <h1 className="mt-3 text-4xl font-extrabold text-[var(--foreground)]">My Account</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted)]">
                Preview-first flow remains: view your preview first, then confirm your digital/print selection.
              </p>
            </div>
            <ButtonLink href="/create" variant="accent">
              Upload Photo
            </ButtonLink>
          </div>

          {user ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--muted-surface)] p-5">
                <UserRound className="text-[var(--primary-dark)]" size={22} aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-[var(--muted)]">Name</p>
                <p className="mt-1 font-extrabold text-[var(--foreground)]">
                  {profile?.full_name ?? "Registered user"}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--muted-surface)] p-5">
                <Mail className="text-[var(--primary-dark)]" size={22} aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-[var(--muted)]">Email</p>
                <p className="mt-1 break-words font-extrabold text-[var(--foreground)]">
                  {profile?.email ?? user.email ?? "-"}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--muted-surface)] p-5">
                <Phone className="text-[var(--primary-dark)]" size={22} aria-hidden="true" />
                <p className="mt-3 text-sm font-bold text-[var(--muted)]">Phone</p>
                <p className="mt-1 font-extrabold text-[var(--foreground)]">{profile?.phone ?? "-"}</p>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-[var(--soft-accent)] p-5">
              <p className="font-extrabold text-[var(--foreground)]">You are not signed in.</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                You can upload photos without signing in. An account is needed to track your orders.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/auth/login">Sign In</ButtonLink>
                <ButtonLink href="/auth/signup" variant="ghost">
                  Create Account
                </ButtonLink>
              </div>
            </div>
          )}

          <div className="mt-8 border-t border-[var(--line)] pt-5">
            <Link href="/auth/logout" className="text-sm font-extrabold text-[var(--primary-dark)]">
              Sign Out
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
