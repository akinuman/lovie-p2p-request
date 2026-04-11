import type {
  IncomingRequestScope,
  PaymentRequestPageQuery,
  PaymentRequestRecord,
  RequestPageResult,
} from "@/data-access/payment-requests";

import {
  listIncomingPaymentRequestsPage,
  listOutgoingPaymentRequestsPage,
} from "@/data-access/payment-requests";
import {
  decodeDashboardCursor,
  getNextDashboardCursor,
} from "@/use-cases/dashboard-pagination";
import {
  buildDashboardCurrentPath,
  parseDashboardQueryState,
  type DashboardQueryState,
} from "@/use-cases/dashboard-query";
import { buildRequestPresentation } from "@/use-cases/present-request";
import { syncExpiredRequest } from "@/use-cases/request-expiry";

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

type RequestRouteSearchParams = Record<string, string | string[] | undefined>;
type DashboardVariant = "incoming" | "outgoing";

export interface DashboardPageReadResult {
  createdRequestId?: string;
  currentPath: string;
  filters: DashboardQueryState;
  initialPage: DashboardRequestPagePayload;
  requestError?: string;
  statusMessage: string | null;
  updatedRequestId?: string;
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

function buildPaymentRequestPageQuery(
  query: DashboardQueryState,
): PaymentRequestPageQuery {
  const decodedCursor = query.cursor
    ? decodeDashboardCursor(query.cursor)
    : null;

  return {
    after: decodedCursor
      ? {
          createdAt: new Date(decodedCursor.createdAt),
          id: decodedCursor.id,
        }
      : undefined,
    limit: query.limit ?? 10,
    q: query.q,
    status: query.status,
  };
}

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
  query: DashboardQueryState,
): Promise<RequestPageResult<DashboardRequestCard>> {
  const page = await listOutgoingPaymentRequestsPage(
    userId,
    buildPaymentRequestPageQuery(query),
  );
  const items = await Promise.all(page.items.map(syncExpiredRecord));

  return {
    hasMore: page.hasMore,
    items: items.map(buildDashboardRequestCard),
    nextCursor: page.hasMore ? getNextDashboardCursor(items) : null,
  };
}

export async function getIncomingDashboardRequestPage(
  user: IncomingRequestScope,
  query: DashboardQueryState,
): Promise<RequestPageResult<DashboardRequestCard>> {
  const page = await listIncomingPaymentRequestsPage(
    user,
    buildPaymentRequestPageQuery(query),
  );
  const items = await Promise.all(page.items.map(syncExpiredRecord));

  return {
    hasMore: page.hasMore,
    items: items.map(buildDashboardRequestCard),
    nextCursor: page.hasMore ? getNextDashboardCursor(items) : null,
  };
}

export async function getDashboardRequestPage(
  query: DashboardQueryState & {
    user: IncomingRequestScope;
    variant: "incoming" | "outgoing";
  },
): Promise<RequestPageResult<DashboardRequestCard>> {
  if (query.variant === "incoming") {
    return getIncomingDashboardRequestPage(query.user, query);
  }

  return getOutgoingDashboardRequestPage(query.user.id, query);
}

export async function getDashboardPagePayloadForUser(input: {
  searchParams: RequestRouteSearchParams;
  user: IncomingRequestScope;
  variant: DashboardVariant;
}) {
  const filters = parseDashboardQueryState(input.searchParams);

  return serializeDashboardRequestPage(
    await getDashboardRequestPage({
      ...filters,
      user: input.user,
      variant: input.variant,
    }),
  );
}

export async function getDashboardPageReadResult(input: {
  searchParams: RequestRouteSearchParams;
  user: IncomingRequestScope;
  variant: DashboardVariant;
}): Promise<DashboardPageReadResult> {
  const filters = parseDashboardQueryState(input.searchParams);

  return {
    createdRequestId:
      input.variant === "outgoing"
        ? readStringParam(input.searchParams.created)
        : undefined,
    currentPath: buildDashboardCurrentPath(input.variant, filters),
    filters,
    initialPage: await getDashboardPagePayloadForUser(input),
    requestError: readStringParam(input.searchParams.requestError),
    statusMessage: readStatusMessage(
      readStringParam(input.searchParams.updatedStatus),
    ),
    updatedRequestId: readStringParam(input.searchParams.updated),
  };
}
