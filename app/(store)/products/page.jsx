import { Suspense } from "react";
import ProductCard from "@/components/products/product-card";
import CatalogFilters from "@/components/products/catalog-filters";
import Pagination from "@/components/products/pagination";
import { EmptyProducts, NoResultsState, SectionLoading } from "@/components/states";
import { getHomePageData, getProductsPage } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "সকল পণ্য | রসপল্লী",
  description: "রসপল্লী-র নির্বাচিত কেজুর গুর, রস ও মিষ্টি থেকে আপনার পছন্দেরটি খুঁজে নিন।",
};

export default function ProductsPage({ searchParams }) {
  return (
    <section className="page-shell site-container">
      <Suspense fallback={<SectionLoading />}>
        <ProductsCatalog searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function ProductsCatalog({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q : "";
  const category = typeof params?.category === "string" ? params.category : "";
  const sort = typeof params?.sort === "string" ? params.sort : "featured";
  const page = typeof params?.page === "string" ? params.page : "";
  const [catalog, homeData] = await Promise.all([getProductsPage({ query, category, sort, page }), getHomePageData()]);
  const { items: products, total, page: currentPage, totalPages } = catalog;

  return (
    <>
      <div className="page-title-block page-title-block--split">
        <div><span className="eyebrow">রসপল্লী-র নির্বাচিত সংগ্রহ</span><h1>{query ? `“${query}” খুঁজে পাওয়া পণ্য` : "আপনার পছন্দের মিষ্টি"}</h1><p>প্রতিটি পণ্যের নিজস্ব গল্প আছে। মৌসুম ও স্বাদ অনুযায়ী বেছে নিন।</p></div>
        <span className="product-count">{total}টি পণ্য{totalPages > 1 ? ` · পৃষ্ঠা ${currentPage}/${totalPages}` : ""}</span>
      </div>
      <CatalogFilters key={`${category}-${sort}-${query}`} categories={homeData.categories} query={query} category={category} sort={sort} />
      {products.length ? (
        <>
          <div className="product-grid">{products.map((product, index) => <ProductCard product={product} index={index} key={product.id || product._id} />)}</div>
          <Pagination page={currentPage} totalPages={totalPages} query={query} category={category} sort={sort} />
        </>
      ) : query ? (
        <NoResultsState query={query} suggestions={homeData.categories.map((item) => item.name)} />
      ) : (
        <EmptyProducts category={category} />
      )}
    </>
  );
}
