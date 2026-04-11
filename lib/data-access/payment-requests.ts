import type {
  NewPaymentRequest,
  PaymentRequest,
  RequestStatus,
  User,
} from "@/drizzle/schema";

import { and, desc, eq, ilike, lt, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { paymentRequests, users } from "@/drizzle/schema";
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

const senderUsers = alias(users, "payment_request_sender");
const recipientMatchedUsers = alias(users, "payment_request_recipient_match");

function mapPaymentRequestRecord(row: {
  paymentRequest: PaymentRequest;
  recipientMatchedUser: User | null;
  sender: User;
}): PaymentRequestRecord {
  return {
    ...row.paymentRequest,
    recipientMatchedUser: row.recipientMatchedUser,
    sender: row.sender,
  };
}

function buildCursorWhereClause(cursor?: string) {
  if (!cursor) {
    return undefined;
  }

  const decodedCursor = decodeDashboardCursor(cursor);

  if (!decodedCursor) {
    return undefined;
  }

  const cursorCreatedAt = new Date(decodedCursor.createdAt);

  return or(
    lt(paymentRequests.createdAt, cursorCreatedAt),
    and(
      eq(paymentRequests.createdAt, cursorCreatedAt),
      lt(paymentRequests.id, decodedCursor.id),
    ),
  );
}

function buildOutgoingSearchWhereClause(search?: string) {
  if (!search) {
    return undefined;
  }

  const pattern = `%${search}%`;

  return or(
    ilike(paymentRequests.id, pattern),
    ilike(paymentRequests.note, pattern),
    ilike(paymentRequests.recipientContactValue, pattern),
  );
}

function buildIncomingSearchWhereClause(search?: string) {
  if (!search) {
    return undefined;
  }

  const pattern = `%${search}%`;

  return or(
    ilike(paymentRequests.id, pattern),
    ilike(paymentRequests.note, pattern),
    ilike(senderUsers.email, pattern),
  );
}

function buildIncomingScopeWhereClause(user: IncomingRequestScope) {
  const scopeClauses = [
    eq(paymentRequests.recipientMatchedUserId, user.id),
    and(
      eq(paymentRequests.recipientContactType, "email"),
      eq(paymentRequests.recipientContactValue, normalizeEmail(user.email)),
    ),
  ];

  const normalizedPhone = user.phone ? normalizePhone(user.phone) : null;

  if (normalizedPhone) {
    scopeClauses.push(
      and(
        eq(paymentRequests.recipientContactType, "phone"),
        eq(paymentRequests.recipientContactValue, normalizedPhone),
      ),
    );
  }

  return or(...scopeClauses);
}

export async function listOutgoingPaymentRequests(userId: string) {
  const rows = await db
    .select({
      paymentRequest: paymentRequests,
      recipientMatchedUser: recipientMatchedUsers,
      sender: senderUsers,
    })
    .from(paymentRequests)
    .innerJoin(senderUsers, eq(paymentRequests.senderUserId, senderUsers.id))
    .leftJoin(
      recipientMatchedUsers,
      eq(paymentRequests.recipientMatchedUserId, recipientMatchedUsers.id),
    )
    .where(eq(paymentRequests.senderUserId, userId))
    .orderBy(desc(paymentRequests.createdAt), desc(paymentRequests.id));

  return rows.map(mapPaymentRequestRecord);
}

export async function listIncomingPaymentRequests(user: IncomingRequestScope) {
  const rows = await db
    .select({
      paymentRequest: paymentRequests,
      recipientMatchedUser: recipientMatchedUsers,
      sender: senderUsers,
    })
    .from(paymentRequests)
    .innerJoin(senderUsers, eq(paymentRequests.senderUserId, senderUsers.id))
    .leftJoin(
      recipientMatchedUsers,
      eq(paymentRequests.recipientMatchedUserId, recipientMatchedUsers.id),
    )
    .where(buildIncomingScopeWhereClause(user))
    .orderBy(desc(paymentRequests.createdAt), desc(paymentRequests.id));

  return rows.map(mapPaymentRequestRecord);
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
  const pageSize = resolveDashboardPageSize(normalizedQuery.limit);
  const rows = await db
    .select({
      paymentRequest: paymentRequests,
      recipientMatchedUser: recipientMatchedUsers,
      sender: senderUsers,
    })
    .from(paymentRequests)
    .innerJoin(senderUsers, eq(paymentRequests.senderUserId, senderUsers.id))
    .leftJoin(
      recipientMatchedUsers,
      eq(paymentRequests.recipientMatchedUserId, recipientMatchedUsers.id),
    )
    .where(
      and(
        eq(paymentRequests.senderUserId, userId),
        normalizedQuery.status
          ? eq(paymentRequests.status, normalizedQuery.status)
          : undefined,
        buildOutgoingSearchWhereClause(normalizedQuery.q),
        buildCursorWhereClause(normalizedQuery.cursor),
      ),
    )
    .orderBy(desc(paymentRequests.createdAt), desc(paymentRequests.id))
    .limit(pageSize + 1);
  const records = rows.map(mapPaymentRequestRecord);
  const items = records.slice(0, pageSize);

  return {
    hasMore: records.length > pageSize,
    items,
    nextCursor: records.length > pageSize ? getNextDashboardCursor(items) : null,
  };
}

export async function listIncomingPaymentRequestsPage(
  user: IncomingRequestScope,
  query: PaginatedRequestQuery = {},
) {
  const normalizedQuery = normalizeDashboardQueryState(query);
  const pageSize = resolveDashboardPageSize(normalizedQuery.limit);
  const rows = await db
    .select({
      paymentRequest: paymentRequests,
      recipientMatchedUser: recipientMatchedUsers,
      sender: senderUsers,
    })
    .from(paymentRequests)
    .innerJoin(senderUsers, eq(paymentRequests.senderUserId, senderUsers.id))
    .leftJoin(
      recipientMatchedUsers,
      eq(paymentRequests.recipientMatchedUserId, recipientMatchedUsers.id),
    )
    .where(
      and(
        buildIncomingScopeWhereClause(user),
        normalizedQuery.status
          ? eq(paymentRequests.status, normalizedQuery.status)
          : undefined,
        buildIncomingSearchWhereClause(normalizedQuery.q),
        buildCursorWhereClause(normalizedQuery.cursor),
      ),
    )
    .orderBy(desc(paymentRequests.createdAt), desc(paymentRequests.id))
    .limit(pageSize + 1);
  const records = rows.map(mapPaymentRequestRecord);
  const items = records.slice(0, pageSize);

  return {
    hasMore: records.length > pageSize,
    items,
    nextCursor: records.length > pageSize ? getNextDashboardCursor(items) : null,
  };
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
  const recipientMatchUpdate =
    input.actorUserId &&
    (input.status === "Declined" || input.status === "Paid")
      ? {
          recipientMatchedUserId: input.actorUserId,
        }
      : {};

  return updatePaymentRequestRecord(input.requestId, {
    ...statusSpecificValues,
    lastStatusChangedAt: now,
    ...recipientMatchUpdate,
    status: input.status,
    updatedAt: now,
  });
}
