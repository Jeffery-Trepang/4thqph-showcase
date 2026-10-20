import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "4qph_admin";

function getSecret(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

/**
 * A signed token derived from ADMIN_PASSWORD. The password itself is never
 * stored in the cookie; only this HMAC digest is.
 */
export function adminToken(): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update("4qph-admin-session")
    .digest("hex");
}

/**
 * True when the current request carries a valid admin cookie.
 * Safe to call from Server Components and Route Handlers.
 */
export function verifyAdminCookie(): boolean {
  const secret = getSecret();
  if (!secret) return false;
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return !!token && token === adminToken();
}
