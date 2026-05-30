"use client";

import { useState } from "react";
import { orderStatuses } from "@/lib/status";
import type { OrderStatus } from "@/types/studio";

export function AdminStatusControls({ initialStatus }: { initialStatus: OrderStatus }) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  return (
    <div className="grid gap-3">
      <p className="font-sans text-sm font-bold text-[var(--muted)]">Mock status controls</p>
      <div className="flex flex-wrap gap-2">
        {orderStatuses.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatus(item.value)}
            className={`rounded-md border px-3 py-2 font-sans text-xs font-bold transition ${
              status === item.value
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--line)] bg-white/60 text-[var(--foreground)] hover:bg-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

