import {
  type User,
} from "@/drizzle/schema";

import { getRequestViewerRole } from "@/lib/auth/current-user";
import {
  findMatchedRecipientUser,
  findPaymentRequestById,
  type PaymentRequestRecord,
} from "@/lib/data-access/payment-requests";
import { syncExpiredRequest } from "@/lib/requests/expiry";

export type { PaymentRequestRecord } from "@/lib/data-access/payment-requests";

type UserIdentity = Pick<User, "email" | "id" | "phone">;

async function syncExpiredRecord(request: PaymentRequestRecord) {
  const syncedRequest = await syncExpiredRequest(request);

  if (syncedRequest.status === request.status) {
    return request;
  }

  const reloadedRequest = await getRequestRecordByIdRaw(request.id);

  if (!reloadedRequest) {
    throw new Error("Request not found.");
  }

  return reloadedRequest;
}

async function getRequestRecordByIdRaw(requestId: string) {
  return findPaymentRequestById(requestId);
}

export async function findUserByNormalizedContact(
  contactType: "email" | "phone",
  contactValue: string,
) {
  return findMatchedRecipientUser(contactType, contactValue);
}

export async function getRequestById(requestId: string) {
  const request = await getRequestRecordByIdRaw(requestId);

  if (!request) {
    return null;
  }

  return syncExpiredRecord(request);
}

export async function getRequestForUser(
  requestId: string,
  user: UserIdentity,
) {
  const request = await getRequestById(requestId);

  if (!request) {
    return null;
  }

  if (getRequestViewerRole(user, request) === "none") {
    return null;
  }

  return request;
}

export async function getShareSummaryRequest(requestId: string) {
  return getRequestById(requestId);
}
