import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminDataTable({
  columns,
  children,
  empty,
  minWidth = "860px",
}: {
  columns: string[];
  children: ReactNode;
  empty?: ReactNode;
  minWidth?: string;
}) {
  return (
    <Card className="overflow-hidden rounded-[24px]">
      <Table className="border-collapse text-sm" style={{ minWidth }}>
          <TableHeader className="bg-[var(--muted-surface)]">
            <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column} className="px-4 py-3">
                {column}
              </TableHead>
            ))}
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
      </Table>
      {empty ? <div className="border-t border-[var(--line)] p-6">{empty}</div> : null}
    </Card>
  );
}

export { TableCell, TableRow };
