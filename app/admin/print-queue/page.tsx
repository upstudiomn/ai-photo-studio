import { AdminDataTable, TableCell, TableRow } from "@/components/admin/admin-data-table";
import { AdminStatusUpdateInline } from "@/components/admin/admin-status-update-inline";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, shortId } from "@/lib/utils";
import { listAdminPrintJobs } from "@/server/admin";

async function getPrintJobs() {
  try {
    return await listAdminPrintJobs(100);
  } catch (error) {
    console.error("Failed to load print queue.", error);
    return [];
  }
}

export default async function PrintQueuePage() {
  const printJobs = await getPrintJobs();

  return (
    <section className="grid gap-6">
      <div>
        <Badge>Print queue</Badge>
        <h1 className="mt-2 text-4xl font-extrabold text-[var(--foreground)]">A4/A3 fulfillment</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Print jobs are created only after confirmed order where print product is selected.
        </p>
      </div>

      {printJobs.length > 0 ? (
        <AdminDataTable columns={["Order", "Print size", "Paper", "Status", "Delivery", "Created", "Action"]}>
          {printJobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="font-extrabold">{shortId(job.order_id)}</TableCell>
              <TableCell className="font-bold">{job.print_size ?? "Print"}</TableCell>
              <TableCell>{job.paper_type ?? "premium"}</TableCell>
              <TableCell>
                <AdminStatusUpdateInline
                  type="print"
                  currentStatus={job.status}
                  printJobId={job.id}
                />
              </TableCell>
              <TableCell className="max-w-[260px] truncate text-sm">{job.delivery_address ?? job.orders?.delivery_address ?? "-"}</TableCell>
              <TableCell className="text-xs font-bold text-[var(--muted)]">{formatDateTime(job.created_at)}</TableCell>
              <TableCell>
                <ButtonLink href={`/admin/orders/${job.order_id}`} size="sm">
                  Open
                </ButtonLink>
              </TableCell>
            </TableRow>
          ))}
        </AdminDataTable>
      ) : (
        <Card className="rounded-[24px]">
          <CardContent className="p-10 text-center">
          <p className="text-[var(--muted)]">No print jobs yet.</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
