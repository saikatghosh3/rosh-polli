import StoreChrome from "@/components/layout/store-chrome";
import NotFoundView from "@/components/states/not-found-view";
import { getAnnouncement, getHomePageData, getSiteSettings, isDemoMode } from "@/lib/storefront-data";

export default async function NotFound() {
  const [data, settings, announcement] = await Promise.all([
    getHomePageData(),
    getSiteSettings(),
    getAnnouncement(),
  ]);
  const products = data.bestSellers?.length ? data.bestSellers : data.featuredProducts || [];

  return (
    <StoreChrome settings={settings} announcement={announcement} demoMode={isDemoMode()}>
      <NotFoundView framed categories={data.categories || []} products={products} />
    </StoreChrome>
  );
}
