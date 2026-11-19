import { jsonError } from "@/lib/http";

const statusByCode = {
  AUTH_NOT_CONFIGURED: 503,
  AUTH_SETUP_DISABLED: 503,
  DATABASE_NOT_CONFIGURED: 503,
  DATABASE_UNAVAILABLE: 503,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CSRF_FORBIDDEN: 403,
  NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,
  RESOURCE_IN_USE: 409,
  ADMIN_ALREADY_EXISTS: 409,
  EMAIL_EXISTS: 409,
  INVALID_COUPON: 422,
  INVALID_ORDER_TRANSITION: 409,
  VARIANT_IN_USE: 409,
  EMPTY_CART: 409,
  CART_CHANGED: 409,
  OUT_OF_STOCK: 409,
  RATE_LIMITED: 429,
};

export function handleApiError(error, fallbackMessage) {
  const code = error?.code;
  const status = statusByCode[code] || (code === 11000 ? 409 : error?.name === "ValidationError" || code === "VALIDATION" ? 422 : 500);
  const message = status < 500 && error?.message ? error.message : fallbackMessage;
  const extra = code === "VALIDATION" && Array.isArray(error.issues) ? { issues: error.issues } : {};
  return jsonError(message, status, extra);
}
