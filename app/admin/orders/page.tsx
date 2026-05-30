import { AdminDataTable, TableCell, TableRow } from "@/components/admin/admin-data-table";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getProductChoiceDisplayTitle } from "@/lib/preview-flow";
import { formatDateTime, formatMnt, shortId } from "@/lib/utils";
import { listAdminConfirmedOrders } from "@/server/admin";

async function getOrders() {
  try {
    const orders = await listAdminConfirmedOrders(100);
    return { orders, source: "supabase" as const };
  } catch (error) {
    console.error("Failed to load admin orders.", error);
    return { orders: [], source: "fallback" as const };
  }
}

const filters = ["All", "Pending payment", "Paid", "Print ready", "Printing", "Delivered"];

export default async function AdminOrdersPage() {
  const { orders, source } = await getOrders();

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Confirmed orders</Badge>
          <h1 className="mt-2 text-4xl font-extrabold text-[var(--foreground)]">Orders</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            This list shows only checkout-confirmed orders.
          </p>
        </div>
        <AdminStatusBadge status={source === "supabase" ? "paid" : "draft"} />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <Badge
            key={filter}
            variant="outline"
            className="min-h-10 shrink-0 bg-white px-4 text-sm"
          >
            {filter}
          </Badge>
        ))}
      </div>

      {orders.length > 0 ? (
        <AdminDataTable
          columns={["Order", "Customer", "Product", "Payment", "Order status", "Print", "Total", "Created", "Action"]}
        >
          {orders.map((order) => {
            const printJob = order.print_jobs?.[0];
            return (
              <TableRow key={order.id} className="align-top">
                <TableCell className="font-extrabold">{shortId(order.id)}</TableCell>
                <TableCell>
                  <div className="font-extrabold">{order.customer_name ?? "No name"}</div>
                  <div className="text-xs font-bold text-[var(--muted)]">{order.customer_phone ?? "No phone"}</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">
                    {getProductChoiceDisplayTitle(order.order_items?.[0]?.item_type, order.order_items?.[0]?.title)}
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    {order.generation_sessions?.ai_templates?.title_en ?? "Template"}
                  </div>
                </TableCell>
                <TableCell><AdminStatusBadge status={order.payment_status} /></TableCell>
                <TableCell><AdminStatusBadge status={order.status} /></TableCell>
                <TableCell>
                  {printJob ? <AdminStatusBadge status={printJob.status} /> : <span className="text-xs font-bold text-[var(--muted)]">Digital</span>}
                </TableCell>
                <TableCell className="font-extrabold">{formatMnt(order.total_price)}</TableCell>
                <TableCell className="text-xs font-bold text-[var(--muted)]">{formatDateTime(order.created_at)}</TableCell>
                <TableCell>
                  <ButtonLink href={`/admin/orders/${order.id}`} size="sm">
                    Open
                  </ButtonLink>
                </TableCell>
              </TableRow>
            );
          })}
        </AdminDataTable>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white p-6 text-sm font-bold leading-6 text-[var(--muted)]">
          No confirmed orders found yet. Orders appear here only after checkout confirmation.
        </div>
      )}
    </section>
  );
}
