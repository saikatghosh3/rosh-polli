import Link from "next/link";
import CollectionGrid from "@/components/home/collection-grid";
import { getHomePageData } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "সকল সংগ্রহ | রসপল্লী", description: "রসপল্লী-র কেজুর গুর, রস ও মিষ্টির সব সংগ্রহ থেকে আপনার পছন্দেরটি খুঁজুন।" };

export default async function CollectionsPage() {
  const { categories } = await getHomePageData();
  return (
    <section className="page-shell site-container">
      <div className="page-title-block"><span className="eyebrow">রসপল্লী-র নির্বাচিত বিভাগ</span><h1>সকল সংগ্রহ</h1><p>মৌসুম ও স্বাদের ভাষায় সাজানো প্রতিটি সংগ্রহে আছে আলাদা পরিচয়।</p></div>
      {categories.length ? <div className="collections-page-grid"><CollectionGrid categories={categories} /></div> : <div className="quiet-empty collections-empty">নতুন সংগ্রহ শিগগিরই যুক্ত হবে। <Link href="/products">সকল পণ্য দেখুন</Link></div>}
    </section>
  );
}
