import { cache } from "react";

import { redirect } from "next/navigation";
import { type PaymentRequest, type User } from "@/drizzle/schema";

export {
  getOptimisticAuthRedirectPath,
  hasOptimisticSessionCookie,
  isProtectedRequestRoute,
  isPublicAuthOnlyRoute,
  PROTECTED_REQUEST_ROUTE_PREFIXES,
  PUBLIC_AUTH_ONLY_ROUTE_PREFIXES,
} from "@/lib/auth/route-guard";
import { normalizeEmail, normalizePhone } from "@/lib/validation/requests";

export type RequestViewerRole = "none" | "recipient" | "sender";

type RequestRecipientMatch = Pick<
  PaymentRequest,
  "recipientContactType" | "recipientContactValue" | "recipientMatchedUserId" | "senderUserId"
>;
type UserIdentity = Pick<User, "email" | "id" | "phone">;

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const { getSessionCookie } = await import("@/lib/auth/session");
  const session = await getSessionCookie();

  if (!session) {
    return null;
  }

  const { findUser } = await import("@/data-access/users");
  const user = await findUser({
    id: session.userId,
  });

  return user ?? null;
});

function doesUserMatchRequestRecipient(
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

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
