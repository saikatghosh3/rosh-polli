import StoreChrome from "@/components/layout/store-chrome";
import { getAnnouncement, getSiteSettings, isStoreDemoMode } from "@/lib/storefront-data";
import { getCartForSession, getWishlistIdsForSession } from "@/lib/cart-service";
import { getStoreSession } from "@/lib/guest-session";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }) {
  const demoMode = await isStoreDemoMode();

  const [settings, announcement, sessionData] = await Promise.all([
    getSiteSettings(),
    getAnnouncement(),
    demoMode
      ? Promise.resolve(null)
      : (async () => {
          const session = await getStoreSession();
          const [cart, wishlistIds] = await Promise.all([
            getCartForSession(session.id),
            getWishlistIdsForSession(session.id),
          ]);
          return { cart, wishlistIds };
        })(),
  ]);

  return (
    <StoreChrome
      settings={settings}
      announcement={announcement}
      demoMode={demoMode}
      initialCart={sessionData?.cart || []}
      initialWishlistIds={sessionData?.wishlistIds || []}
    >
      {children}
    </StoreChrome>
  );
}
