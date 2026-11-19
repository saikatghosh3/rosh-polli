import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import mongoose from "mongoose";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api-errors";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientAddress, jsonError, sameOriginError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const MAX_FILES = 8;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function matchesImageSignature(buffer, type) {
  if (type === "image/jpeg") return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === "image/webp") return buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  return false;
}

function getProductMediaBucket() {
  const database = mongoose.connection.db;
  if (!database) throw Object.assign(new Error("DATABASE_UNAVAILABLE"), { code: "DATABASE_UNAVAILABLE" });
  return new mongoose.mongo.GridFSBucket(database, { bucketName: "productMedia" });
}

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  if (!isDatabaseConfigured()) return jsonError("ছবি সংরক্ষণের আগে MongoDB সংযোগ প্রয়োজন।", 503);
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > MAX_TOTAL_BYTES + 64 * 1024) return jsonError("একবারে সর্বোচ্চ ২০ MB ছবি আপলোড করা যাবে।", 413);

  let bucket;
  const uploadedIds = [];
  try {
    const admin = await requireAdmin();
    const limit = await consumeRateLimit(`admin-upload:${getClientAddress(request)}`, { limit: 40, windowMs: 60 * 60 * 1000 });
    if (!limit.allowed) return jsonError("ছবি আপলোডের সীমা অতিক্রম হয়েছে। পরে আবার চেষ্টা করুন।", 429, { retryAfterSeconds: limit.retryAfterSeconds });

    const formData = await request.formData();
    const files = formData.getAll("files").filter((file) => file && typeof file.arrayBuffer === "function" && file.size > 0);
    if (!files.length || files.length > MAX_FILES) return jsonError(`একবারে ১ থেকে ${MAX_FILES}টি ছবি বেছে নিন।`, 400);
    if (files.some((file) => file.size > MAX_FILE_BYTES) || files.reduce((total, file) => total + file.size, 0) > MAX_TOTAL_BYTES) {
      return jsonError("প্রতিটি ছবি ৫ MB-এর মধ্যে এবং সব ছবি মিলিয়ে ২০ MB-এর মধ্যে রাখুন।", 413);
    }
    if (files.some((file) => !ALLOWED_TYPES.has(file.type))) return jsonError("শুধু JPG, PNG অথবা WebP ছবি আপলোড করা যাবে।", 415);

    const prepared = await Promise.all(files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!matchesImageSignature(buffer, file.type)) throw Object.assign(new Error("INVALID_IMAGE"), { code: "INVALID_IMAGE" });
      return { file, buffer };
    }));

    await connectDatabase();
    bucket = getProductMediaBucket();
    const urls = [];
    for (const { file, buffer } of prepared) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80) || "product-image";
      const stream = bucket.openUploadStream(`${randomUUID()}-${safeName}`, {
        contentType: file.type,
        metadata: { contentType: file.type, uploadedBy: admin.id },
      });
      await pipeline(Readable.from(buffer), stream);
      uploadedIds.push(stream.id);
      urls.push(`/api/media/${stream.id.toString()}`);
    }

    return Response.json({ urls }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (bucket) await Promise.all(uploadedIds.map((id) => bucket.delete(id).catch(() => undefined)));
    if (error?.code === "INVALID_IMAGE") return jsonError("ছবির ফাইলটি সঠিক নয়।", 415);
    return handleApiError(error, "ছবি আপলোড করা যায়নি।");
  }
}
