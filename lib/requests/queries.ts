import { Prisma, RequestStatus, type PaymentRequest } from "@prisma/client";

import { db } from "@/lib/db";
import { syncExpiredRequest } from "@/lib/requests/expiry";
import type { DashboardFilterInput } from "@/lib/validation/requests";

function buildSearchFilter(search?: string) {
  if (!search) {
    return undefined;
  }

  return {
    contains: search,
    mode: Prisma.QueryMode.insensitive,
  } satisfies Prisma.StringFilter;
}

function buildStatusFilter(status?: DashboardFilterInput["status"]) {
  if (!status) {
    return undefined;
  }

  const statusMap = {
    Cancelled: RequestStatus.CANCELLED,
    Declined: RequestStatus.DECLINED,
    Expired: RequestStatus.EXPIRED,
    Paid: RequestStatus.PAID,
    Pending: RequestStatus.PENDING,
  } as const;

  return statusMap[status];
}

async function syncExpiredRequests<T extends PaymentRequest>(requests: T[]) {
  return Promise.all(requests.map((request) => syncExpiredRequest(db, request)));
}

export async function findUserByNormalizedContact(
  contactType: "email" | "phone",
  contactValue: string,
) {
  if (contactType === "email") {
    return db.user.findUnique({
      where: { email: contactValue },
    });
  }

  return db.user.findUnique({
    where: { phone: contactValue },
  });
}

export async function getOutgoingRequestsForUser(
  userId: string,
  filters: DashboardFilterInput = {},
) {
  const search = buildSearchFilter(filters.q);
  const status = buildStatusFilter(filters.status);
  const requests = await db.paymentRequest.findMany({
    where: {
      senderUserId: userId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { id: search },
              { note: search },
              { recipientContactValue: search },
            ],
          }
        : {}),
    },
    include: {
      recipientMatchedUser: true,
      sender: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return syncExpiredRequests(requests);
}

export async function getIncomingRequestsForUser(
  userId: string,
  filters: DashboardFilterInput = {},
) {
  const search = buildSearchFilter(filters.q);
  const status = buildStatusFilter(filters.status);
  const requests = await db.paymentRequest.findMany({
    where: {
      recipientMatchedUserId: userId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { id: search },
              { note: search },
              { sender: { email: search } },
            ],
          }
        : {}),
    },
    include: {
      recipientMatchedUser: true,
      sender: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return syncExpiredRequests(requests);
}

export async function getRequestById(requestId: string) {
  const request = await db.paymentRequest.findUnique({
    where: { id: requestId },
    include: {
      recipientMatchedUser: true,
      sender: true,
    },
  });

  if (!request) {
    return null;
  }

  return syncExpiredRequest(db, request);
}

export async function getRequestForUser(requestId: string, userId: string) {
  const request = await getRequestById(requestId);

  if (!request) {
    return null;
  }

  if (
    request.senderUserId !== userId &&
    request.recipientMatchedUserId !== userId
  ) {
    return null;
  }

  return request;
}

export async function getShareSummaryRequest(requestId: string) {
  return getRequestById(requestId);
}
