import { Badge } from "@/components/ui/badge";
import { getOrderStatusMeta } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/studio";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = getOrderStatusMeta(status);

  return (
    <Badge variant="secondary" className={cn("border-transparent font-sans", meta.tone)}>
      {meta.label}
    </Badge>
  );
}
