import type { User } from "@/drizzle/schema";

import {
  getRequestViewerRole,
  type RequestViewerRole,
} from "@/lib/auth/current-user";
import {
  findPaymentRequestById,
  type PaymentRequestRecord,
} from "@/data-access/payment-requests";
import { syncExpiredRequest } from "@/use-cases/request-expiry";

type UserIdentity = Pick<User, "email" | "id" | "phone">;
type RequestRouteSearchParams = Record<string, string | string[] | undefined>;

export interface RequestDetailReadResult {
  request: PaymentRequestRecord;
  viewerRole: RequestViewerRole;
}

function readStringParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readStatusMessage(status?: string) {
  if (!status) {
    return null;
  }

  return `Request updated to ${status}.`;
}

async function syncRequestRecord(request: PaymentRequestRecord) {
  const syncedRequest = await syncExpiredRequest(request);

  if (syncedRequest.status === request.status) {
    return request;
  }

  const reloadedRequest = await findPaymentRequestById(request.id);

  if (!reloadedRequest) {
    throw new Error("Request not found.");
  }

  return reloadedRequest;
}

export async function getRequestById(requestId: string) {
  const request = await findPaymentRequestById(requestId);

  if (!request) {
    return null;
  }

  return syncRequestRecord(request);
}

export async function getRequestDetailReadResult(
  requestId: string,
  user: UserIdentity,
): Promise<RequestDetailReadResult | null> {
  const syncedRequest = await getRequestById(requestId);

  if (!syncedRequest) {
    return null;
  }

  const viewerRole = getRequestViewerRole(user, syncedRequest);

  if (viewerRole === "none") {
    return null;
  }

  return {
    request: syncedRequest,
    viewerRole,
  };
}

export async function getShareSummaryRequest(requestId: string) {
  return getRequestById(requestId);
}

export async function getCreatedRequestForUser(
  requestId: string | undefined,
  user: UserIdentity,
) {
  if (!requestId) {
    return null;
  }

  const result = await getRequestDetailReadResult(requestId, user);

  if (!result || result.viewerRole !== "sender") {
    return null;
  }

  return result.request;
}

export function getRequestPageAlerts(
  searchParams: RequestRouteSearchParams,
) {
  return {
    requestError: readStringParam(searchParams.requestError),
    statusMessage: readStatusMessage(
      readStringParam(searchParams.updatedStatus),
    ),
  };
}
