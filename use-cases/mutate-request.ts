import type { PaymentRequest } from "@/drizzle/schema";
import type { PaymentRequestRecord } from "@/data-access/payment-requests";

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

export interface RequestMutationRedirectResult {
  redirectPath: string;
  revalidationPaths: string[];
}

type RedirectSearchParams = Record<string, string | undefined>;
export function getRequestRevalidationPaths(requestId: string) {
  return [
    "/dashboard/incoming",
    "/dashboard/outgoing",
    `/requests/${requestId}`,
    `/r/${requestId}`,
  ];
}

function buildRedirectUrl(
  pathname: string,
  searchParams: RedirectSearchParams,
) {
  const url = new URL(pathname, "http://localhost");

  for (const [key, value] of Object.entries(searchParams)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return `${url.pathname}${url.search}`;
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

  await updatePaymentRequestRecord(input.requestId, {
    ...statusSpecificValues,
    lastStatusChangedAt: now,
    recipientMatchedUserId:
      input.actorUserId &&
      (input.status === "Declined" || input.status === "Paid")
        ? input.actorUserId
        : undefined,
    status: input.status,
    updatedAt: now,
  });
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

  await applyRequestStatusMutation({
    actorUserId,
    requestId,
    status: "Paid",
  });

  return getFreshRequestOrThrow(requestId);
}

export async function runRequestMutationWithRedirect(input: {
  actorUserId: string;
  requestId: string;
  returnTo: string;
  type: RequestMutationInput["type"];
}): Promise<RequestMutationRedirectResult> {
  try {
    const request =
      input.type === "cancel"
        ? await cancelRequestMutation(input.requestId, input.actorUserId)
        : input.type === "decline"
          ? await declineRequestMutation(input.requestId, input.actorUserId)
          : await payRequestMutation(input.requestId, input.actorUserId);

    return {
      redirectPath: buildRedirectUrl(input.returnTo, {
        updated: request.id,
        updatedStatus: request.status,
      }),
      revalidationPaths: getRequestRevalidationPaths(request.id),
    };
  } catch (error) {
    return {
      redirectPath: buildRedirectUrl(input.returnTo, {
        requestError:
          error instanceof Error
            ? error.message
            : input.type === "pay"
              ? "We couldn’t process that payment. Please try again."
              : `We couldn’t ${input.type} that request. Please try again.`,
      }),
      revalidationPaths: [],
    };
  }
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
