import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[var(--soft-accent)] text-[var(--primary-dark)]",
        secondary: "border-[var(--line)] bg-white text-[var(--muted)]",
        outline: "border-[var(--line)] bg-white text-[var(--foreground)]",
        success: "border-transparent bg-[#E5F4EC] text-[var(--success)]",
        warning: "border-transparent bg-[#F7E8DA] text-[var(--warning)]",
        destructive: "border-transparent bg-[#F8E4E4] text-[var(--danger)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
