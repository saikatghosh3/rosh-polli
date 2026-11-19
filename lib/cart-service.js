import Cart from "@/models/Cart";
import Wishlist from "@/models/Wishlist";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";

function serializeCartItem(item) {
  const product = item.product;
  if (!product || !product.isActive) return null;
  const size = product.sizes?.find((candidate) => candidate.label === item.size);
  if (!size) return null;
  return {
    productId: String(product._id),
    slug: product.slug,
    name: product.name,
    image: product.images?.[0] || "/images/collection-misti.svg",
    size: size.label,
    price: Number(size.price),
    quantity: Number(item.quantity),
    availableStock: Number(size.stock),
  };
}

export async function getCartForSession(sessionId) {
  if (!isDatabaseConfigured() || !sessionId) return [];
  try {
    await connectDatabase();
    const cart = await Cart.findOne({ sessionId }).populate({
      path: "items.product",
      select: "name slug images sizes isActive",
    }).lean();
    return (cart?.items || []).map(serializeCartItem).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getWishlistIdsForSession(sessionId) {
  if (!isDatabaseConfigured() || !sessionId) return [];
  try {
    await connectDatabase();
    const wishlist = await Wishlist.findOne({ sessionId }).select("products").lean();
    return (wishlist?.products || []).map((id) => String(id));
  } catch {
    return [];
  }
}

export function getCartTotals(items, settings, zone = "inside") {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const legacy = Number(settings.deliveryCharge || 0);
  const regionCharge = zone === "outside"
    ? Number(settings.deliveryChargeOutsideDhaka ?? legacy)
    : Number(settings.deliveryChargeDhaka ?? legacy);
  const deliveryCharge = subtotal >= Number(settings.freeDeliveryThreshold || 0) && Number(settings.freeDeliveryThreshold || 0) > 0
    ? 0
    : regionCharge;
  return { subtotal, deliveryCharge, total: subtotal + deliveryCharge };
}
