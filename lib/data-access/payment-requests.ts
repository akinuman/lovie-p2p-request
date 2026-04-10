import type {
  NewPaymentRequest,
  PaymentRequest,
  RequestStatus,
  User,
} from "@/drizzle/schema";

import { eq } from "drizzle-orm";

import { paymentRequests } from "@/drizzle/schema";
import { db } from "@/lib/db";
import {
  decodeDashboardCursor,
  getNextDashboardCursor,
  resolveDashboardPageSize,
} from "@/lib/request-flow/pagination";
import {
  normalizeDashboardQueryState,
  type DashboardQueryState,
} from "@/lib/request-flow/query-state";
import { normalizeEmail, normalizePhone } from "@/lib/validation/requests";

export interface PaginatedRequestQuery extends DashboardQueryState {
  cursor?: string;
  limit?: number;
}

export interface RequestPageResult<TItem> {
  hasMore: boolean;
  items: TItem[];
  nextCursor: string | null;
}

export type PaymentRequestRecord = PaymentRequest & {
  recipientMatchedUser: User | null;
  sender: User;
};

interface IncomingRequestScope {
  email: string;
  id: string;
  phone?: string | null;
}

type CreatePaymentRequestRecordInput = Omit<NewPaymentRequest, "id">;

function compareRequestsByRecency(
  left: Pick<PaymentRequestRecord, "createdAt" | "id">,
  right: Pick<PaymentRequestRecord, "createdAt" | "id">,
) {
  const createdAtDifference =
    right.createdAt.getTime() - left.createdAt.getTime();

  if (createdAtDifference !== 0) {
    return createdAtDifference;
  }

  return right.id.localeCompare(left.id);
}

function matchesCursor(
  request: Pick<PaymentRequestRecord, "createdAt" | "id">,
  cursor?: string,
) {
  if (!cursor) {
    return true;
  }

  const decodedCursor = decodeDashboardCursor(cursor);

  if (!decodedCursor) {
    return true;
  }

  const cursorTime = new Date(decodedCursor.createdAt).getTime();
  const requestTime = request.createdAt.getTime();

  if (requestTime < cursorTime) {
    return true;
  }

  if (requestTime > cursorTime) {
    return false;
  }

  return request.id.localeCompare(decodedCursor.id) < 0;
}

function matchesOutgoingSearch(
  request: PaymentRequestRecord,
  search?: string,
) {
  if (!search) {
    return true;
  }

  return [
    request.id,
    request.note ?? "",
    request.recipientContactValue,
  ].some((value) => value.toLowerCase().includes(search));
}

function matchesIncomingSearch(
  request: PaymentRequestRecord,
  search?: string,
) {
  if (!search) {
    return true;
  }

  return [
    request.id,
    request.note ?? "",
    request.sender.email,
  ].some((value) => value.toLowerCase().includes(search));
}

function matchesIncomingScope(
  request: PaymentRequestRecord,
  user: IncomingRequestScope,
) {
  if (request.recipientMatchedUserId === user.id) {
    return true;
  }

  if (
    request.recipientContactType === "email" &&
    request.recipientContactValue === normalizeEmail(user.email)
  ) {
    return true;
  }

  const normalizedPhone = user.phone ? normalizePhone(user.phone) : null;

  return (
    request.recipientContactType === "phone" &&
    Boolean(normalizedPhone) &&
    request.recipientContactValue === normalizedPhone
  );
}

function paginateRequestRecords<TRecord extends PaymentRequestRecord>(
  requests: TRecord[],
  query: PaginatedRequestQuery,
): RequestPageResult<TRecord> {
  const normalizedQuery = normalizeDashboardQueryState(query);
  const pageSize = resolveDashboardPageSize(normalizedQuery.limit);
  const pageItems = requests
    .filter((request) => matchesCursor(request, normalizedQuery.cursor))
    .slice(0, pageSize + 1);
  const items = pageItems.slice(0, pageSize);

  return {
    hasMore: pageItems.length > pageSize,
    items,
    nextCursor:
      pageItems.length > pageSize ? getNextDashboardCursor(items) : null,
  };
}

async function listScopedPaymentRequests(
  predicate: (request: PaymentRequestRecord) => boolean,
) {
  const requests = await listPaymentRequestRecords();

  return requests.filter(predicate).sort(compareRequestsByRecency);
}

export async function listPaymentRequestRecords() {
  return db.query.paymentRequests.findMany({
    orderBy: (table, { desc }) => [desc(table.createdAt), desc(table.id)],
    with: {
      recipientMatchedUser: true,
      sender: true,
    },
  });
}

export async function listOutgoingPaymentRequests(userId: string) {
  return listScopedPaymentRequests((request) => request.senderUserId === userId);
}

export async function listIncomingPaymentRequests(user: IncomingRequestScope) {
  return listScopedPaymentRequests((request) =>
    matchesIncomingScope(request, user),
  );
}

export async function listPaginatedPaymentRequests(
  query: PaginatedRequestQuery,
): Promise<RequestPageResult<PaymentRequestRecord>> {
  const requests = await listScopedPaymentRequests(() => true);
  return paginateRequestRecords(requests, query);
}

export async function findMatchedRecipientUser(
  contactType: "email" | "phone",
  contactValue: string,
) {
  if (contactType === "email") {
    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, normalizeEmail(contactValue)),
    });

    return user ?? null;
  }

  const normalizedPhone = normalizePhone(contactValue);

  if (!normalizedPhone) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.phone, normalizedPhone),
  });

  return user ?? null;
}

export async function findPaymentRequestById(requestId: string) {
  const request = await db.query.paymentRequests.findFirst({
    where: (table, { eq }) => eq(table.id, requestId),
    with: {
      recipientMatchedUser: true,
      sender: true,
    },
  });

  return request ?? null;
}

export async function findPaymentRequestByIdOrThrow(requestId: string) {
  const request = await findPaymentRequestById(requestId);

  if (!request) {
    throw new Error("Request not found.");
  }

  return request;
}

export async function listOutgoingPaymentRequestsPage(
  userId: string,
  query: PaginatedRequestQuery = {},
) {
  const normalizedQuery = normalizeDashboardQueryState(query);
  const search = normalizedQuery.q?.toLowerCase();
  const requests = await listScopedPaymentRequests(
    (request) =>
      request.senderUserId === userId &&
      (!normalizedQuery.status || request.status === normalizedQuery.status) &&
      matchesOutgoingSearch(request, search),
  );

  return paginateRequestRecords(requests, normalizedQuery);
}

export async function listIncomingPaymentRequestsPage(
  user: IncomingRequestScope,
  query: PaginatedRequestQuery = {},
) {
  const normalizedQuery = normalizeDashboardQueryState(query);
  const search = normalizedQuery.q?.toLowerCase();
  const requests = await listScopedPaymentRequests(
    (request) =>
      matchesIncomingScope(request, user) &&
      (!normalizedQuery.status || request.status === normalizedQuery.status) &&
      matchesIncomingSearch(request, search),
  );

  return paginateRequestRecords(requests, normalizedQuery);
}

export async function createPaymentRequestRecord(
  input: CreatePaymentRequestRecordInput,
) {
  const [createdRequest] = await db
    .insert(paymentRequests)
    .values(input)
    .returning({
      id: paymentRequests.id,
    });

  return createdRequest;
}

export async function updatePaymentRequestRecord(
  requestId: string,
  values: Partial<Pick<
    PaymentRequest,
    | "cancelledAt"
    | "declinedAt"
    | "lastStatusChangedAt"
    | "paidAt"
    | "recipientMatchedUserId"
    | "status"
    | "updatedAt"
  >>,
) {
  const [updatedRequest] = await db
    .update(paymentRequests)
    .set(values)
    .where(eq(paymentRequests.id, requestId))
    .returning({
      id: paymentRequests.id,
    });

  return updatedRequest ?? null;
}

export async function mutatePaymentRequest(input: {
  requestId: string;
  status: RequestStatus;
  actorUserId?: string;
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
        : input.status === "Paid"
          ? {
              paidAt: now,
            }
          : {};

  return updatePaymentRequestRecord(input.requestId, {
    ...statusSpecificValues,
    lastStatusChangedAt: now,
    recipientMatchedUserId: input.actorUserId,
    status: input.status,
    updatedAt: now,
  });
}
