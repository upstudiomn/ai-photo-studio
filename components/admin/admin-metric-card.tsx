import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function AdminMetricCard({
  label,
  value,
  helper,
  icon,
}: {
  label: string;
  value: number | string;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="rounded-[24px]">
      <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tabular-nums text-[var(--foreground)]">{value}</p>
        </div>
        {icon ? (
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--soft-accent)] text-[var(--primary-dark)]">
            {icon}
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-3 text-xs font-bold leading-5 text-[var(--muted)]">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
