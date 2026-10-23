import { createHmac, timingSafeEqual } from "node:crypto";

export const ALAN_SESSION_COOKIE = "nexus_alan_session";
const SESSION_DURATION_SECONDS = 30 * 60;

function sessionSignature(expiresAt) {
  const password = process.env.ALAN_PASSWORD;
  if (!password) return null;

  return createHmac("sha256", password)
    .update(`alan-session:${expiresAt}`)
    .digest("hex");
}

export function createAlanSessionToken() {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const signature = sessionSignature(expiresAt);
  return signature ? `${expiresAt}.${signature}` : null;
}

export function hasAlanSession(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${ALAN_SESSION_COOKIE}=`))
    ?.slice(ALAN_SESSION_COOKIE.length + 1);

  if (!token) return false;

  const [expiresAtValue, providedSignature, ...extraParts] = token.split(".");
  const expiresAt = Number(expiresAtValue);
  if (
    extraParts.length > 0 ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Date.now() ||
    !providedSignature
  ) {
    return false;
  }

  const expectedSignature = sessionSignature(expiresAt);
  if (!expectedSignature) return false;

  const providedBuffer = Buffer.from(providedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export function isSameOriginRequest(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function sessionCookie(token, request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ALAN_SESSION_COOKIE}=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}${secure}`;
}

export function expiredSessionCookie(request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ALAN_SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`;
}
