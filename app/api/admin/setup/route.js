import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { constantTimeSecretMatch, hashPassword, isAdminAuthConfigured } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientAddress, jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";
import { handleApiError } from "@/lib/api-errors";
import { adminSetupSchema } from "@/lib/validations";

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!isDatabaseConfigured()) return jsonError("অ্যাডমিন অ্যাকাউন্ট তৈরি করতে MongoDB সংযোগ প্রয়োজন।", 503);
  if (!isAdminAuthConfigured()) return jsonError("অ্যাডমিন সেটআপের আগে অন্তত ৩২ অক্ষরের JWT_SECRET সেট করুন।", 503);
  if (!process.env.ADMIN_SETUP_TOKEN) return jsonError("প্রথম অ্যাডমিন সেটআপ বন্ধ আছে। ADMIN_SETUP_TOKEN কনফিগার করার পর সেটআপ করুন।", 503);

  try {
    const limit = await consumeRateLimit(`admin-setup:${getClientAddress(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) return jsonError("অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।", 429, { retryAfterSeconds: limit.retryAfterSeconds });
  } catch {
    return jsonError("সেটআপ যাচাই পরিষেবা সাময়িকভাবে অনুপলব্ধ।", 503);
  }

  const parsed = await readJson(request, adminSetupSchema);
  if (!parsed.success) return parsed.response;
  if (!constantTimeSecretMatch(parsed.data.setupToken, process.env.ADMIN_SETUP_TOKEN)) return jsonError("সেটআপ কোড সঠিক নয়।", 403);

  try {
    await connectDatabase();
    if (await User.exists({ role: "admin" })) return jsonError("অ্যাডমিন অ্যাকাউন্ট আগে থেকেই তৈরি হয়েছে।", 409);
    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({ name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash, role: "admin", isActive: true });
    return NextResponse.json({ message: "প্রথম অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে। এখন লগইন করুন।", user: { id: String(user._id), name: user.name, email: user.email } }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) return jsonError("অ্যাডমিন সেটআপ ইতিমধ্যে সম্পন্ন হয়েছে।", 409);
    return handleApiError(error, "অ্যাডমিন অ্যাকাউন্ট তৈরি করা যায়নি।");
  }
}
