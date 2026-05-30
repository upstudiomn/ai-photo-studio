import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--primary-dark)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--foreground)]">{title}</h2>
        {description ? <p className="mt-3 leading-7 text-[var(--muted)]">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
