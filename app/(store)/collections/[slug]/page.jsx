import { notFound } from "next/navigation";
import ProductCard from "@/components/products/product-card";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return category ? { title: `${category.name} | রসপল্লী`, description: category.description } : { title: "সংগ্রহ পাওয়া যায়নি | রসপল্লী" };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const [category, products] = await Promise.all([getCategoryBySlug(slug), getProductsByCategory(slug)]);
  if (!category) notFound();

  return (
    <section className="page-shell site-container">
      <div className="page-title-block"><span className="eyebrow">{category.eyebrow || "রসপল্লী-র সংগ্রহ"}</span><h1>{category.name}</h1><p>{category.description}</p></div>
      {products.length ? <div className="product-grid">{products.map((product, index) => <ProductCard product={product} index={index} key={product.id || product._id} />)}</div> : <div className="quiet-empty">এই সংগ্রহে এখন কোনো পণ্য নেই।</div>}
    </section>
  );
}
