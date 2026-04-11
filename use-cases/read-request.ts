import type { RecipientContactType, RequestStatus, User } from "@/drizzle/schema";

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

export interface RequestDetailReadResult {
  request: PaymentRequestRecord;
  viewerRole: RequestViewerRole;
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

/**
 * Narrow DTO for the public share page.
 * Only fields safe for unauthenticated viewers — no PII, no internal IDs.
 */
export interface ShareSummaryDTO {
  id: string;
  amountCents: number;
  currencyCode: string;
  note: string | null;
  status: RequestStatus;
  expiresAt: Date;
  createdAt: Date;
  senderLabel: string;
  /**
   * Minimal fields to evaluate recipient-redirect on the server.
   * These are NOT serialized to the client — they stay in the RSC boundary.
   */
  _recipientMatch: {
    recipientContactType: RecipientContactType;
    recipientContactValue: string;
    recipientMatchedUserId: string | null;
    senderUserId: string;
  };
}

export async function getShareSummaryRequest(
  requestId: string,
): Promise<ShareSummaryDTO | null> {
  const request = await getRequestById(requestId);
  if (!request) return null;

  return {
    id: request.id,
    amountCents: request.amountCents,
    currencyCode: request.currencyCode,
    note: request.note,
    status: request.status,
    expiresAt: request.expiresAt,
    createdAt: request.createdAt,
    senderLabel: request.sender.email,
    _recipientMatch: {
      recipientContactType: request.recipientContactType,
      recipientContactValue: request.recipientContactValue,
      recipientMatchedUserId: request.recipientMatchedUserId,
      senderUserId: request.senderUserId,
    },
  };
}
