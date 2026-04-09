import {
  type PaymentRequest,
  type RequestStatus,
  type User,
} from "@/drizzle/schema";

import { getRequestViewerRole } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { syncExpiredRequest } from "@/lib/requests/expiry";
import type { DashboardFilterInput } from "@/lib/validation/requests";

export type PaymentRequestRecord = PaymentRequest & {
  recipientMatchedUser: User | null;
  sender: User;
};
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

async function syncExpiredRequests(requests: PaymentRequestRecord[]) {
  return Promise.all(requests.map((request) => syncExpiredRecord(request)));
}

async function getRequestRecordByIdRaw(requestId: string) {
  const request = await db.query.paymentRequests.findFirst({
    where: (table, { eq }) => eq(table.id, requestId),
    with: {
      recipientMatchedUser: true,
      sender: true,
    },
  });

  return request ?? null;
}

export async function findUserByNormalizedContact(
  contactType: "email" | "phone",
  contactValue: string,
) {
  if (contactType === "email") {
    return db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, contactValue),
    });
  }

  return db.query.users.findFirst({
    where: (table, { eq }) => eq(table.phone, contactValue),
  });
}

function matchesIncomingRecipient(
  request: PaymentRequestRecord,
  user: UserIdentity,
) {
  return getRequestViewerRole(user, request) === "recipient";
}

export async function getOutgoingRequestsForUser(
  userId: string,
  filters: DashboardFilterInput = {},
) {
  const status = buildStatusFilter(filters.status);
  const search = buildSearchTerm(filters.q);
  const requests = await db.query.paymentRequests.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    where: (table, { eq }) => eq(table.senderUserId, userId),
    with: {
      recipientMatchedUser: true,
      sender: true,
    },
  });

  const syncedRequests = await syncExpiredRequests(requests);

  return syncedRequests.filter(
    (request) =>
      (!status || request.status === status) &&
      matchesOutgoingSearch(request, search),
  );
}

export async function getIncomingRequestsForUser(
  user: UserIdentity,
  filters: DashboardFilterInput = {},
) {
  const status = buildStatusFilter(filters.status);
  const search = buildSearchTerm(filters.q);
  const requests = await db.query.paymentRequests.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    with: {
      recipientMatchedUser: true,
      sender: true,
    },
  });

  const syncedRequests = await syncExpiredRequests(requests);

  return syncedRequests.filter(
    (request) =>
      matchesIncomingRecipient(request, user) &&
      (!status || request.status === status) &&
      matchesIncomingSearch(request, search),
  );
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
