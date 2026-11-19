import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-auth-forms";
import { isAdminAuthConfigured, requireAdmin } from "@/lib/auth";
import { isDemoMode } from "@/lib/storefront-data";

export const metadata = { title: "অ্যাডমিন লগইন | রসপল্লী" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  let user = null;
  try {
    user = await requireAdmin();
  } catch {}
  if (user) redirect("/admin/dashboard");

  return (
    <main className="admin-auth-page">
      <Link className="admin-auth-back" href="/"><ArrowLeft aria-hidden="true" />স্টোরফ্রন্টে ফিরুন</Link>
      <section className="admin-auth-card">
        <div className="admin-auth-emblem"><LockKeyhole aria-hidden="true" /></div>
        <span className="eyebrow">নিরাপদ প্রশাসনিক প্রবেশ</span>
        <h1>অ্যাডমিন লগইন</h1>
        <p>আপনার স্টোর পরিচালনার জন্য অনুমোদিত অ্যাকাউন্ট দিয়ে প্রবেশ করুন।</p>
        <AdminLoginForm demoMode={isDemoMode()} authEnabled={isAdminAuthConfigured()} />
      </section>
      <span className="admin-auth-footer">রসপল্লী · অ্যাডমিন স্টুডিও</span>
    </main>
  );
}
