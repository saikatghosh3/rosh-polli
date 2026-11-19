import { createHash, randomBytes } from "node:crypto";
import mongoose from "mongoose";
import Cart from "@/models/Cart";
import Coupon from "@/models/Coupon";
import Order from "@/models/Order";
import Product from "@/models/Product";
import SiteSettings from "@/models/SiteSettings";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { normalizeBangladeshiPhone } from "@/lib/phone";
import { getSiteSettings } from "@/lib/storefront-data";

const orderStatusLabels = {
  new: "নতুন অর্ডার",
  confirmed: "নিশ্চিত করা হয়েছে",
  processing: "প্রসেসিং",
  shipped: "শিপড",
  delivered: "ডেলিভারড",
  cancelled: "বাতিল",
};

function createOrderNumber() {
  return `RSP-${Date.now().toString(36).toUpperCase()}-${randomBytes(8).toString("hex").toUpperCase()}`;
}

async function resolveCoupon(code, subtotal) {
  if (!code) return { coupon: null, discount: 0 };
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true }).lean();
  const now = new Date();
  if (!coupon || (coupon.startsAt && coupon.startsAt > now) || (coupon.endsAt && coupon.endsAt < now)) {
    throw Object.assign(new Error("কুপন কোডটি বৈধ নয় বা মেয়াদ শেষ হয়েছে।"), { code: "INVALID_COUPON" });
  }
  if (subtotal < coupon.minOrderAmount) {
    throw Object.assign(new Error("এই কুপন ব্যবহারের জন্য অর্ডারের পরিমাণ যথেষ্ট নয়।"), { code: "INVALID_COUPON" });
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw Object.assign(new Error("এই কুপনের ব্যবহারসীমা পূর্ণ হয়েছে।"), { code: "INVALID_COUPON" });
  }
  const rawDiscount = coupon.type === "percent" ? subtotal * coupon.value / 100 : coupon.value;
  const discount = Math.min(subtotal, coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount);
  return { coupon, discount: Math.round(discount) };
}

export async function createOrderFromCart(sessionId, input) {
  await connectDatabase();
  const cart = await Cart.findOne({ sessionId }).populate({ path: "items.product", select: "name slug images sizes isActive" }).lean();
  if (!cart) throw Object.assign(new Error("আপনার কার্টে কোনো পণ্য নেই।"), { code: "EMPTY_CART" });
  const customer = {
    name: input.fullName,
    phone: normalizeBangladeshiPhone(input.phone),
    email: input.email?.toLowerCase() || "",
  };
  const deliveryZone = input.deliveryZone === "outside" ? "outside" : "inside";
  const shippingAddress = { district: input.district, address: input.address, zone: deliveryZone };
  const signature = createHash("sha256").update(JSON.stringify({
    sessionId,
    checkoutToken: cart.checkoutToken,
    customer,
    shippingAddress,
    couponCode: input.couponCode?.trim().toUpperCase() || "",
    notes: input.notes?.trim() || "",
  })).digest("hex");
  const existing = await Order.findOne({ idempotencyKey: signature }).lean();
  if (existing) return existing;
  if (!cart.items?.length) throw Object.assign(new Error("আপনার কার্টে কোনো পণ্য নেই।"), { code: "EMPTY_CART" });

  const items = [];
  let subtotal = 0;
  for (const item of cart.items) {
    const product = item.product;
    const variant = product?.sizes?.find((size) => size.label === item.size);
    if (!product || !product.isActive || !variant) throw Object.assign(new Error("কার্টের একটি পণ্য আর পাওয়া যাচ্ছে না। কার্ট হালনাগাদ করুন।"), { code: "CART_CHANGED" });
    if (item.quantity > variant.stock) throw Object.assign(new Error(`${product.name} পণ্যে পর্যাপ্ত স্টক নেই।`), { code: "OUT_OF_STOCK" });
    const lineTotal = Number(variant.price) * Number(item.quantity);
    subtotal += lineTotal;
    items.push({
      product: product._id,
      slug: product.slug,
      name: product.name,
      image: product.images?.[0] || "/images/collection-misti.svg",
      size: variant.label,
      quantity: item.quantity,
      unitPrice: Number(variant.price),
      lineTotal,
    });
  }

  const { coupon, discount } = await resolveCoupon(input.couponCode, subtotal);
  const settings = await getSiteSettings();
  const freeThreshold = Number(settings.freeDeliveryThreshold || 0);
  const legacyCharge = Number(settings.deliveryCharge || 0);
  const regionCharge = deliveryZone === "outside"
    ? Number(settings.deliveryChargeOutsideDhaka ?? legacyCharge)
    : Number(settings.deliveryChargeDhaka ?? legacyCharge);
  const deliveryCharge = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : regionCharge;
  const total = Math.max(0, subtotal + deliveryCharge - discount);
  const session = await mongoose.startSession();
  let savedOrderId;
  try {
    await session.withTransaction(async () => {
      for (const item of items) {
        const stockUpdate = await Product.updateOne(
          { _id: item.product, sizes: { $elemMatch: { label: item.size, stock: { $gte: item.quantity } } } },
          { $inc: { "sizes.$.stock": -item.quantity } },
          { session },
        );
        if (stockUpdate.modifiedCount !== 1) {
          throw Object.assign(new Error(`${item.name} পণ্যের স্টক শেষ হয়ে গেছে।`), { code: "OUT_OF_STOCK" });
        }
      }
      if (coupon) {
        const couponFilter = { _id: coupon._id, isActive: true };
        if (coupon.usageLimit) couponFilter.usageCount = { $lt: coupon.usageLimit };
        const couponUpdate = await Coupon.updateOne(couponFilter, { $inc: { usageCount: 1 } }, { session });
        if (couponUpdate.modifiedCount !== 1) throw Object.assign(new Error("এই কুপনের ব্যবহারসীমা পূর্ণ হয়েছে।"), { code: "INVALID_COUPON" });
      }
      const [order] = await Order.create([{
        orderNumber: createOrderNumber(),
        idempotencyKey: signature,
        customer,
        shippingAddress,
        items,
        subtotal,
        deliveryCharge,
        discount,
        total,
        couponCode: coupon?.code || "",
        paymentMethod: "cod",
        paymentStatus: "pending",
        notes: input.notes || "",
        status: "new",
        statusHistory: [{ status: "new" }],
      }], { session });
      savedOrderId = order._id;
      await Cart.updateOne({ sessionId }, { $set: { items: [], expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }, { session });
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicate = await Order.findOne({ idempotencyKey: signature }).lean();
      if (duplicate) return duplicate;
    }
    if (error.code === 20 || /transaction numbers are only allowed/i.test(error.message || "")) {
      throw Object.assign(new Error("নিরাপদ অর্ডার সংরক্ষণের জন্য MongoDB transaction support প্রয়োজন। MongoDB Atlas বা replica set ব্যবহার করুন।"), { code: "ORDER_TRANSACTION_FAILED" });
    }
    throw error;
  } finally {
    await session.endSession();
  }

  const order = await Order.findById(savedOrderId).lean();
  return { ...order, statusLabel: orderStatusLabels[order.status] || order.status };
}

export function serializeTrackedOrder(order) {
  const date = new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium" }).format(order.createdAt);
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: orderStatusLabels[order.status] || "অবস্থা জানা যায়নি",
    total: order.total,
    createdAtLabel: date,
    statusHistory: (order.statusHistory || []).map((entry) => ({
      status: entry.status,
      statusLabel: orderStatusLabels[entry.status] || "অবস্থা জানা যায়নি",
      changedAtLabel: new Intl.DateTimeFormat("bn-BD", { dateStyle: "medium", timeStyle: "short" }).format(entry.changedAt),
    })),
  };
}

export async function getOrderReceipt(orderNumber) {
  const safeOrderNumber = String(orderNumber || "").trim().toUpperCase();
  if (!isDatabaseConfigured() || !/^RSP-[A-Z0-9]+-[A-F0-9]{16}$/.test(safeOrderNumber)) return null;
  try {
    await connectDatabase();
    return await Order.findOne({ orderNumber: safeOrderNumber }).select("orderNumber status total createdAt").lean();
  } catch {
    return null;
  }
}
