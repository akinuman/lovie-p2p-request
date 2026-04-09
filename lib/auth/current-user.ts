import { cache } from "react";

import { redirect } from "next/navigation";
import { type PaymentRequest, type User } from "@/drizzle/schema";

import { getSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { normalizeEmail, normalizePhone } from "@/lib/validation/requests";

export type RequestViewerRole = "none" | "recipient" | "sender";

type RequestRecipientMatch = Pick<
  PaymentRequest,
  "recipientContactType" | "recipientContactValue" | "recipientMatchedUserId" | "senderUserId"
>;
type UserIdentity = Pick<User, "email" | "id" | "phone">;

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSessionCookie();

  if (!session) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, session.userId),
  });

  return user ?? null;
});

export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, userId),
  });
}

export function doesUserMatchRequestRecipient(
  user: UserIdentity,
  request: RequestRecipientMatch,
) {
  if (request.recipientMatchedUserId === user.id) {
    return true;
  }

  if (request.recipientContactType === "email") {
    return normalizeEmail(user.email) === request.recipientContactValue;
  }

  const normalizedPhone = user.phone ? normalizePhone(user.phone) : null;
  return normalizedPhone === request.recipientContactValue;
}

export function getRequestViewerRole(
  user: UserIdentity,
  request: RequestRecipientMatch,
): RequestViewerRole {
  if (request.senderUserId === user.id) {
    return "sender";
  }

  if (doesUserMatchRequestRecipient(user, request)) {
    return "recipient";
  }

  return "none";
}

export function canUserAccessRequest(
  user: UserIdentity,
  request: RequestRecipientMatch,
) {
  return getRequestViewerRole(user, request) !== "none";
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
