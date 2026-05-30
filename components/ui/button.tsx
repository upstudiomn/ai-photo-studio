import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-white shadow-[0_10px_25px_rgba(111,143,114,0.24)] hover:bg-[var(--primary-dark)]",
        primary: "bg-[var(--primary)] text-white shadow-[0_10px_25px_rgba(111,143,114,0.24)] hover:bg-[var(--primary-dark)]",
        accent: "bg-[var(--primary)] text-white shadow-[0_10px_25px_rgba(111,143,114,0.24)] hover:bg-[var(--primary-dark)]",
        destructive: "bg-[var(--danger)] text-white hover:bg-[#9F3333]",
        outline: "border border-[var(--line)] bg-white text-[var(--foreground)] hover:bg-[var(--soft-accent)] hover:text-[var(--primary-dark)]",
        secondary: "bg-[var(--soft-accent)] text-[var(--primary-dark)] hover:bg-[#dce8d8]",
        ghost: "border border-[var(--line)] bg-white/70 text-[var(--foreground)] hover:bg-[var(--soft-accent)] hover:text-[var(--primary-dark)]",
        icon: "border border-[var(--line)] bg-white text-[var(--foreground)] shadow-[0_10px_25px_rgba(21,23,22,0.05)] hover:bg-[var(--soft-accent)]",
        link: "min-h-0 rounded-none px-0 py-0 text-[var(--primary-dark)] underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-3",
        sm: "min-h-9 rounded-lg px-3",
        lg: "min-h-12 rounded-2xl px-6 text-base",
        icon: "size-11 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof buttonVariants> & {
    href: string;
    children: ReactNode;
  };

function ButtonLink({
  className,
  variant = "default",
  size = "default",
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Link>
  );
}

export { Button, ButtonLink, buttonVariants };
