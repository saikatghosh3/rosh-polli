import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { z } from "zod";
import Product from "@/models/Product";
import Wishlist from "@/models/Wishlist";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { getStoreSession, setStoreSessionCookie, STORE_SESSION_MAX_AGE } from "@/lib/guest-session";
import { jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";

const productSchema = z.object({ productId: z.string().refine(mongoose.isValidObjectId) });

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ productIds: [], demoMode: true });
  try {
    await connectDatabase();
    const session = await getStoreSession();
    const wishlist = await Wishlist.findOne({ sessionId: session.id }).select("products").lean();
    const response = NextResponse.json({ productIds: (wishlist?.products || []).map(String) });
    if (session.isNew) setStoreSessionCookie(response, session.id);
    return response;
  } catch {
    return jsonError("ইচ্ছেতালিকা লোড করা যায়নি।", 503);
  }
}

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const parsed = await readJson(request, productSchema);
  if (!parsed.success) return parsed.response;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে ইচ্ছেতালিকা শুধু এই সেশনে থাকে।", 503);
  try {
    await connectDatabase();
    const session = await getStoreSession();
    const product = await Product.exists({ _id: parsed.data.productId, isActive: true });
    if (!product) return jsonError("পণ্যটি পাওয়া যায়নি।", 404);
    const expiresAt = new Date(Date.now() + STORE_SESSION_MAX_AGE * 1000);
    await Wishlist.findOneAndUpdate(
      { sessionId: session.id },
      { $addToSet: { products: parsed.data.productId }, $set: { expiresAt }, $setOnInsert: { sessionId: session.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    const wishlist = await Wishlist.findOne({ sessionId: session.id }).select("products").lean();
    const response = NextResponse.json({ productIds: (wishlist?.products || []).map(String) });
    if (session.isNew) setStoreSessionCookie(response, session.id);
    return response;
  } catch {
    return jsonError("ইচ্ছেতালিকা হালনাগাদ করা যায়নি।", 503);
  }
}

export async function DELETE(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const parsed = await readJson(request, productSchema);
  if (!parsed.success) return parsed.response;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে ইচ্ছেতালিকা শুধু এই সেশনে থাকে।", 503);
  try {
    await connectDatabase();
    const session = await getStoreSession();
    await Wishlist.updateOne({ sessionId: session.id }, { $pull: { products: parsed.data.productId }, $set: { expiresAt: new Date(Date.now() + STORE_SESSION_MAX_AGE * 1000) } });
    const wishlist = await Wishlist.findOne({ sessionId: session.id }).select("products").lean();
    const response = NextResponse.json({ productIds: (wishlist?.products || []).map(String) });
    if (session.isNew) setStoreSessionCookie(response, session.id);
    return response;
  } catch {
    return jsonError("ইচ্ছেতালিকা হালনাগাদ করা যায়নি।", 503);
  }
}
