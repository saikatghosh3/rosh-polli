import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { getStoreSession, setStoreSessionCookie, STORE_SESSION_MAX_AGE } from "@/lib/guest-session";
import { jsonError, readJson, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";
import { z } from "zod";

const addSchema = z.object({ action: z.literal("add"), productId: z.string().refine(mongoose.isValidObjectId), size: z.string().trim().min(1).max(40), quantity: z.coerce.number().int().min(1).max(10) });
const updateSchema = z.object({ productId: z.string().refine(mongoose.isValidObjectId), size: z.string().trim().min(1).max(40), quantity: z.coerce.number().int().min(1).max(10) });
const removeSchema = z.object({ clear: z.literal(true).optional(), productId: z.string().refine(mongoose.isValidObjectId).optional(), size: z.string().trim().max(40).optional() });

function serializeCart(cart) {
  return (cart?.items || []).flatMap((item) => {
    const product = item.product;
    if (!product || !product.isActive) return [];
    const variant = product.sizes?.find((size) => size.label === item.size);
    if (!variant) return [];
    return [{ productId: String(product._id), slug: product.slug, name: product.name, image: product.images?.[0] || "/images/collection-misti.svg", size: variant.label, price: variant.price, quantity: item.quantity, availableStock: variant.stock }];
  });
}

async function respondWithCart(sessionId, response = NextResponse.json({})) {
  const cart = await Cart.findOne({ sessionId }).populate({ path: "items.product", select: "name slug images sizes isActive" }).lean();
  const items = serializeCart(cart);
  response = NextResponse.json({ items, count: items.reduce((total, item) => total + item.quantity, 0) });
  return response;
}

async function ensureCart(sessionId) {
  const expiresAt = new Date(Date.now() + STORE_SESSION_MAX_AGE * 1000);
  return Cart.findOneAndUpdate({ sessionId }, { $setOnInsert: { sessionId, items: [], expiresAt } }, { new: true, upsert: true, setDefaultsOnInsert: true });
}

function handleDatabaseError(error) {
  if (error.code === "DATABASE_NOT_CONFIGURED") return jsonError("অর্ডার ও কার্ট সংরক্ষণ চালু করতে MongoDB সংযোগ যোগ করুন।", 503);
  if (error.code === "DATABASE_UNAVAILABLE") return jsonError("ডেটাবেসে সংযোগ পাওয়া যাচ্ছে না। পরে আবার চেষ্টা করুন।", 503);
  return jsonError("কার্ট হালনাগাদ করা যায়নি।", 500);
}

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ items: [], count: 0, demoMode: true });
  try {
    await connectDatabase();
    const session = await getStoreSession();
    let response = await respondWithCart(session.id);
    if (session.isNew) setStoreSessionCookie(response, session.id);
    return response;
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const parsed = await readJson(request, addSchema);
  if (!parsed.success) return parsed.response;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে কার্ট সংরক্ষণ হচ্ছে না।", 503);
  try {
    await connectDatabase();
    const session = await getStoreSession();
    const { productId, size, quantity } = parsed.data;
    const product = await Product.findOne({ _id: productId, isActive: true }).select("sizes").lean();
    const variant = product?.sizes?.find((item) => item.label === size);
    if (!variant) return jsonError("এই সাইজটি পাওয়া যাচ্ছে না।", 404);
    const cart = await ensureCart(session.id);
    if (cart.items.length === 0) cart.checkoutToken = randomUUID();
    const existing = cart.items.find((item) => String(item.product) === productId && item.size === size);
    const nextQuantity = (existing?.quantity || 0) + quantity;
    if (nextQuantity > 10) return jsonError("একটি সাইজের সর্বোচ্চ ১০টি পণ্য কার্টে রাখা যাবে।", 422);
    if (nextQuantity > variant.stock) return jsonError("স্টকে পর্যাপ্ত পণ্য নেই।", 409);
    if (existing) existing.quantity = nextQuantity;
    else cart.items.push({ product: productId, size, quantity });
    cart.expiresAt = new Date(Date.now() + STORE_SESSION_MAX_AGE * 1000);
    await cart.save();
    let response = await respondWithCart(session.id);
    if (session.isNew) setStoreSessionCookie(response, session.id);
    return response;
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function PATCH(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const parsed = await readJson(request, updateSchema);
  if (!parsed.success) return parsed.response;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে কার্ট সংরক্ষণ হচ্ছে না।", 503);
  try {
    await connectDatabase();
    const session = await getStoreSession();
    const { productId, size, quantity } = parsed.data;
    const product = await Product.findOne({ _id: productId, isActive: true }).select("sizes").lean();
    const variant = product?.sizes?.find((item) => item.label === size);
    if (!variant || quantity > variant.stock) return jsonError("স্টকে পর্যাপ্ত পণ্য নেই।", 409);
    const cart = await ensureCart(session.id);
    const item = cart.items.find((entry) => String(entry.product) === productId && entry.size === size);
    if (!item) return jsonError("পণ্যটি কার্টে পাওয়া যায়নি।", 404);
    item.quantity = quantity;
    cart.expiresAt = new Date(Date.now() + STORE_SESSION_MAX_AGE * 1000);
    await cart.save();
    let response = await respondWithCart(session.id);
    if (session.isNew) setStoreSessionCookie(response, session.id);
    return response;
  } catch (error) {
    return handleDatabaseError(error);
  }
}

export async function DELETE(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const parsed = await readJson(request, removeSchema);
  if (!parsed.success) return parsed.response;
  if (!isDatabaseConfigured()) return jsonError("ডেমো মোডে কার্ট সংরক্ষণ হচ্ছে না।", 503);
  try {
    await connectDatabase();
    const session = await getStoreSession();
    const cart = await ensureCart(session.id);
    if (parsed.data.clear) cart.items = [];
    else {
      cart.items = cart.items.filter((item) => !(String(item.product) === parsed.data.productId && item.size === parsed.data.size));
    }
    if (cart.items.length === 0) cart.checkoutToken = randomUUID();
    cart.expiresAt = new Date(Date.now() + STORE_SESSION_MAX_AGE * 1000);
    await cart.save();
    let response = await respondWithCart(session.id);
    if (session.isNew) setStoreSessionCookie(response, session.id);
    return response;
  } catch (error) {
    return handleDatabaseError(error);
  }
}
