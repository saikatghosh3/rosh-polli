import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Review from "@/models/Review";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { reviewSchema } from "@/lib/validations";
import { consumeRateLimit } from "@/lib/rate-limit";
import { normalizeBangladeshiPhone } from "@/lib/phone";
import { getClientAddress, jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে রিভিউ সংরক্ষণ হচ্ছে না।", 503);
  try {
    const limit = await consumeRateLimit(`review:${getClientAddress(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) return jsonError("অনেকবার চেষ্টা হয়েছে। পরে আবার রিভিউ দিন।", 429, { retryAfterSeconds: limit.retryAfterSeconds });
  } catch {
    return jsonError("রিভিউ পরিষেবা সাময়িকভাবে অনুপলব্ধ।", 503);
  }
  const parsed = await readJson(request, reviewSchema);
  if (!parsed.success) return parsed.response;
  try {
    await connectDatabase();
    const product = await Product.findOne({ _id: parsed.data.productId, isActive: true }).select("_id").lean();
    if (!product) return jsonError("পণ্যটি পাওয়া যায়নি।", 404);
    const phone = normalizeBangladeshiPhone(parsed.data.phone);
    const order = await Order.findOne({
      orderNumber: parsed.data.orderNumber,
      "customer.phone": phone,
      status: "delivered",
      "items.product": product._id,
    }).select("_id customer").lean();
    if (!order) return jsonError("এই পণ্যের জন্য সম্পন্ন অর্ডার যাচাই করা যায়নি।", 403);
    if (await Review.exists({ order: order._id, product: product._id })) return jsonError("এই অর্ডার থেকে ইতিমধ্যে রিভিউ পাঠানো হয়েছে।", 409);
    await Review.create({
      product: product._id,
      order: order._id,
      name: order.customer.name,
      email: order.customer.email || "",
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      status: "pending",
    });
    return NextResponse.json({ message: "রিভিউটি যাচাইয়ের জন্য পাঠানো হয়েছে।" }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) return jsonError("এই অর্ডার থেকে ইতিমধ্যে রিভিউ পাঠানো হয়েছে।", 409);
    return jsonError("এই মুহূর্তে রিভিউ পাঠানো যাচ্ছে না।", 503);
  }
}
