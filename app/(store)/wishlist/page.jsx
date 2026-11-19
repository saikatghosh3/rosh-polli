import WishlistPage from "@/components/store/wishlist-page";
import { getProducts } from "@/lib/storefront-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "ইচ্ছেতালিকা | রসপল্লী", description: "আপনার পছন্দের পণ্যগুলো এক জায়গায় রাখুন।" };

export default async function WishlistRoute() {
  const products = await getProducts();
  return <WishlistPage products={products} />;
}
