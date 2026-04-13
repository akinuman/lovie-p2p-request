import type { PaymentRequestRecord } from "@/data-access/payment-requests";
import type { PaymentRequest } from "@/drizzle/schema";

import {
  findPaymentRequestById,
  updatePaymentRequestRecord,
} from "@/data-access/payment-requests";
import { findUser } from "@/data-access/users";
import { getRequestViewerRole } from "@/lib/auth/current-user";
import { getRequestActionGuardMessage } from "@/use-cases/request-status";

export interface RequestMutationInput {
  actorUserId: string;
  requestId: string;
  type: "cancel" | "decline" | "pay";
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

async function applyRequestStatusMutation(input: {
  actorUserId?: string;
  currentRecipientMatchedUserId?: string | null;
  requestId: string;
  status: "Cancelled" | "Declined" | "Paid";
}) {
  const now = new Date();
  const statusSpecificValues =
    input.status === "Cancelled"
      ? {
          cancelledAt: now,
        }
      : input.status === "Declined"
        ? {
            declinedAt: now,
          }
        : {
            paidAt: now,
          };

  // Only lazy-match the recipient when no match exists yet.
  // If recipientMatchedUserId is already set, the guard has already
  // verified the actor owns it — no need to overwrite.
  const shouldLazyMatch =
    input.actorUserId &&
    (input.status === "Declined" || input.status === "Paid") &&
    !input.currentRecipientMatchedUserId;

  // Optimistic concurrency: only transition from Pending.
  // If another mutation already changed the status, zero rows update
  // and we get null — preventing double-pay / double-decline races.
  const result = await updatePaymentRequestRecord(
    input.requestId,
    {
      ...statusSpecificValues,
      lastStatusChangedAt: now,
      recipientMatchedUserId: shouldLazyMatch ? input.actorUserId : undefined,
      status: input.status,
      updatedAt: now,
    },
    "Pending",
  );

  if (!result) {
    throw new Error(
      "This request has already been updated. Please refresh and try again.",
    );
  }
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
  await applyRequestStatusMutation({
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
  await applyRequestStatusMutation({
    actorUserId,
    currentRecipientMatchedUserId: request.recipientMatchedUserId,
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

  // Re-fetch to guard against races (e.g. expiry between dialog open and confirm).
  const freshRequest = await getFreshRequestOrThrow(requestId);

  try {
    guardRequestMutation("pay", freshRequest, actorUser);
  } catch (error) {
    if (freshRequest.status === "Expired") {
      return freshRequest;
    }

    throw error;
  }

  await applyRequestStatusMutation({
    actorUserId,
    currentRecipientMatchedUserId: freshRequest.recipientMatchedUserId,
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

  throw new Error(
    "Create mutations require the dedicated createRequestMutation helper.",
  );
}
