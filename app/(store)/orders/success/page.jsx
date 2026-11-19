import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderSuccessState } from "@/components/states";
import { formatPrice } from "@/lib/format";
import { getOrderReceipt } from "@/lib/commerce";

const statusLabels = { new: "নতুন অর্ডার", confirmed: "নিশ্চিত করা হয়েছে", processing: "প্রসেসিং", shipped: "পাঠানো হয়েছে", delivered: "ডেলিভারি সম্পন্ন", cancelled: "বাতিল" };

export const metadata = { title: "অর্ডার নিশ্চিতকরণ | রসপল্লী", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({ searchParams }) {
  const params = await searchParams;
  const orderNumber = typeof params?.order === "string" ? params.order : "";
  const order = await getOrderReceipt(orderNumber);
  if (!order) notFound();

  return (
    <section className="page-shell site-container success-page">
      <OrderSuccessState orderNumber={order.orderNumber} total={formatPrice(order.total)} />
      <p>অর্ডারের অবস্থা: <strong>{statusLabels[order.status] || "প্রক্রিয়াধীন"}</strong></p>
    </section>
  );
}
