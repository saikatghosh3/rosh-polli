import { NextResponse } from "next/server";
import Newsletter from "@/models/Newsletter";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { newsletterSchema } from "@/lib/validations";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientAddress, jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে সাবস্ক্রিপশন সংরক্ষণ হচ্ছে না।", 503);
  try {
    const limit = await consumeRateLimit(`newsletter:${getClientAddress(request)}`, { limit: 4, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) return jsonError("অনেকবার চেষ্টা হয়েছে। পরে আবার সাবস্ক্রাইব করুন।", 429, { retryAfterSeconds: limit.retryAfterSeconds });
  } catch {
    return jsonError("সাবস্ক্রিপশন পরিষেবা সাময়িকভাবে অনুপলব্ধ।", 503);
  }
  const parsed = await readJson(request, newsletterSchema);
  if (!parsed.success) return parsed.response;
  try {
    await connectDatabase();
    await Newsletter.findOneAndUpdate(
      { email: parsed.data.email.toLowerCase() },
      { $set: { isSubscribed: true, unsubscribedAt: null }, $setOnInsert: { email: parsed.data.email.toLowerCase(), consentAt: new Date(), source: "storefront" } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return NextResponse.json({ message: "রসপল্লী-র পণ্যের গল্পে আপনাকে স্বাগতম।" }, { status: 201 });
  } catch {
    return jsonError("এই মুহূর্তে সাবস্ক্রিপশন সম্পন্ন করা যাচ্ছে না।", 503);
  }
}
