import type { RequestStatus } from "@/drizzle/schema";

import {
  DEFAULT_DASHBOARD_PAGE_SIZE,
  resolveDashboardPageSize,
} from "@/use-cases/dashboard-pagination";
import { dashboardFilterSchema } from "@/lib/validation/requests";
import type { DashboardFilterInput } from "@/lib/validation/requests";

export interface DashboardQueryState {
  cursor?: string;
  limit?: number;
  q?: string;
  status?: RequestStatus;
}

export function hasActiveDashboardQueryState(query: DashboardQueryState): boolean {
  return Boolean(query.q || query.status);
}

export function normalizeDashboardQueryState(
  query: DashboardQueryState,
): DashboardQueryState {
  const normalized: DashboardQueryState = {};

  if (query.q) {
    const trimmedQuery = query.q.trim();

    if (trimmedQuery) {
      normalized.q = trimmedQuery;
    }
  }

  if (query.status) {
    normalized.status = query.status;
  }

  if (query.cursor) {
    normalized.cursor = query.cursor;
  }

  normalized.limit = resolveDashboardPageSize(
    query.limit ?? DEFAULT_DASHBOARD_PAGE_SIZE,
  );

  return normalized;
}

function readSearchParamValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

export function parseDashboardQueryState(
  searchParams: Record<string, string | string[] | undefined>,
): DashboardQueryState {
  const parsed = dashboardFilterSchema.safeParse({
    cursor: readSearchParamValue(searchParams.cursor),
    limit: readSearchParamValue(searchParams.limit),
    q: readSearchParamValue(searchParams.q),
    status: readSearchParamValue(searchParams.status),
  });

  if (!parsed.success) {
    return normalizeDashboardQueryState({});
  }

  return normalizeDashboardQueryState(parsed.data);
}

export function buildDashboardFilterHref(
  basePath: string,
  filters: DashboardFilterInput,
) {
  const url = new URL(basePath, "http://localhost");

  if (filters.q) {
    url.searchParams.set("q", filters.q);
  }

  if (filters.status) {
    url.searchParams.set("status", filters.status);
  }

  return `${url.pathname}${url.search}`;
}
