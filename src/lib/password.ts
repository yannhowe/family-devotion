import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_MESSAGE = "family-devotion-admin-v1";

export function getAdminPassword() {
  let password = process.env.ADMIN_PASSWORD?.trim() ?? "";
  if (!password) return undefined;

  if (password.startsWith("b64:")) {
    password = Buffer.from(password.slice(4), "base64").toString("utf8").trim();
  } else if (password.startsWith("sep:")) {
    password = password.slice(4).replaceAll(",", "").trim();
  }

  return password || undefined;
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
