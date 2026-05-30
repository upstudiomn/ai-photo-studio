"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusOption {
  value: string;
  label: string;
}

interface AdminStatusUpdateInlineProps {
  type: "order" | "payment" | "print";
  currentStatus: string;
  orderId?: string;
  paymentId?: string;
  printJobId?: string;
}

const PRINT_STATUSES: StatusOption[] = [
  { value: "print_ready", label: "Print ready" },
  { value: "printing", label: "Printing" },
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const ORDER_STATUSES: StatusOption[] = [
  { value: "pending_payment", label: "Pending payment" },
  { value: "paid", label: "Paid" },
  { value: "preparing_final", label: "Preparing" },
  { value: "print_ready", label: "Print ready" },
  { value: "printing", label: "Printing" },
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUSES: StatusOption[] = [
  { value: "unpaid", label: "Unpaid" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export function AdminStatusUpdateInline({
  type,
  currentStatus,
  orderId,
  paymentId,
  printJobId,
}: AdminStatusUpdateInlineProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);

  const statuses = type === "order" ? ORDER_STATUSES : type === "payment" ? PAYMENT_STATUSES : PRINT_STATUSES;
  const currentLabel = statuses.find((s) => s.value === currentStatus)?.label ?? currentStatus;

  async function handleSave() {
    if (selectedStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          status: selectedStatus,
          orderId,
          paymentId,
          printJobId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error ?? "Failed to update");
        return;
      }
    } catch {
      setError("Failed to update");
      return;
    } finally {
      setIsSaving(false);
    }

    setIsOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-8 items-center rounded-lg border border-[var(--line)] bg-white px-2.5 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:bg-[var(--soft-accent)] hover:text-[var(--primary-dark)]"
      >
        {currentLabel}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[150px]">
        <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isPending || isSaving}>
          <SelectTrigger className="min-h-8 rounded-lg px-2 py-1 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
      </div>
      {error && (
        <span className="flex items-center gap-0.5 text-[10px] text-[var(--danger)]">
          <AlertCircle size={10} />
        </span>
      )}
      <Button
        type="button"
        size="sm"
        onClick={handleSave}
        disabled={isPending || isSaving}
        className="min-h-8 rounded-lg px-2"
      >
        {isSaving ? "..." : <Check size={12} aria-hidden="true" />}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          setIsOpen(false);
          setError(null);
          setSelectedStatus(currentStatus);
        }}
        className="min-h-8 rounded-lg px-2"
      >
        Cancel
      </Button>
    </div>
  );
}
