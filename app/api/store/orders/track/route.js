import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { consumeRateLimit } from "@/lib/rate-limit";
import { serializeTrackedOrder } from "@/lib/commerce";
import { normalizeBangladeshiPhone } from "@/lib/phone";
import { getClientAddress, jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";
import { orderLookupSchema } from "@/lib/validations";

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const address = getClientAddress(request);
  if (isDatabaseConfigured()) {
    try {
      const limit = await consumeRateLimit(`order-track:${address}`, { limit: 12, windowMs: 60 * 60 * 1000 });
      if (!limit.allowed) return jsonError("অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।", 429, { retryAfterSeconds: limit.retryAfterSeconds });
    } catch {
      return jsonError("অর্ডার যাচাই পরিষেবা সাময়িকভাবে অনুপলব্ধ।", 503);
    }
  }
  const parsed = await readJson(request, orderLookupSchema);
  if (!parsed.success) return parsed.response;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে কোনো অর্ডার সংরক্ষিত নেই।", 503);
  try {
    await connectDatabase();
    const order = await Order.findOne({
      orderNumber: parsed.data.orderNumber.toUpperCase(),
      "customer.phone": normalizeBangladeshiPhone(parsed.data.phone),
    }).select("orderNumber status total createdAt statusHistory").lean();
    if (!order) return jsonError("এই অর্ডার নম্বর ও ফোনের সঙ্গে কোনো অর্ডার মেলেনি।", 404);
    return NextResponse.json({ order: serializeTrackedOrder(order) });
  } catch {
    return jsonError("অর্ডারের তথ্য এখন পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।", 503);
  }
}
