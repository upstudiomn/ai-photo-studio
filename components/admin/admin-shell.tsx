"use client";

import {
  ClipboardList,
  FileImage,
  GalleryHorizontalEnd,
  LayoutDashboard,
  PackageCheck,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/sessions", label: "AI sessions", icon: Sparkles },
  { href: "/admin/review", label: "Review queue", icon: ShieldCheck },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/print-queue", label: "Print queue", icon: PackageCheck },
  { href: "/admin/templates", label: "Templates", icon: GalleryHorizontalEnd },
  { href: "/admin", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-[var(--background)] lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="border-b border-[var(--line)] bg-white/90 p-4 backdrop-blur lg:sticky lg:top-0 lg:h-dvh lg:border-b-0 lg:border-r lg:p-5">
        <Link href="/admin" className="flex items-center gap-3 rounded-[20px] border border-[var(--line)] bg-[var(--muted-surface)] p-3 shadow-[0_10px_30px_var(--shadow-soft)]">
          <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
            <FileImage size={21} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-extrabold text-[var(--foreground)]">AI Photo Studio</span>
            <span className="block text-xs font-bold text-[var(--muted)]">Admin operations</span>
          </span>
        </Link>

        <div className="mt-5 flex items-center justify-between gap-3 px-2">
          <Badge variant="outline">SaaS ops</Badge>
          <span className="text-xs font-bold text-[var(--muted)]">Preview-first</span>
        </div>

        <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
          {adminLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin" && item.label === "Overview"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-extrabold transition hover:bg-[var(--soft-accent)]",
                  isActive
                    ? "bg-[var(--soft-accent)] text-[var(--primary-dark)] shadow-[inset_0_0_0_1px_var(--line)]"
                    : "text-[var(--foreground)]",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} className={isActive ? "text-[var(--primary-dark)]" : "text-[var(--muted)]"} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="border-b border-[var(--line)] bg-white/72 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--primary-dark)]">
                Operations workspace
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--muted)]">
                Preview-first sessions, confirmed orders, payment, print fulfillment.
              </p>
            </div>
            <ButtonLink href="/" variant="outline" size="sm">
              Public site
            </ButtonLink>
          </div>
        </header>
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
