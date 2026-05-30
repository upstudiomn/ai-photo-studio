import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneByStatus: Record<string, string> = {
  draft: "border-[var(--line)] bg-white text-[var(--muted)]",
  uploaded: "border-[var(--line)] bg-[var(--muted-surface)] text-[var(--foreground)]",
  template_selected: "border-[var(--line)] bg-[var(--soft-accent)] text-[var(--primary-dark)]",
  generating: "border-[var(--line)] bg-[var(--soft-accent)] text-[var(--primary-dark)]",
  preview_ready: "border-[var(--primary)] bg-[var(--soft-accent)] text-[var(--primary-dark)]",
  failed: "border-red-100 bg-red-50 text-[var(--danger)]",
  converted_to_order: "border-[var(--line)] bg-white text-[var(--foreground)]",
  pending_payment: "border-orange-100 bg-orange-50 text-[var(--warning)]",
  unpaid: "border-orange-100 bg-orange-50 text-[var(--warning)]",
  pending: "border-orange-100 bg-orange-50 text-[var(--warning)]",
  paid: "border-[var(--line)] bg-[var(--soft-accent)] text-[var(--success)]",
  preparing_final: "border-[var(--line)] bg-[var(--soft-accent)] text-[var(--primary-dark)]",
  print_ready: "border-[var(--primary)] bg-[var(--soft-accent)] text-[var(--primary-dark)]",
  printing: "border-[var(--primary)] bg-[var(--soft-accent)] text-[var(--primary-dark)]",
  packed: "border-[var(--line)] bg-[var(--soft-accent)] text-[var(--primary-dark)]",
  out_for_delivery: "border-[var(--line)] bg-[var(--soft-accent)] text-[var(--primary-dark)]",
  delivered: "border-[var(--line)] bg-[var(--soft-accent)] text-[var(--success)]",
  cancelled: "border-red-100 bg-red-50 text-[var(--danger)]",
  refunded: "border-red-100 bg-red-50 text-[var(--danger)]",
  revision_requested: "border-red-100 bg-red-50 text-[var(--danger)]",
};

const labelByStatus: Record<string, string> = {
  draft: "Draft",
  uploaded: "Uploaded",
  template_selected: "Template selected",
  generating: "AI processing",
  preview_ready: "Preview ready",
  failed: "Failed",
  converted_to_order: "Order created",
  pending_payment: "Payment pending",
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  preparing_final: "Preparing",
  print_ready: "Print ready",
  printing: "Printing",
  packed: "Packed",
  out_for_delivery: "Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
  revision_requested: "Revision",
};

function StatusIcon({ status }: { status: string }) {
  if (["paid", "preview_ready", "delivered"].includes(status)) {
    return <CheckCircle2 size={13} aria-hidden="true" />;
  }

  if (["failed", "cancelled", "refunded", "revision_requested"].includes(status)) {
    return <AlertCircle size={13} aria-hidden="true" />;
  }

  return <Clock3 size={13} aria-hidden="true" />;
}

export function AdminStatusBadge({ status, className }: { status?: string | null; className?: string }) {
  const value = status ?? "unknown";
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex w-fit items-center gap-1.5 px-3 py-1 text-xs font-extrabold",
        toneByStatus[value] ?? "border-[var(--line)] bg-white text-[var(--foreground)]",
        className,
      )}
    >
      <StatusIcon status={value} />
      {labelByStatus[value] ?? value}
    </Badge>
  );
}
