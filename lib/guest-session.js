import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

export const STORE_SESSION_COOKIE = "roshpolli_store_session";
export const STORE_SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function isValidSessionId(value) {
  return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value);
}

export async function getStoreSession() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(STORE_SESSION_COOKIE)?.value;
  if (isValidSessionId(existing)) return { id: existing, isNew: false };
  return { id: randomUUID(), isNew: true };
}

export function setStoreSessionCookie(response, sessionId) {
  response.cookies.set(STORE_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STORE_SESSION_MAX_AGE,
  });
  return response;
}
