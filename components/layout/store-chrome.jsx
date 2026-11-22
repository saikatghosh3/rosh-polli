import { StorefrontProvider } from "@/components/store/storefront-provider";
import StoreHeader from "@/components/layout/store-header";
import StoreFooter from "@/components/layout/store-footer";
import FloatingActions from "@/components/layout/floating-actions";
import GlobalNewsTicker from "@/components/layout/global-news-ticker";
import { OfflineBanner } from "@/components/states";
import { ShoppingActivity } from "@/components/layout/shopping-activity";

export default function StoreChrome({
  settings,
  announcement = "",
  demoMode = true,
  initialCart = [],
  initialWishlistIds = [],
  children,
}) {
  return (
    <StorefrontProvider demoMode={demoMode} initialCart={initialCart} initialWishlistIds={initialWishlistIds}>
      {announcement ? (
        <div className={`announcement-bar${demoMode ? " announcement-bar--demo" : ""}`} role="status">
          <span className="announcement-bar__dot" aria-hidden="true" />
          {announcement}
        </div>
      ) : null}
      <OfflineBanner />
      <StoreHeader brandName={settings.brandName} />
      <GlobalNewsTicker />
      <main>{children}</main>
      <StoreFooter settings={settings} />
      <ShoppingActivity />
      <FloatingActions whatsapp={settings.whatsapp || settings.supportPhone} />
    </StorefrontProvider>
  );
}
