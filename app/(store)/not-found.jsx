import NotFoundView from "@/components/states/not-found-view";
import { getHomePageData } from "@/lib/storefront-data";

export default async function StoreNotFound() {
  const data = await getHomePageData();
  const products = data.bestSellers?.length ? data.bestSellers : data.featuredProducts || [];

  return <NotFoundView framed categories={data.categories || []} products={products} />;
}
