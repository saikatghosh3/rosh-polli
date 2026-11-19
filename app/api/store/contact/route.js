import { NextResponse } from "next/server";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { contactSchema } from "@/lib/validations";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientAddress, jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, message: "ডেমো মোডে বার্তা সংরক্ষিত হয়নি।" }, { status: 200 });
  }
  try {
    const limit = await consumeRateLimit(`contact:${getClientAddress(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) return jsonError("অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।", 429, { retryAfterSeconds: limit.retryAfterSeconds });
  } catch {
    return jsonError("বার্তা পরিষেবা সাময়িকভাবে অনুপলব্ধ।", 503);
  }
  const parsed = await readJson(request, contactSchema);
  if (!parsed.success) return parsed.response;
  try {
    await connectDatabase();
    const ContactMessage = (await import("@/models/ContactMessage")).default;
    await ContactMessage.create({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || "",
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "new",
    });
    return NextResponse.json({ ok: true, message: "আপনার বার্তা সংরক্ষিত হয়েছে। শীঘ্রই যোগাযোগ করা হবে।" }, { status: 201 });
  } catch {
    return jsonError("এই মুহূর্তে বার্তা সংরক্ষণ করা যাচ্ছে না।", 503);
  }
}