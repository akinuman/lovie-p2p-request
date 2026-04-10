export interface DashboardQueryState {
  q?: string;
  status?: string;
}

export function hasActiveDashboardQueryState(query: DashboardQueryState): boolean {
  return Boolean(query.q || query.status);
}

export function normalizeDashboardQueryState(
  query: DashboardQueryState,
): DashboardQueryState {
  const normalized: DashboardQueryState = {};

  if (query.q) {
    normalized.q = query.q.trim();
  }

  if (query.status) {
    normalized.status = query.status;
  }

  return normalized;
}
