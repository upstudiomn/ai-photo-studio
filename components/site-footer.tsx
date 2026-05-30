import Link from "next/link";
import { Camera, ShieldCheck, Printer, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--background)]">
      <div className="shell py-12">
        <Card className="mb-10 grid gap-4 rounded-[20px] p-5 shadow-[0_12px_34px_rgba(21,23,22,0.05)] sm:grid-cols-3">
          <span className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
            <ShieldCheck size={17} className="text-[var(--primary)]" aria-hidden="true" />
            Private Photo Handling
          </span>
          <span className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
            <Printer size={17} className="text-[var(--primary)]" aria-hidden="true" />
            Quality Review
          </span>
          <span className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
            <PackageCheck size={17} className="text-[var(--primary)]" aria-hidden="true" />
            Local Production
          </span>
        </Card>

        {/* Main Footer Grid */}
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand Column */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-white">
                <Camera size={18} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="text-base font-extrabold text-[var(--foreground)]">
                AI Photo Studio
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              Restore your photos. Create memories. Order prints delivered.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge className="gap-1.5">
                <ShieldCheck size={13} aria-hidden="true" />
                Privacy
              </Badge>
              <Badge className="gap-1.5">
                <PackageCheck size={13} aria-hidden="true" />
                Local Print
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
              Navigation
            </h3>
            <nav className="mt-4 grid gap-2.5">
              <Link
                href="/create"
                className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Upload Photo
              </Link>
              <Link
                href="/templates"
                className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Templates
              </Link>
              <Link
                href="/account"
                className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Account
              </Link>
              <Link
                href="/#print-products"
                className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Prints & Delivery
              </Link>
            </nav>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
              Services
            </h3>
            <nav className="mt-4 grid gap-2.5">
              <Link
                href="/templates/old-photo-restoration"
                className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Old Photo Restoration
              </Link>
              <Link
                href="/templates/ai-studio-portrait"
                className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                AI Studio Portrait
              </Link>
              <Link
                href="/templates/black-white-colorization"
                className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                Colorization
              </Link>
              <Link
                href="/#print-products"
                className="text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
              >
                A4/A3 Premium Prints
              </Link>
            </nav>
          </div>

          {/* Trust */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--muted)]">
              Your Trust
            </h3>
            <nav className="mt-4 grid gap-2.5">
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                <ShieldCheck size={15} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
                Private Photo Handling
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                <Printer size={15} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
                Quality Review
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-[var(--muted)]">
                <PackageCheck size={15} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
                Local Production
              </span>
            </nav>
          </div>
        </div>

        {/* Bottom Row */}
        <Separator className="mt-10" />
        <div className="flex flex-col items-center justify-between gap-3 pt-8 text-center md:flex-row">
          <p className="text-xs font-medium text-[var(--muted)]">
            © {new Date().getFullYear()} AI Photo Studio · Mongolia
          </p>
          <p className="text-xs text-[var(--muted)]">
            Local photo service · Ulaanbaatar
          </p>
        </div>
      </div>
    </footer>
  );
}
