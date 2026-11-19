import { Readable } from "node:stream";
import mongoose from "mongoose";
import { connectDatabase, isDatabaseConfigured } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function productMediaBucket() {
  const database = mongoose.connection.db;
  if (!database) throw new Error("DATABASE_UNAVAILABLE");
  return new mongoose.mongo.GridFSBucket(database, { bucketName: "productMedia" });
}

export async function GET(request, { params }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id) || !isDatabaseConfigured()) return jsonError("ছবিটি পাওয়া যায়নি।", 404);

  try {
    await connectDatabase();
    const bucket = productMediaBucket();
    const fileId = new mongoose.Types.ObjectId(id);
    const [file] = await bucket.find({ _id: fileId }).limit(1).toArray();
    const contentType = file?.contentType || file?.metadata?.contentType;
    if (!file || !IMAGE_TYPES.has(contentType)) return jsonError("ছবিটি পাওয়া যায়নি।", 404);

    const etag = `"${id}-${new Date(file.uploadDate).getTime()}"`;
    const headers = {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": contentType,
      "ETag": etag,
      "X-Content-Type-Options": "nosniff",
    };
    if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });

    const stream = bucket.openDownloadStream(fileId);
    return new Response(Readable.toWeb(stream), { headers });
  } catch {
    return jsonError("ছবিটি সাময়িকভাবে পাওয়া যাচ্ছে না।", 503);
  }
}
