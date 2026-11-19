import Link from "next/link";
import { notFound } from "next/navigation";
import ProductEditor from "@/components/admin/product-editor";
import { getAdminRecord, getAdminResource } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminRecord("products", id),
    getAdminResource("categories", { page: 1, pageSize: 100 }),
  ]);
  if (!product) notFound();
  return <section className="admin-section"><div className="admin-page-heading"><div><span className="eyebrow">ক্যাটালগ</span><h1>পণ্য সম্পাদনা</h1><p>{product.name}</p></div><Link className="admin-text-link" href="/admin/products">পণ্যের তালিকায় ফিরুন</Link></div><ProductEditor product={product} categories={categories.items || []} /></section>;
}
