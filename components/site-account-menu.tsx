"use client";

import Link from "next/link";
import { ChevronDown, CircleUserRound, LayoutDashboard, LogOut, Settings, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabaseBrowserClient } from "@/lib/supabase/client";

function getInitials(email?: string | null) {
  if (!email) return "AI";
  const name = email.split("@")[0] ?? "";
  return name.slice(0, 2).toUpperCase() || "AI";
}

export function SiteAccountMenu() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!supabaseBrowserClient) {
      return () => {
        active = false;
      };
    }

    supabaseBrowserClient.auth.getUser().then(({ data }) => {
      if (!active) return;
      setIsLoggedIn(Boolean(data.user));
      setEmail(data.user?.email ?? null);
    });

    const { data: listener } = supabaseBrowserClient.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const initials = useMemo(() => getInitials(email), [email]);

  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button
          variant="icon"
          aria-label={isLoggedIn ? "Account menu" : "Sign in menu"}
          className="group gap-2 rounded-2xl px-2.5 shadow-[0_10px_25px_rgba(21,23,22,0.05)]"
        >
          {isLoggedIn ? (
            <Avatar className="size-8 border border-[var(--line)]">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          ) : (
            <span className="grid size-8 place-items-center rounded-full bg-[var(--soft-accent)] text-[var(--primary-dark)]">
              <CircleUserRound size={18} aria-hidden="true" />
            </span>
          )}
          <ChevronDown
            className="hidden text-[var(--muted)] transition-transform group-data-[state=open]:rotate-180 sm:block"
            size={15}
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mr-2 w-[232px]">
        {isLoggedIn ? (
          <>
            <DropdownMenuLabel>
              <span className="block">Account</span>
              {email ? (
                <span className="mt-1 block truncate normal-case tracking-normal text-[11px] font-bold text-[var(--foreground)]">
                  {email}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/account">
                <LayoutDashboard size={17} aria-hidden="true" />
                My Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account">
                <Settings size={17} aria-hidden="true" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-[#9F3333] focus:bg-[#C84646]/10 focus:text-[#9F3333]">
              <Link href="/auth/logout">
                <LogOut size={17} aria-hidden="true" />
                Sign Out
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/auth/login">
                <CircleUserRound size={17} aria-hidden="true" />
                Sign In
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auth/signup">
                <LayoutDashboard size={17} aria-hidden="true" />
                Sign Up
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/create">
                <Upload size={17} aria-hidden="true" />
                Upload Photo
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
