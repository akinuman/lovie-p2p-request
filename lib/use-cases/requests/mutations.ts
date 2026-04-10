import type { PaymentRequest } from "@/drizzle/schema";
import type { PaymentRequestRecord } from "@/lib/data-access/payment-requests";

import {
  createPaymentRequestRecord,
  findMatchedRecipientUser,
  findPaymentRequestById,
  mutatePaymentRequest,
} from "@/lib/data-access/payment-requests";
import { findUser } from "@/lib/data-access/users";
import { getRequestViewerRole } from "@/lib/auth/current-user";
import { computeExpiresAt } from "@/lib/requests/expiry";
import { getRequestActionGuardMessage } from "@/lib/requests/status";
import { getRequestCurrencyCode } from "@/lib/request-flow/currency";

export interface CreateRequestMutationInput {
  amountCents: number;
  note?: string;
  recipientContactType: "email" | "phone";
  recipientContactValue: string;
  senderUserId: string;
}

export interface RequestMutationInput {
  actorUserId: string;
  requestId: string;
  type: "cancel" | "create" | "decline" | "pay";
}

export function getRequestRevalidationPaths(requestId: string) {
  return [
    "/dashboard/incoming",
    "/dashboard/outgoing",
    `/requests/${requestId}`,
    `/r/${requestId}`,
  ];
}

async function getFreshRequestOrThrow(requestId: string) {
  const request = await findPaymentRequestById(requestId);

  if (!request) {
    throw new Error("Request not found.");
  }

  return request;
}

async function getAuthorizedActorAndRequest(
  requestId: string,
  actorUserId: string,
) {
  const [actorUser, request] = await Promise.all([
    findUser({
      id: actorUserId,
    }),
    getFreshRequestOrThrow(requestId),
  ]);

  if (!actorUser) {
    throw new Error("User not found.");
  }

  return {
    actorUser,
    request,
  };
}

function guardRequestMutation(
  action: "cancel" | "decline" | "pay",
  request: PaymentRequestRecord,
  actorUser: {
    email: string;
    id: string;
    phone: string | null;
  },
) {
  const errorMessage = getRequestActionGuardMessage(action, {
    expiresAt: request.expiresAt,
    status: request.status,
    viewerRole: getRequestViewerRole(actorUser, request),
  });

  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

export async function createRequestMutation(
  input: CreateRequestMutationInput,
) {
  const recipientMatchedUser = await findMatchedRecipientUser(
    input.recipientContactType,
    input.recipientContactValue,
  );

  const now = new Date();
  const createdRequest = await createPaymentRequestRecord({
    amountCents: input.amountCents,
    createdAt: now,
    currencyCode: getRequestCurrencyCode(),
    expiresAt: computeExpiresAt(now),
    lastStatusChangedAt: now,
    note: input.note,
    recipientContactType: input.recipientContactType,
    recipientContactValue: input.recipientContactValue,
    recipientMatchedUserId: recipientMatchedUser?.id,
    senderUserId: input.senderUserId,
    updatedAt: now,
  });

  return getFreshRequestOrThrow(createdRequest.id);
}

export async function cancelRequestMutation(
  requestId: string,
  actorUserId: string,
) {
  const { actorUser, request } = await getAuthorizedActorAndRequest(
    requestId,
    actorUserId,
  );

  guardRequestMutation("cancel", request, actorUser);
  await mutatePaymentRequest({
    requestId,
    status: "Cancelled",
  });

  return getFreshRequestOrThrow(requestId);
}

export async function declineRequestMutation(
  requestId: string,
  actorUserId: string,
) {
  const { actorUser, request } = await getAuthorizedActorAndRequest(
    requestId,
    actorUserId,
  );

  guardRequestMutation("decline", request, actorUser);
  await mutatePaymentRequest({
    actorUserId,
    requestId,
    status: "Declined",
  });

  return getFreshRequestOrThrow(requestId);
}

export async function payRequestMutation(
  requestId: string,
  actorUserId: string,
) {
  const { actorUser, request } = await getAuthorizedActorAndRequest(
    requestId,
    actorUserId,
  );

  guardRequestMutation("pay", request, actorUser);
  await new Promise((resolve) => setTimeout(resolve, 2_500));

  const freshRequest = await getFreshRequestOrThrow(requestId);

  try {
    guardRequestMutation("pay", freshRequest, actorUser);
  } catch (error) {
    if (freshRequest.status === "Expired") {
      return freshRequest;
    }

    throw error;
  }

  await mutatePaymentRequest({
    actorUserId,
    requestId,
    status: "Paid",
  });

  return getFreshRequestOrThrow(requestId);
}

export async function runRequestMutation(
  input: RequestMutationInput,
): Promise<PaymentRequest> {
  if (input.type === "cancel") {
    return cancelRequestMutation(input.requestId, input.actorUserId);
  }

  if (input.type === "decline") {
    return declineRequestMutation(input.requestId, input.actorUserId);
  }

  if (input.type === "pay") {
    return payRequestMutation(input.requestId, input.actorUserId);
  }

  throw new Error("Create mutations require the dedicated createRequestMutation helper.");
}
