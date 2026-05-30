import { AdminDataTable, TableCell, TableRow } from "@/components/admin/admin-data-table";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatDateTime, shortId } from "@/lib/utils";
import { listAdminGenerationSessions } from "@/server/admin";

async function getSessions() {
  try {
    return await listAdminGenerationSessions(100);
  } catch (error) {
    console.error("Failed to load admin sessions.", error);
    return [];
  }
}

export default async function AdminSessionsPage() {
  const sessions = await getSessions();

  return (
    <section className="grid gap-6">
      <div>
        <Badge>Generation sessions</Badge>
        <h1 className="mt-2 text-4xl font-extrabold text-[var(--foreground)]">AI sessions</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Pre-order AI preview work. Not a confirmed order.
        </p>
      </div>

      <AdminDataTable
        columns={["Session", "Status", "Template", "Uploaded", "Outputs", "Created", "Action"]}
        empty={sessions.length === 0 ? <p className="text-sm font-bold text-[var(--muted)]">No real sessions yet.</p> : null}
      >
        {sessions.map((session) => (
          <TableRow key={session.id}>
            <TableCell className="font-extrabold">{shortId(session.id)}</TableCell>
            <TableCell><AdminStatusBadge status={session.status} /></TableCell>
            <TableCell>
              <div className="font-bold">
                {session.ai_templates?.title_en ?? "No template"}
              </div>
              <div className="text-xs text-[var(--muted)]">{session.ai_templates?.category ?? "-"}</div>
            </TableCell>
            <TableCell className="font-extrabold tabular-nums">{session.uploaded_images?.length ?? 0}</TableCell>
            <TableCell className="font-extrabold tabular-nums">{session.generated_outputs?.length ?? 0}</TableCell>
            <TableCell className="text-xs font-bold text-[var(--muted)]">{formatDateTime(session.created_at)}</TableCell>
            <TableCell>
              <ButtonLink href={`/results/${session.id}`} variant="outline" size="sm">
                Results
              </ButtonLink>
            </TableCell>
          </TableRow>
        ))}
      </AdminDataTable>
    </section>
  );
}
