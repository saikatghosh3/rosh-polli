import { createHash } from "node:crypto";
import RateLimit from "@/models/RateLimit";
import { connectDatabase } from "@/lib/db";

export async function consumeRateLimit(key, { limit = 8, windowMs = 60_000 } = {}) {
  await connectDatabase();
  const now = Date.now();
  const windowId = Math.floor(now / windowMs);
  const bucketKey = createHash("sha256").update(`${key}:${windowId}`).digest("hex");
  const expiresAt = new Date((windowId + 1) * windowMs);
  const record = await RateLimit.findOneAndUpdate(
    { key: bucketKey },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  ).lean();
  return {
    allowed: record.count <= limit,
    remaining: Math.max(0, limit - record.count),
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}
