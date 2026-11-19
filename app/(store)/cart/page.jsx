import CartPage from "@/components/store/cart-page";
import { getSiteSettings, isStoreDemoMode } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "আপনার কার্ট | রসপল্লী", description: "আপনার নির্বাচিত পণ্যের অর্ডার দেখুন।" };

export default async function CartRoute() {
  const [settings, demoMode] = await Promise.all([getSiteSettings(), isStoreDemoMode()]);
  return <CartPage deliveryDhaka={settings.deliveryChargeDhaka ?? settings.deliveryCharge ?? 80} deliveryOutside={settings.deliveryChargeOutsideDhaka ?? settings.deliveryCharge ?? 80} freeDeliveryThreshold={settings.freeDeliveryThreshold} demoMode={demoMode} />;
}
