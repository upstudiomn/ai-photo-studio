"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
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

interface AdminStatusUpdateProps {
  type: "order" | "payment" | "print";
  currentStatus: string;
  orderId?: string;
  paymentId?: string;
  printJobId?: string;
  onSuccess?: () => void;
}

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

const PRINT_STATUSES: StatusOption[] = [
  { value: "print_ready", label: "Print ready" },
  { value: "printing", label: "Printing" },
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function AdminStatusUpdate({
  type,
  currentStatus,
  orderId,
  paymentId,
  printJobId,
  onSuccess,
}: AdminStatusUpdateProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const statuses = type === "order" ? ORDER_STATUSES : type === "payment" ? PAYMENT_STATUSES : PRINT_STATUSES;

  const currentLabel = statuses.find((s) => s.value === currentStatus)?.label ?? currentStatus;

  async function handleSave() {
    if (selectedStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setError(null);
    setSuccess(false);
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
        setError(result.error ?? "Failed to update status");
        return;
      }
    } catch {
      setError("Failed to update status.");
      return;
    } finally {
      setIsSaving(false);
    }

    setSuccess(true);
    setIsOpen(false);
    startTransition(() => {
      router.refresh();
      onSuccess?.();
    });

    // Reset success state after a delay
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <div className="space-y-2">
      {isOpen ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[0_10px_30px_var(--shadow-soft)]">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Current status</span>
            <AdminStatusBadge status={currentStatus} />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={isPending || isSaving}>
            <SelectTrigger className="min-h-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[var(--danger)]">
              <AlertCircle size={13} aria-hidden="true" />
              {error}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isPending || isSaving}
            >
              {isSaving ? "Saving..." : <><Check size={13} aria-hidden="true" /> Save</>}
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
              disabled={isPending || isSaving}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="justify-start"
        >
          {currentLabel}
        </Button>
      )}
      {success && !isOpen && (
        <p className="flex items-center gap-1 text-xs font-bold text-[var(--success)]">
          <Check size={13} aria-hidden="true" /> Updated
        </p>
      )}
    </div>
  );
}
