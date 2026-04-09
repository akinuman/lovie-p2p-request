import { eq } from "drizzle-orm";

import { paymentRequests } from "@/drizzle/schema";

import { db } from "@/lib/db";
import { computeExpiresAt, isRequestExpired } from "@/lib/requests/expiry";
import { isPendingStatus } from "@/lib/requests/status";
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

async function getFreshPendingRequestOrThrow(
  requestId: string,
) {
  const request = await getRequestById(requestId);

  if (!request) {
    throw new Error("Request not found.");
  }

  if (!isPendingStatus(request.status)) {
    throw new Error("Only pending requests can be changed.");
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
  const request = await getFreshPendingRequestOrThrow(requestId);

  if (request.senderUserId !== actorUserId) {
    throw new Error("Only the sender can cancel this request.");
  }

  const [updatedRequest] = await db
    .update(paymentRequests)
    .set({
      cancelledAt: new Date(),
      lastStatusChangedAt: new Date(),
      status: "Cancelled",
      updatedAt: new Date(),
    })
    .where(eq(paymentRequests.id, requestId))
    .returning();

  return updatedRequest;
}

export async function declinePaymentRequest(requestId: string, actorUserId: string) {
  const request = await getFreshPendingRequestOrThrow(requestId);

  if (request.recipientMatchedUserId !== actorUserId) {
    throw new Error("Only the intended recipient can decline this request.");
  }

  const [updatedRequest] = await db
    .update(paymentRequests)
    .set({
      declinedAt: new Date(),
      lastStatusChangedAt: new Date(),
      status: "Declined",
      updatedAt: new Date(),
    })
    .where(eq(paymentRequests.id, requestId))
    .returning();

  return updatedRequest;
}

export async function payPaymentRequest(requestId: string, actorUserId: string) {
  const request = await getFreshPendingRequestOrThrow(requestId);

  if (request.recipientMatchedUserId !== actorUserId) {
    throw new Error("Only the intended recipient can pay this request.");
  }

  await new Promise((resolve) => setTimeout(resolve, 2_500));

  const freshRequest = await getRequestById(requestId);

  if (!freshRequest) {
    throw new Error("Request not found.");
  }

  if (isRequestExpired(freshRequest.expiresAt)) {
    const [updatedRequest] = await db
      .update(paymentRequests)
      .set({
        lastStatusChangedAt: new Date(),
        status: "Expired",
        updatedAt: new Date(),
      })
      .where(eq(paymentRequests.id, requestId))
      .returning();

    return updatedRequest;
  }

  if (!isPendingStatus(freshRequest.status)) {
    throw new Error("Only pending requests can be paid.");
  }

  const [updatedRequest] = await db
    .update(paymentRequests)
    .set({
      lastStatusChangedAt: new Date(),
      paidAt: new Date(),
      status: "Paid",
      updatedAt: new Date(),
    })
    .where(eq(paymentRequests.id, requestId))
    .returning();

  return updatedRequest;
}
