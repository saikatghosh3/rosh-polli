import OrderLookup from "@/components/store/order-lookup";
import { isStoreDemoMode } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "অর্ডার ট্র্যাক করুন | রসপল্লী", description: "অর্ডার নম্বর ও ফোন দিয়ে রসপল্লী-র অর্ডারের অবস্থা দেখুন।" };

export default async function OrdersPage() {
  const demoMode = await isStoreDemoMode();
  return (
    <section className="page-shell site-container order-page">
      <div className="page-title-block"><span className="eyebrow">আপনার অর্ডার</span><h1>অর্ডার ট্র্যাক করুন</h1><p>অর্ডার নম্বর ও অর্ডারে ব্যবহৃত ফোন নম্বর দিয়ে সর্বশেষ অবস্থা দেখুন।</p></div>
      <OrderLookup demoMode={demoMode} />
    </section>
  );
}
