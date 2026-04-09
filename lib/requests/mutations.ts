import { eq } from "drizzle-orm";

import { paymentRequests } from "@/drizzle/schema";

import {
  getRequestViewerRole,
  getUserById,
} from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { computeExpiresAt } from "@/lib/requests/expiry";
import { getRequestActionGuardMessage } from "@/lib/requests/status";
import {
  findUserByNormalizedContact,
  getRequestById,
} from "@/lib/requests/queries";

export interface CreatePaymentRequestInput {
  amountCents: number;
  note?: string;
  recipientContactType: "email" | "phone";
  recipientContactValue: string;
  senderUserId: string;
}

export function getRequestRevalidationPaths(requestId: string) {
  return [
    `/dashboard/incoming`,
    `/dashboard/outgoing`,
    `/requests/${requestId}`,
    `/r/${requestId}`,
  ];
}

async function getFreshRequestOrThrow(requestId: string) {
  const request = await getRequestById(requestId);

  if (!request) {
    throw new Error("Request not found.");
  }

  return request;
}

export async function createPaymentRequest(input: CreatePaymentRequestInput) {
  const recipientMatchedUser = await findUserByNormalizedContact(
    input.recipientContactType,
    input.recipientContactValue,
  );

  const [createdRequest] = await db
    .insert(paymentRequests)
    .values({
      amountCents: input.amountCents,
      expiresAt: computeExpiresAt(),
      lastStatusChangedAt: new Date(),
      note: input.note,
      recipientContactType: input.recipientContactType,
      recipientContactValue: input.recipientContactValue,
      recipientMatchedUserId: recipientMatchedUser?.id,
      senderUserId: input.senderUserId,
      updatedAt: new Date(),
    })
    .returning({
      id: paymentRequests.id,
    });

  const request = await getRequestById(createdRequest.id);

  if (!request) {
    throw new Error("We couldn’t load the created request.");
  }

  return request;
}

export async function cancelPaymentRequest(requestId: string, actorUserId: string) {
  const [actorUser, request] = await Promise.all([
    getUserById(actorUserId),
    getFreshRequestOrThrow(requestId),
  ]);

  if (!actorUser) {
    throw new Error("User not found.");
  }

  const errorMessage = getRequestActionGuardMessage("cancel", {
    expiresAt: request.expiresAt,
    status: request.status,
    viewerRole: getRequestViewerRole(actorUser, request),
  });

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  const now = new Date();
  const [updatedRequest] = await db
    .update(paymentRequests)
    .set({
      cancelledAt: now,
      lastStatusChangedAt: now,
      status: "Cancelled",
      updatedAt: now,
    })
    .where(eq(paymentRequests.id, requestId))
    .returning();

  return updatedRequest;
}

export async function declinePaymentRequest(requestId: string, actorUserId: string) {
  const [actorUser, request] = await Promise.all([
    getUserById(actorUserId),
    getFreshRequestOrThrow(requestId),
  ]);

  if (!actorUser) {
    throw new Error("User not found.");
  }

  const errorMessage = getRequestActionGuardMessage("decline", {
    expiresAt: request.expiresAt,
    status: request.status,
    viewerRole: getRequestViewerRole(actorUser, request),
  });

  if (errorMessage) {
    throw new Error(errorMessage);
  }

  const now = new Date();
  const [updatedRequest] = await db
    .update(paymentRequests)
    .set({
      declinedAt: now,
      lastStatusChangedAt: now,
      recipientMatchedUserId: actorUser.id,
      status: "Declined",
      updatedAt: now,
    })
    .where(eq(paymentRequests.id, requestId))
    .returning();

  return updatedRequest;
}

export async function payPaymentRequest(requestId: string, actorUserId: string) {
  const [actorUser, request] = await Promise.all([
    getUserById(actorUserId),
    getFreshRequestOrThrow(requestId),
  ]);

  if (!actorUser) {
    throw new Error("User not found.");
  }

  const preflightError = getRequestActionGuardMessage("pay", {
    expiresAt: request.expiresAt,
    status: request.status,
    viewerRole: getRequestViewerRole(actorUser, request),
  });

  if (preflightError) {
    throw new Error(preflightError);
  }

  await new Promise((resolve) => setTimeout(resolve, 2_500));

  const freshRequest = await getFreshRequestOrThrow(requestId);
  const completionError = getRequestActionGuardMessage("pay", {
    expiresAt: freshRequest.expiresAt,
    status: freshRequest.status,
    viewerRole: getRequestViewerRole(actorUser, freshRequest),
  });

  if (completionError) {
    if (freshRequest.status === "Expired") {
      return freshRequest;
    }

    throw new Error(completionError);
  }

  const now = new Date();
  const [updatedRequest] = await db
    .update(paymentRequests)
    .set({
      lastStatusChangedAt: now,
      paidAt: now,
      recipientMatchedUserId: actorUser.id,
      status: "Paid",
      updatedAt: now,
    })
    .where(eq(paymentRequests.id, requestId))
    .returning();

  return updatedRequest;
}
