import { cookies } from "next/headers";
import {
  adminCookieSecure,
  adminSessionToken,
  getAdminPassword,
  passwordsMatch,
  sessionMatches,
} from "./password";

export const ADMIN_COOKIE = "family_devotion_admin";

export async function isAdmin() {
  const password = getAdminPassword();
  if (!password) return false;
  const jar = await cookies();
  return sessionMatches(jar.get(ADMIN_COOKIE)?.value, password);
}

export async function startAdminSession(input: string) {
  const password = getAdminPassword();
  if (!password || !passwordsMatch(input, password)) return false;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, adminSessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: adminCookieSecure(),
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return true;
}

export async function endAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}
