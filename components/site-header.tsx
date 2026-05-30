"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Menu, X } from "lucide-react";
import { useState } from "react";
import { SiteAccountMenu } from "@/components/site-account-menu";
import { Button, ButtonLink } from "@/components/ui/button";

const navLinks = [
  { href: "/templates", label: "Templates" },
  { href: "/account", label: "Account" },
  { href: "/#print-products", label: "Prints" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-header">
      <div className="shell flex h-[68px] items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-[0_4px_14px_rgba(111,143,114,0.35)] transition-transform duration-200 group-hover:scale-105">
            <Camera size={20} strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="block text-lg font-extrabold leading-tight tracking-[-0.01em] text-[var(--foreground)]">
            AI Photo Studio
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-[var(--soft-accent)] text-[var(--primary-dark)]"
                    : "text-[var(--muted)] hover:bg-[var(--muted-surface)] hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA + Account */}
        <div className="hidden items-center gap-2 sm:flex">
          <ButtonLink href="/create" variant="accent">
            Upload Photo
          </ButtonLink>
          <SiteAccountMenu />
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <SiteAccountMenu />
          <Button
            type="button"
            variant="icon"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="size-10 shrink-0"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--line)] bg-[var(--background)]/90 backdrop-blur-md px-4 pb-4 pt-3 sm:hidden">
          <nav className="grid gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--soft-accent)] text-[var(--primary-dark)]"
                      : "text-[var(--muted)] hover:bg-[var(--muted-surface)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3">
            <ButtonLink
              href="/create"
              variant="accent"
              className="w-full justify-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Upload Photo
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
