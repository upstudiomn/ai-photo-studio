import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminForbidden() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-12">
      <section className="w-full max-w-lg rounded-[28px] border border-[var(--line)] bg-white p-8 text-center shadow-[0_24px_70px_var(--shadow-soft)]">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#C84646]/10 text-[var(--danger)]">
          <ShieldAlert size={26} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-[var(--foreground)]">Admin access required</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-[var(--muted)]">
          Your account is signed in, but it is not authorized to open AI Photo Studio admin tools.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </section>
    </main>
  );
}
