import Link from "next/link";
import ProductEditor from "@/components/admin/product-editor";
import { getAdminResource } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function CreateProductPage() {
  const categories = await getAdminResource("categories", { page: 1, pageSize: 100 });
  return <section className="admin-section"><div className="admin-page-heading"><div><span className="eyebrow">ক্যাটালগ</span><h1>নতুন পণ্য যোগ করুন</h1><p>পণ্যের বিবরণ, সাইজ, মূল্য ও স্টক নির্ধারণ করুন।</p></div><Link className="admin-text-link" href="/admin/products">পণ্যের তালিকায় ফিরুন</Link></div><ProductEditor categories={categories.items || []} /></section>;
}
