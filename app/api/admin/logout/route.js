import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_SECONDS } from "@/lib/auth";
import { sameOriginError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request) {
  const originError = sameOriginError(request);
  if (originError) return originError;
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
