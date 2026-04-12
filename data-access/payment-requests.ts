import type {
  NewPaymentRequest,
  PaymentRequest,
  RequestStatus,
  User,
} from "@/drizzle/schema";

import { and, desc, eq, gt, ilike, lt, lte, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { paymentRequests, users } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { normalizeEmail, normalizePhone } from "@/lib/validation/requests";

export interface PaymentRequestPageQuery {
  after?: {
    createdAt: Date;
    id: string;
  };
  limit: number;
  q?: string;
  status?: RequestStatus;
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

export interface IncomingRequestScope {
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

function buildCursorWhereClause(after?: { createdAt: Date; id: string }) {
  if (!after) {
    return undefined;
  }

  return or(
    lt(paymentRequests.createdAt, after.createdAt),
    and(
      eq(paymentRequests.createdAt, after.createdAt),
      lt(paymentRequests.id, after.id),
    ),
  );
}

function buildStatusWhereClause(
  status: RequestStatus | undefined,
  now: Date,
) {
  if (!status) {
    return undefined;
  }

  // Pending rows whose expiresAt has passed are still stored as Pending until
  // syncExpiredRequest mutates them. Filter them in/out here so the result set
  // matches the user's intent without waiting for the lazy sync.
  if (status === "Pending") {
    return and(
      eq(paymentRequests.status, "Pending"),
      gt(paymentRequests.expiresAt, now),
    );
  }

  if (status === "Expired") {
    return or(
      eq(paymentRequests.status, "Expired"),
      and(
        eq(paymentRequests.status, "Pending"),
        lte(paymentRequests.expiresAt, now),
      ),
    );
  }

  return eq(paymentRequests.status, status);
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

function buildRequestPageResult(
  rows: Array<{
    paymentRequest: PaymentRequest;
    recipientMatchedUser: User | null;
    sender: User;
  }>,
  limit: number,
): RequestPageResult<PaymentRequestRecord> {
  const pageSize = Math.max(1, Math.trunc(limit));
  const records = rows.map(mapPaymentRequestRecord);

  return {
    hasMore: records.length > pageSize,
    items: records.slice(0, pageSize),
    nextCursor: null,
  };
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

export async function listOutgoingPaymentRequestsPage(
  userId: string,
  query: PaymentRequestPageQuery,
) {
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
        buildStatusWhereClause(query.status, new Date()),
        buildOutgoingSearchWhereClause(query.q),
        buildCursorWhereClause(query.after),
      ),
    )
    .orderBy(desc(paymentRequests.createdAt), desc(paymentRequests.id))
    .limit(Math.max(1, Math.trunc(query.limit)) + 1);

  return buildRequestPageResult(rows, query.limit);
}

export async function listIncomingPaymentRequestsPage(
  user: IncomingRequestScope,
  query: PaymentRequestPageQuery,
) {
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
        buildStatusWhereClause(query.status, new Date()),
        buildIncomingSearchWhereClause(query.q),
        buildCursorWhereClause(query.after),
      ),
    )
    .orderBy(desc(paymentRequests.createdAt), desc(paymentRequests.id))
    .limit(Math.max(1, Math.trunc(query.limit)) + 1);

  return buildRequestPageResult(rows, query.limit);
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

// Optimistic concurrency: callers pass expectedStatus so the UPDATE includes
// a WHERE status = ? guard. The database becomes the single arbiter of the
// state transition — only one concurrent mutation can win the race.
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
  expectedStatus?: RequestStatus,
) {
  const conditions = [eq(paymentRequests.id, requestId)];

  if (expectedStatus) {
    conditions.push(eq(paymentRequests.status, expectedStatus));
  }

  const [updatedRequest] = await db
    .update(paymentRequests)
    .set(values)
    .where(and(...conditions))
    .returning();

  return updatedRequest ?? null;
}
