import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }) {
  let user = null;
  try {
    user = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
  if (!user) redirect("/admin/login");
  return <AdminShell user={{ name: user.name, email: user.email }}>{children}</AdminShell>;
}
