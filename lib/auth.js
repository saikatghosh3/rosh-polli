import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import User from "@/models/User";
import { connectDatabase } from "@/lib/db";

export const ADMIN_COOKIE_NAME = "roshpolli_admin_session";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    const error = new Error("JWT_SECRET is missing or too short.");
    error.code = "AUTH_NOT_CONFIGURED";
    throw error;
  }
  return secret;
}

export function isAdminAuthConfigured() {
  return Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32);
}

export async function verifyPassword(plainText, passwordHash) {
  return bcrypt.compare(plainText, passwordHash);
}

export async function hashPassword(plainText) {
  return bcrypt.hash(plainText, 12);
}

export function createAdminToken(user) {
  return jwt.sign({ role: user.role }, getJwtSecret(), {
    algorithm: "HS256",
    subject: String(user._id),
    expiresIn: ADMIN_SESSION_SECONDS,
    issuer: "roshpolli-store",
    audience: "roshpolli-admin",
  });
}

export function verifyAdminToken(token) {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      issuer: "roshpolli-store",
      audience: "roshpolli-admin",
    });
    if (payload.role !== "admin" || typeof payload.sub !== "string") return null;
    return { id: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function getAdminIdentity() {
  if (!isAdminAuthConfigured()) return null;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return token ? verifyAdminToken(token) : null;
}

export async function requireAdmin() {
  const identity = await getAdminIdentity();
  if (!identity) {
    const error = new Error("প্রশাসকের অনুমতি প্রয়োজন।");
    error.code = "UNAUTHORIZED";
    throw error;
  }
  await connectDatabase();
  const user = await User.findById(identity.id).select("name email role isActive").lean();
  if (!user || !user.isActive || user.role !== "admin") {
    const error = new Error("আপনার অ্যাডমিন সেশনটি আর সক্রিয় নেই।");
    error.code = "UNAUTHORIZED";
    throw error;
  }
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}

export function constantTimeSecretMatch(candidate, expected) {
  if (typeof candidate !== "string" || typeof expected !== "string" || !candidate || !expected) return false;
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  if (candidateBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(candidateBuffer, expectedBuffer);
}
