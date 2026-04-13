import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getEnv } from "@/lib/env";

export interface SessionPayload {
  email: string;
  issuedAt: string;
  userId: string;
}

function sign(value: string) {
  return createHmac("sha256", getEnv().SESSION_SECRET)
    .update(value)
    .digest("base64url");
}

function encodeSession(payload: SessionPayload) {
  const serialized = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${serialized}.${sign(serialized)}`;
}

function decodeSession(value: string): SessionPayload | null {
  const [serialized, signature] = value.split(".");

  if (!serialized || !signature) {
    return null;
  }

  const expectedSignature = sign(serialized);

  if (signature.length !== expectedSignature.length) {
    return null;
  }

  const isValid = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isValid) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(serialized, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: Omit<SessionPayload, "issuedAt">) {
  const cookieStore = await cookies();
  const value = encodeSession({
    ...payload,
    issuedAt: new Date().toISOString(),
  });

  // NOTE: No maxAge/expires and issuedAt is never validated by decodeSession —
  // the session lives until browser close with no server-side expiry check.
  // Acceptable for this take-home's mock auth (the assignment scope is P2P
  // payment flows, not auth hardening), but a production fintech app would set
  // a short maxAge and validate issuedAt + sliding window on decode.
  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawValue) {
    return null;
  }

  return decodeSession(rawValue);
}
