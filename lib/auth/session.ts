import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";

const SESSION_COOKIE_NAME = "lovie-session";

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
