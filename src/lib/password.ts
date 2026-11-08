import { createHmac, timingSafeEqual } from "node:crypto";
import { unwrapStoredValue } from "./unwrap-stored-value";

const SESSION_MESSAGE = "family-devotion-admin-v1";

export function getAdminPassword() {
  return unwrapStoredValue(process.env.ADMIN_PASSWORD);
}

export function passwordsMatch(input: string, password: string) {
  const given = Buffer.from(input);
  const expected = Buffer.from(password);
  if (given.length !== expected.length) {
    timingSafeEqual(expected, expected);
    return false;
  }
  return timingSafeEqual(given, expected);
}

export function adminSessionToken(password: string) {
  return createHmac("sha256", password).update(SESSION_MESSAGE).digest("base64url");
}

export function sessionMatches(cookieValue: string | undefined, password: string) {
  if (!cookieValue) return false;
  const expected = adminSessionToken(password);
  const given = Buffer.from(cookieValue);
  const target = Buffer.from(expected);
  if (given.length !== target.length) return false;
  return timingSafeEqual(given, target);
}

export function adminCookieSecure() {
  return process.env.VERCEL === "1";
}
