import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMnt } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PrintOption } from "@/types/studio";

export function PrintOptionCard({ option, selected = false }: { option: PrintOption; selected?: boolean }) {
  return (
    <Card className={cn("rounded-[22px] shadow-[0_12px_35px_var(--shadow-soft)]", selected && "border-[var(--primary)] bg-[var(--soft-accent)]")}>
      <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[var(--foreground)]">{option.label}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{option.description}</p>
        </div>
        {selected ? (
          <Badge className="gap-1.5">
            <CheckCircle2 size={14} aria-hidden="true" />
            Selected
          </Badge>
        ) : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--line)] pt-4 text-sm">
        <span className="font-bold text-[var(--muted)]">{option.size ? `${option.size} package` : "Digital"}</span>
        <strong className="text-[var(--foreground)]">{formatMnt(option.priceMnt)}</strong>
      </div>
      </CardContent>
    </Card>
  );
}
