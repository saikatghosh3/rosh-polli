import Link from "next/link";
import CheckoutForm from "@/components/store/checkout-form";
import { getSiteSettings, isStoreDemoMode } from "@/lib/storefront-data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "চেকআউট | রসপল্লী", description: "রসপল্লী-র পণ্য অর্ডারের জন্য আপনার ডেলিভারি তথ্য দিন।" };

export default async function CheckoutPage() {
  const [settings, demoMode] = await Promise.all([getSiteSettings(), isStoreDemoMode()]);
  return (
    <section className="page-shell site-container checkout-page">
      <div className="page-title-block"><span className="eyebrow">শেষ ধাপ</span><h1>অর্ডার সম্পন্ন করুন</h1><p>আপনার তথ্য দিন, বাকি অভিজ্ঞতাটি রসপল্লী-র।</p></div>
      <div className="checkout-layout">
        <CheckoutForm
          demoMode={demoMode}
          deliveryDhaka={settings.deliveryChargeDhaka ?? settings.deliveryCharge ?? 0}
          deliveryOutside={settings.deliveryChargeOutsideDhaka ?? settings.deliveryCharge ?? 0}
          freeDeliveryThreshold={settings.freeDeliveryThreshold || 0}
        />
        <aside className="checkout-aside"><span className="eyebrow">আপনার কার্ট</span><h2>অর্ডার সারাংশ</h2><p>কার্টের আইটেম ও পরিমাণ পরিবর্তন করতে <Link href="/cart">কার্টে ফিরে যান</Link>।</p><div className="checkout-aside__delivery"><span>ডেলিভারি — ঢাকার ভিতরে</span><strong>{formatPrice(settings.deliveryChargeDhaka ?? settings.deliveryCharge ?? 0)}</strong></div><div className="checkout-aside__delivery"><span>ডেলিভারি — ঢাকার বাইরে</span><strong>{formatPrice(settings.deliveryChargeOutsideDhaka ?? settings.deliveryCharge ?? 0)}</strong></div><small>ডেলিভারি চার্জ আপনার নির্বাচিত এলাকা অনুযায়ী চেকআউটে নির্ধারিত হবে।</small></aside>
      </div>
    </section>
  );
}
