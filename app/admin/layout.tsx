import { AdminShell } from "@/components/admin/admin-shell";
import { AdminForbidden } from "@/components/admin/admin-forbidden";
import { getAdminAuth } from "@/server/admin-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminAuth();

  if (!admin.ok && admin.reason === "unauthenticated") {
    redirect("/auth/login");
  }

  if (!admin.ok) {
    return <AdminForbidden />;
  }

  return <AdminShell>{children}</AdminShell>;
}
