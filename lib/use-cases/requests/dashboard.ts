import type {
  PaginatedRequestQuery,
  PaymentRequestRecord,
  RequestPageResult,
} from "@/lib/data-access/payment-requests";

import type { User } from "@/drizzle/schema";

import {
  listIncomingPaymentRequestsPage,
  listOutgoingPaymentRequestsPage,
} from "@/lib/data-access/payment-requests";
import { syncExpiredRequest } from "@/lib/requests/expiry";
import { buildRequestPresentation } from "@/lib/use-cases/requests/presentation";

export interface DashboardRequestCard {
  amountCents: number;
  createdAt: Date;
  currencyCode: string;
  expiresAt: Date;
  formattedAmount: string;
  id: string;
  notePreview: string | null;
  recipientLabel?: string;
  senderLabel?: string;
  shareUrl?: string;
  status: PaymentRequestRecord["status"];
}

export interface DashboardRequestCardPayload
  extends Omit<DashboardRequestCard, "createdAt" | "expiresAt"> {
  createdAt: string;
  expiresAt: string;
}

export type DashboardRequestPagePayload =
  RequestPageResult<DashboardRequestCardPayload>;

async function syncExpiredRecord(request: PaymentRequestRecord) {
  const syncedRequest = await syncExpiredRequest(request);

  if (syncedRequest.status === request.status) {
    return request;
  }

  return {
    ...request,
    ...syncedRequest,
  };
}

function buildDashboardRequestCard(
  request: PaymentRequestRecord,
): DashboardRequestCard {
  return buildRequestPresentation({
    amountCents: request.amountCents,
    createdAt: request.createdAt,
    currencyCode: request.currencyCode,
    expiresAt: request.expiresAt,
    id: request.id,
    note: request.note,
    recipientLabel: request.recipientContactValue,
    senderLabel: request.sender.email,
    shareUrl: `/r/${request.id}`,
    status: request.status,
  });
}

export function serializeDashboardRequestCard(
  request: DashboardRequestCard,
): DashboardRequestCardPayload {
  return {
    ...request,
    createdAt: request.createdAt.toISOString(),
    expiresAt: request.expiresAt.toISOString(),
  };
}

export function serializeDashboardRequestPage(
  page: RequestPageResult<DashboardRequestCard>,
): DashboardRequestPagePayload {
  return {
    ...page,
    items: page.items.map(serializeDashboardRequestCard),
  };
}

export async function getOutgoingDashboardRequestPage(
  userId: string,
  query: PaginatedRequestQuery,
): Promise<RequestPageResult<DashboardRequestCard>> {
  const page = await listOutgoingPaymentRequestsPage(userId, query);
  const items = await Promise.all(page.items.map(syncExpiredRecord));

  return {
    ...page,
    items: items.map(buildDashboardRequestCard),
  };
}

export async function getIncomingDashboardRequestPage(
  user: Pick<User, "email" | "id" | "phone">,
  query: PaginatedRequestQuery,
): Promise<RequestPageResult<DashboardRequestCard>> {
  const page = await listIncomingPaymentRequestsPage(user, query);
  const items = await Promise.all(page.items.map(syncExpiredRecord));

  return {
    ...page,
    items: items.map(buildDashboardRequestCard),
  };
}

export async function getDashboardRequestPage(
  query: PaginatedRequestQuery & {
    user: Pick<User, "email" | "id" | "phone">;
    variant: "incoming" | "outgoing";
  },
): Promise<RequestPageResult<DashboardRequestCard>> {
  if (query.variant === "incoming") {
    return getIncomingDashboardRequestPage(query.user, query);
  }

  return getOutgoingDashboardRequestPage(query.user.id, query);
}
