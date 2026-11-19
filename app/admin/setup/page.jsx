import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminSetupForm } from "@/components/admin/admin-auth-forms";
import { isAdminAuthConfigured } from "@/lib/auth";
import { isDatabaseConfigured } from "@/lib/db";

export const metadata = { title: "প্রথম অ্যাডমিন সেটআপ | রসপল্লী" };
export const dynamic = "force-dynamic";

export default function AdminSetupPage() {
  const setupEnabled = isDatabaseConfigured() && isAdminAuthConfigured() && Boolean(process.env.ADMIN_SETUP_TOKEN);
  return (
    <main className="admin-auth-page">
      <Link className="admin-auth-back" href="/admin/login"><ArrowLeft aria-hidden="true" />লগইনে ফিরুন</Link>
      <section className="admin-auth-card">
        <div className="admin-auth-emblem"><ShieldCheck aria-hidden="true" /></div>
        <span className="eyebrow">একবারের নিরাপদ সেটআপ</span>
        <h1>প্রথম অ্যাডমিন তৈরি করুন</h1>
        <p>প্রথম অ্যাডমিন অ্যাকাউন্ট তৈরি করতে সার্ভার-সাইড সেটআপ কোড প্রয়োজন।</p>
        <AdminSetupForm setupEnabled={setupEnabled} />
      </section>
      <span className="admin-auth-footer">রসপল্লী · অ্যাডমিন স্টুডিও</span>
    </main>
  );
}
