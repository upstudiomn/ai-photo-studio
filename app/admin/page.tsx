import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductChoiceDisplayTitle } from "@/lib/preview-flow";
import { formatDateTime, formatMnt, shortId } from "@/lib/utils";
import {
  getAdminDashboardMetrics,
  listAdminConfirmedOrders,
  listAdminGenerationSessions,
} from "@/server/admin";

async function getDashboardData() {
  try {
    const [metrics, sessions, orders] = await Promise.all([
      getAdminDashboardMetrics(),
      listAdminGenerationSessions(5),
      listAdminConfirmedOrders(5),
    ]);

    return { metrics, sessions, orders, source: "supabase" as const };
  } catch (error) {
    console.error("Failed to load admin dashboard data.", error);
    return {
      metrics: {
        activeSessions: 0,
        previewReady: 0,
        confirmedOrders: 0,
        pendingPayment: 0,
        printQueue: 0,
        delivered: 0,
      },
      sessions: [],
      orders: [],
      source: "fallback" as const,
    };
  }
}

const pipeline = [
  { label: "Upload received", key: "uploaded" },
  { label: "Template selected", key: "template_selected" },
  { label: "AI preview ready", key: "preview_ready" },
  { label: "Checkout pending", key: "checkout" },
  { label: "Confirmed order", key: "orders" },
  { label: "Print queue", key: "print" },
  { label: "Delivered", key: "delivered" },
];

export default async function AdminDashboardPage() {
  const { metrics, sessions, orders, source } = await getDashboardData();
  const pipelineCounts = {
    uploaded: sessions.filter((item) => item.status === "uploaded").length,
    template_selected: sessions.filter((item) => item.status === "template_selected").length,
    preview_ready: metrics.previewReady,
    checkout: sessions.filter((item) => item.status === "preview_ready").length,
    orders: metrics.confirmedOrders,
    print: metrics.printQueue,
    delivered: metrics.delivered,
  };

  return (
    <section className="grid gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Admin Dashboard</Badge>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[var(--foreground)] sm:text-5xl">
            AI photo operations
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
            AI preview, confirmed order, payment, print fulfillment — all in one place.
          </p>
        </div>
        <AdminStatusBadge status={source === "supabase" ? "preview_ready" : "draft"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <AdminMetricCard label="Active sessions" value={metrics.activeSessions} helper="Pre-order AI preview work" icon={<Sparkles size={20} />} />
        <AdminMetricCard label="Preview ready" value={metrics.previewReady} helper="Ready for checkout" icon={<CheckCircle2 size={20} />} />
        <AdminMetricCard label="Confirmed orders" value={metrics.confirmedOrders} helper="Checkout confirmed" icon={<CreditCard size={20} />} />
        <AdminMetricCard label="Pending payment" value={metrics.pendingPayment} helper="Manual payment pending" icon={<Clock3 size={20} />} />
        <AdminMetricCard label="Print queue" value={metrics.printQueue} helper="A4/A3 fulfillment" icon={<PackageCheck size={20} />} />
        <AdminMetricCard label="Delivered" value={metrics.delivered} helper="Delivery complete" icon={<UploadCloud size={20} />} />
      </div>

      <Card className="rounded-[24px]">
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5">
          <div>
            <CardTitle>Operations pipeline</CardTitle>
            <p className="mt-1 text-sm font-bold text-[var(--muted)]">
              Shows generation sessions and confirmed orders separately.
            </p>
          </div>
          <ButtonLink href="/admin/sessions" variant="ghost">View sessions</ButtonLink>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 pt-0 md:grid-cols-7">
          {pipeline.map((item) => (
            <div key={item.key} className="rounded-[20px] border border-[var(--line)] bg-[var(--muted-surface)] p-4">
              <p className="text-xs font-extrabold uppercase leading-5 text-[var(--muted)]">{item.label}</p>
              <p className="mt-3 text-2xl font-extrabold tabular-nums text-[var(--foreground)]">
                {pipelineCounts[item.key as keyof typeof pipelineCounts]}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-[24px]">
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 border-b border-[var(--line)] p-5">
            <div>
              <CardTitle>Recent sessions</CardTitle>
              <p className="mt-1 text-sm text-[var(--muted)]">Preview work before confirmed order.</p>
            </div>
            <Link href="/admin/sessions" className="text-sm font-extrabold text-[var(--primary-dark)]">View all</Link>
          </CardHeader>
          <div className="grid divide-y divide-[var(--line)]">
            {sessions.length === 0 ? (
              <p className="p-5 text-sm font-bold text-[var(--muted)]">No real sessions yet.</p>
            ) : (
              sessions.map((session) => (
                <Link
                  key={session.id}
                  href="/admin/sessions"
                  className="grid gap-3 p-5 text-sm transition hover:bg-[var(--muted-surface)] md:grid-cols-[100px_1fr_150px_24px] md:items-center"
                >
                  <strong>{shortId(session.id)}</strong>
                  <span>
                    <span className="block font-extrabold">
                      {session.ai_templates?.title_en ?? "No template"}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">{formatDateTime(session.created_at)}</span>
                  </span>
                  <AdminStatusBadge status={session.status} />
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="rounded-[24px]">
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 border-b border-[var(--line)] p-5">
            <div>
              <CardTitle>Recent confirmed orders</CardTitle>
              <p className="mt-1 text-sm text-[var(--muted)]">Fulfillment after checkout.</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-extrabold text-[var(--primary-dark)]">View all</Link>
          </CardHeader>
          <div className="grid divide-y divide-[var(--line)]">
            {orders.length > 0 ? (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="grid gap-3 p-5 text-sm transition hover:bg-[var(--muted-surface)] md:grid-cols-[100px_1fr_120px_24px] md:items-center"
                >
                  <strong>{shortId(order.id)}</strong>
                  <span>
                    <span className="block font-extrabold">{order.customer_name ?? "No name"}</span>
                    <span className="block text-xs text-[var(--muted)]">
                      {getProductChoiceDisplayTitle(order.order_items?.[0]?.item_type, order.order_items?.[0]?.title)} · {formatMnt(order.total_price)}
                    </span>
                  </span>
                  <AdminStatusBadge status={order.payment_status} />
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              ))
            ) : (
              <p className="p-5 text-sm font-bold text-[var(--muted)]">
                No confirmed orders yet. Checkout-confirmed orders will appear here.
              </p>
            )}
          </div>
        </Card>
      </div>

      <section className="grid gap-3 md:grid-cols-5">
        {[
          ["/admin/sessions", "View sessions"],
          ["/admin/review", "View review queue"],
          ["/admin/orders", "View orders"],
          ["/admin/print-queue", "View print queue"],
          ["/admin/templates", "Manage templates"],
        ].map(([href, label]) => (
          <ButtonLink key={href} href={href} variant="ghost" className="justify-between">
            {label}
            <ArrowUpRight size={16} aria-hidden="true" />
          </ButtonLink>
        ))}
      </section>
    </section>
  );
}
