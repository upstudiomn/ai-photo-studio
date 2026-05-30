import { CheckCircle2, Download, Printer, Truck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatMnt } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ProductChoice } from "@/types/studio";

function ProductIcon({ choice }: { choice: ProductChoice }) {
  if (choice.includesDigital && choice.includesPrint) {
    return <Truck size={20} aria-hidden="true" />;
  }

  if (choice.includesPrint) {
    return <Printer size={20} aria-hidden="true" />;
  }

  return <Download size={20} aria-hidden="true" />;
}

export function ProductChoiceCard({
  choice,
  href,
  selected,
}: {
  choice: ProductChoice;
  href: string;
  selected: boolean;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card
        className={cn(
          "h-full transition duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]",
          selected && "border-[var(--primary)] bg-[var(--soft-accent)]",
        )}
      >
        <CardContent className="grid h-full gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <span
              className={cn(
                "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--soft-accent)] text-[var(--primary-dark)]",
                selected && "bg-white",
              )}
            >
              <ProductIcon choice={choice} />
            </span>
            {selected ? (
              <Badge className="gap-1.5">
                <CheckCircle2 size={14} aria-hidden="true" />
                Selected
              </Badge>
            ) : null}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[var(--foreground)]">{choice.titleMn}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{choice.descriptionMn}</p>
          </div>
          <p className="mt-auto border-t border-[var(--line)] pt-4 text-lg font-extrabold text-[var(--foreground)]">
            {formatMnt(choice.priceMnt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
