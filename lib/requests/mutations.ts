import { PrismaClient, RequestStatus, type Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { computeExpiresAt, isRequestExpired, syncExpiredRequest } from "@/lib/requests/expiry";
import { isPendingStatus } from "@/lib/requests/status";
import {
  findUserByNormalizedContact,
  getRequestById,
} from "@/lib/requests/queries";

type DatabaseClient = Prisma.TransactionClient | PrismaClient;

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
  client: DatabaseClient = db,
) {
  const request = await client.paymentRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Request not found.");
  }

  const syncedRequest = await syncExpiredRequest(client, request);

  if (!isPendingStatus(syncedRequest.status)) {
    throw new Error("Only pending requests can be changed.");
  }

  return syncedRequest;
}

export async function createPaymentRequest(input: CreatePaymentRequestInput) {
  const recipientMatchedUser = await findUserByNormalizedContact(
    input.recipientContactType,
    input.recipientContactValue,
  );

  return db.paymentRequest.create({
    data: {
      amountCents: input.amountCents,
      expiresAt: computeExpiresAt(),
      lastStatusChangedAt: new Date(),
      note: input.note,
      recipientContactType:
        input.recipientContactType === "email" ? "EMAIL" : "PHONE",
      recipientContactValue: input.recipientContactValue,
      recipientMatchedUserId: recipientMatchedUser?.id,
      senderUserId: input.senderUserId,
    },
    include: {
      recipientMatchedUser: true,
      sender: true,
    },
  });
}

export async function cancelPaymentRequest(requestId: string, actorUserId: string) {
  const request = await getFreshPendingRequestOrThrow(requestId);

  if (request.senderUserId !== actorUserId) {
    throw new Error("Only the sender can cancel this request.");
  }

  return db.paymentRequest.update({
    where: { id: requestId },
    data: {
      cancelledAt: new Date(),
      lastStatusChangedAt: new Date(),
      status: RequestStatus.CANCELLED,
    },
  });
}

export async function declinePaymentRequest(requestId: string, actorUserId: string) {
  const request = await getFreshPendingRequestOrThrow(requestId);

  if (request.recipientMatchedUserId !== actorUserId) {
    throw new Error("Only the intended recipient can decline this request.");
  }

  return db.paymentRequest.update({
    where: { id: requestId },
    data: {
      declinedAt: new Date(),
      lastStatusChangedAt: new Date(),
      status: RequestStatus.DECLINED,
    },
  });
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
    return db.paymentRequest.update({
      where: { id: requestId },
      data: {
        lastStatusChangedAt: new Date(),
        status: RequestStatus.EXPIRED,
      },
    });
  }

  if (!isPendingStatus(freshRequest.status)) {
    throw new Error("Only pending requests can be paid.");
  }

  return db.paymentRequest.update({
    where: { id: requestId },
    data: {
      lastStatusChangedAt: new Date(),
      paidAt: new Date(),
      status: RequestStatus.PAID,
    },
  });
}
