import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_SECONDS, createAdminToken, isAdminAuthConfigured, verifyPassword } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientAddress, jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";
import { adminLoginSchema } from "@/lib/validations";

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!isDatabaseConfigured()) return jsonError("অ্যাডমিন লগইন চালু করতে MongoDB সংযোগ প্রয়োজন।", 503);
  if (!isAdminAuthConfigured()) return jsonError("অ্যাডমিন লগইনের জন্য অন্তত ৩২ অক্ষরের JWT_SECRET সেট করতে হবে।", 503);

  try {
    const limit = await consumeRateLimit(`admin-login:${getClientAddress(request)}`, { limit: 8, windowMs: 15 * 60 * 1000 });
    if (!limit.allowed) return jsonError("অনেকবার লগইনের চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।", 429, { retryAfterSeconds: limit.retryAfterSeconds });
  } catch {
    return jsonError("লগইন যাচাই পরিষেবা সাময়িকভাবে অনুপলব্ধ।", 503);
  }

  const parsed = await readJson(request, adminLoginSchema);
  if (!parsed.success) return parsed.response;

  try {
    await connectDatabase();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase(), role: "admin", isActive: true }).select("+passwordHash");
    const validPassword = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
    if (!user || !validPassword) return jsonError("ইমেইল বা পাসওয়ার্ড সঠিক নয়।", 401);

    user.lastLoginAt = new Date();
    await user.save();
    const token = createAdminToken(user);
    const response = NextResponse.json({ user: { id: String(user._id), name: user.name, email: user.email } });
    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_SECONDS,
    });
    return response;
  } catch (error) {
    const unavailable = error.code === "DATABASE_UNAVAILABLE" || error.code === "DATABASE_NOT_CONFIGURED";
    return jsonError(unavailable ? "ডেটাবেসে সংযোগ পাওয়া যাচ্ছে না।" : "লগইন সম্পন্ন করা যায়নি।", unavailable ? 503 : 500);
  }
}
