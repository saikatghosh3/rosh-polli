import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function getClientAddress(request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(address).digest("hex");
}

export function assertSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    if (request.headers.get("sec-fetch-site") === "cross-site") {
      throw Object.assign(new Error("এই অনুরোধটি অনুমোদিত নয়।"), { code: "CSRF_FORBIDDEN" });
    }
    return;
  }
  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw Object.assign(new Error("এই অনুরোধটি অনুমোদিত নয়।"), { code: "CSRF_FORBIDDEN" });
  }
  const requestHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!requestHost || originHost.toLowerCase() !== requestHost.toLowerCase()) {
    throw Object.assign(new Error("এই অনুরোধটি অনুমোদিত নয়।"), { code: "CSRF_FORBIDDEN" });
  }
}

export function sameOriginError(request) {
  try {
    assertSameOrigin(request);
    return null;
  } catch (error) {
    return jsonError(error.message || "এই অনুরোধটি অনুমোদিত নয়।", 403);
  }
}

export async function readJson(request, schema, maxBytes = 64_000) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes) return { success: false, response: jsonError("অনুরোধের তথ্য সীমার চেয়ে বড়।", 413) };
  let body;
  try {
    const raw = await request.text();
    if (raw.length > maxBytes) return { success: false, response: jsonError("অনুরোধের তথ্য সীমার চেয়ে বড়।", 413) };
    body = JSON.parse(raw);
  } catch {
    return { success: false, response: jsonError("সঠিক JSON তথ্য পাঠান।", 400) };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false, response: jsonError("তথ্য যাচাই করা যায়নি। প্রতিটি ঘর আবার দেখুন।", 422, { issues: result.error.issues.map((issue) => ({ path: issue.path, message: issue.message })) }) };
  }
  return { success: true, data: result.data };
}
