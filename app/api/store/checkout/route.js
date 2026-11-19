import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/db";
import { createOrderFromCart } from "@/lib/commerce";
import { getStoreSession } from "@/lib/guest-session";
import { consumeRateLimit } from "@/lib/rate-limit";
import { checkoutSchema } from "@/lib/validations";
import { getClientAddress, jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে অর্ডার সংরক্ষণ হচ্ছে না। MongoDB সংযোগের পর চেকআউট চালু হবে।", 503);

  try {
    const limit = await consumeRateLimit(`checkout:${getClientAddress(request)}`, { limit: 6, windowMs: 15 * 60 * 1000 });
    if (!limit.allowed) return jsonError("অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পর আবার অর্ডার দিন।", 429, { retryAfterSeconds: limit.retryAfterSeconds });
  } catch {
    return jsonError("চেকআউট পরিষেবা সাময়িকভাবে অনুপলব্ধ।", 503);
  }

  const parsed = await readJson(request, checkoutSchema);
  if (!parsed.success) return parsed.response;

  try {
    const session = await getStoreSession();
    const order = await createOrderFromCart(session.id, parsed.data);
    return NextResponse.json({ order: { orderNumber: order.orderNumber, status: order.status, total: order.total } }, { status: 201 });
  } catch (error) {
    const status = error.code === "EMPTY_CART" ? 409
      : error.code === "OUT_OF_STOCK" || error.code === "CART_CHANGED" ? 409
      : error.code === "INVALID_COUPON" ? 422
      : error.code === "DATABASE_NOT_CONFIGURED" || error.code === "DATABASE_UNAVAILABLE" || error.code === "ORDER_TRANSACTION_FAILED" ? 503
      : 500;
    const message = status === 500 ? "অর্ডার সম্পন্ন করা যায়নি। পরে আবার চেষ্টা করুন।" : error.message;
    return jsonError(message, status);
  }
}
