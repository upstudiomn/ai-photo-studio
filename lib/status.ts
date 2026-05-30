import type { OrderStatus, PaymentStatus } from "@/types/studio";

export const orderStatuses: { value: OrderStatus; label: string; tone: string }[] = [
  { value: "uploaded", label: "Uploaded", tone: "bg-[var(--muted-surface)] text-[var(--foreground)]" },
  { value: "ai_processing", label: "AI processing", tone: "bg-[var(--soft-accent)] text-[var(--primary-dark)]" },
  { value: "preview_ready", label: "Preview ready", tone: "bg-[var(--soft-accent)] text-[var(--primary-dark)]" },
  { value: "waiting_approval", label: "Waiting approval", tone: "bg-orange-50 text-[var(--warning)]" },
  { value: "payment_pending", label: "Payment pending", tone: "bg-orange-50 text-[var(--warning)]" },
  { value: "paid", label: "Paid", tone: "bg-[var(--soft-accent)] text-[var(--success)]" },
  { value: "print_ready", label: "Print ready", tone: "bg-[var(--soft-accent)] text-[var(--primary-dark)]" },
  { value: "printing", label: "Printing", tone: "bg-[var(--soft-accent)] text-[var(--primary-dark)]" },
  { value: "packed", label: "Packed", tone: "bg-[var(--soft-accent)] text-[var(--primary-dark)]" },
  { value: "out_for_delivery", label: "Out for delivery", tone: "bg-[var(--soft-accent)] text-[var(--primary-dark)]" },
  { value: "delivered", label: "Delivered", tone: "bg-[var(--soft-accent)] text-[var(--success)]" },
  { value: "revision_requested", label: "Revision requested", tone: "bg-red-50 text-[var(--danger)]" },
];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  refunded: "Refunded",
};

export function getOrderStatusMeta(status: OrderStatus) {
  return orderStatuses.find((item) => item.value === status) ?? orderStatuses[0];
}
