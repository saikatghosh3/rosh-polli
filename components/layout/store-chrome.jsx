import { StorefrontProvider } from "@/components/store/storefront-provider";
import StoreHeader from "@/components/layout/store-header";
import StoreFooter from "@/components/layout/store-footer";
import FloatingActions from "@/components/layout/floating-actions";
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
      <div className="season-ticker" role="region" aria-label="মৌসুমি পণ্যের খবর">
        <span className="season-ticker__label"><span className="season-ticker__dot" />শীতের আয়োজন</span>
        <div className="season-ticker__window" aria-hidden="true">
          <div className="season-ticker__track">
            {[0, 1].map((copy) => <div className="season-ticker__group" key={copy}>
              <span>শীতের সকালে খাঁটি খেজুরের গুড়</span><i>✦</i><span>টাটকা খেজুরের রস ও নলেন গুড়</span><i>✦</i><span>নরম পাটালি—পিঠা ও পায়েসের সঙ্গী</span><i>✦</i><span>ক্যাশ অন ডেলিভারি সুবিধা</span><i>✦</i><span>সারা বাংলাদেশে যত্নসহকারে ডেলিভারি</span><i>✦</i>
            </div>)}
          </div>
        </div>
      </div>
      <main>{children}</main>
      <StoreFooter settings={settings} />
      <ShoppingActivity />
      <FloatingActions whatsapp={settings.whatsapp || settings.supportPhone} />
    </StorefrontProvider>
  );
}
