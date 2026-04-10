import {
  type RequestStatus,
  type User,
} from "@/drizzle/schema";

import { getRequestViewerRole } from "@/lib/auth/current-user";
import {
  findMatchedRecipientUser,
  findPaymentRequestById,
  listIncomingPaymentRequests,
  listOutgoingPaymentRequests,
  type PaymentRequestRecord,
} from "@/lib/data-access/payment-requests";
import { syncExpiredRequest } from "@/lib/requests/expiry";
import type { DashboardFilterInput } from "@/lib/validation/requests";

export type { PaymentRequestRecord } from "@/lib/data-access/payment-requests";

type UserIdentity = Pick<User, "email" | "id" | "phone">;

function buildStatusFilter(status?: DashboardFilterInput["status"]) {
  if (!status) {
    return undefined;
  }

  const statusMap: Record<NonNullable<DashboardFilterInput["status"]>, RequestStatus> = {
    Cancelled: "Cancelled",
    Declined: "Declined",
    Expired: "Expired",
    Paid: "Paid",
    Pending: "Pending",
  };

  return statusMap[status];
}

function buildSearchTerm(search?: string) {
  return search?.trim().toLowerCase() || undefined;
}

function matchesOutgoingSearch(request: PaymentRequestRecord, search?: string) {
  if (!search) {
    return true;
  }

  return [
    request.id,
    request.note ?? "",
    request.recipientContactValue,
  ].some((value) => value.toLowerCase().includes(search));
}

function matchesIncomingSearch(request: PaymentRequestRecord, search?: string) {
  if (!search) {
    return true;
  }

  return [
    request.id,
    request.note ?? "",
    request.sender.email,
  ].some((value) => value.toLowerCase().includes(search));
}

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

async function syncExpiryForRecords(requests: PaymentRequestRecord[]) {
  return Promise.all(requests.map((request) => syncExpiredRecord(request)));
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

function matchesIncomingRecipient(
  request: PaymentRequestRecord,
  user: UserIdentity,
) {
  return getRequestViewerRole(user, request) === "recipient";
}

export function filterOutgoingRequests(
  requests: PaymentRequestRecord[],
  filters: DashboardFilterInput = {},
) {
  const status = buildStatusFilter(filters.status);
  const search = buildSearchTerm(filters.q);

  return requests.filter(
    (request) =>
      (!status || request.status === status) &&
      matchesOutgoingSearch(request, search),
  );
}

export function filterIncomingRequests(
  requests: PaymentRequestRecord[],
  user: UserIdentity,
  filters: DashboardFilterInput = {},
) {
  const status = buildStatusFilter(filters.status);
  const search = buildSearchTerm(filters.q);

  return requests.filter(
    (request) =>
      matchesIncomingRecipient(request, user) &&
      (!status || request.status === status) &&
      matchesIncomingSearch(request, search),
  );
}

export async function getOutgoingRequestsForUser(
  userId: string,
  filters: DashboardFilterInput = {},
) {
  const requests = await listOutgoingPaymentRequests(userId);
  const syncedRequests = await syncExpiryForRecords(requests);

  return filterOutgoingRequests(syncedRequests, filters);
}

export async function getIncomingRequestsForUser(
  user: UserIdentity,
  filters: DashboardFilterInput = {},
) {
  const requests = await listIncomingPaymentRequests(user);
  const syncedRequests = await syncExpiryForRecords(requests);

  return filterIncomingRequests(syncedRequests, user, filters);
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
