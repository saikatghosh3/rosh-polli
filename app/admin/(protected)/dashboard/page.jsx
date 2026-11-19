import AdminDashboard from "@/components/admin/admin-dashboard";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  try {
    const data = await getAdminDashboardData();
    return <AdminDashboard data={{ ...data, adminName: admin.name }} />;
  } catch {
    return <section className="admin-data-notice" role="alert"><span className="eyebrow">ডেটা লোড হয়নি</span><h1>ড্যাশবোর্ড এখন পাওয়া যাচ্ছে না</h1><p>ডেটাবেস সংযোগ যাচাই করে আবার চেষ্টা করুন। কোনো নমুনা অর্ডার বা বিক্রির তথ্য দেখানো হচ্ছে না।</p></section>;
  }
}
