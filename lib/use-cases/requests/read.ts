import type { User } from "@/drizzle/schema";

import {
  getRequestViewerRole,
  type RequestViewerRole,
} from "@/lib/auth/current-user";
import {
  findPaymentRequestById,
  type PaymentRequestRecord,
} from "@/lib/data-access/payment-requests";
import {
  parseDashboardQueryState,
  type DashboardQueryState,
} from "@/lib/request-flow/query-state";
import { syncExpiredRequest } from "@/lib/requests/expiry";
import {
  getDashboardRequestPage,
  serializeDashboardRequestPage,
  type DashboardRequestPagePayload,
} from "@/lib/use-cases/requests/dashboard";

type UserIdentity = Pick<User, "email" | "id" | "phone">;
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

export interface RequestDetailReadResult {
  request: PaymentRequestRecord;
  viewerRole: RequestViewerRole;
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

function getDashboardBasePath(variant: DashboardVariant) {
  return variant === "incoming"
    ? "/dashboard/incoming"
    : "/dashboard/outgoing";
}

export function buildDashboardCurrentPath(
  variant: DashboardVariant,
  filters: DashboardQueryState,
) {
  const url = new URL(getDashboardBasePath(variant), "http://localhost");

  if (filters.q) {
    url.searchParams.set("q", filters.q);
  }

  if (filters.status) {
    url.searchParams.set("status", filters.status);
  }

  return `${url.pathname}${url.search}`;
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

export async function getDashboardPagePayloadForUser(input: {
  searchParams: RequestRouteSearchParams;
  user: UserIdentity;
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
  user: UserIdentity;
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

export async function getRequestDetailReadResult(
  requestId: string,
  user: UserIdentity,
): Promise<RequestDetailReadResult | null> {
  const request = await findPaymentRequestById(requestId);

  if (!request) {
    return null;
  }

  const syncedRequest = await syncRequestRecord(request);
  const viewerRole = getRequestViewerRole(user, syncedRequest);

  if (viewerRole === "none") {
    return null;
  }

  return {
    request: syncedRequest,
    viewerRole,
  };
}

export async function getCreatedRequestForUser(
  requestId: string | undefined,
  user: UserIdentity,
) {
  if (!requestId) {
    return null;
  }

  const result = await getRequestDetailReadResult(requestId, user);

  if (!result || result.viewerRole !== "sender") {
    return null;
  }

  return result.request;
}

export function getRequestPageAlerts(
  searchParams: RequestRouteSearchParams,
) {
  return {
    requestError: readStringParam(searchParams.requestError),
    statusMessage: readStatusMessage(
      readStringParam(searchParams.updatedStatus),
    ),
  };
}
