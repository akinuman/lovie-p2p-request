import type { PaginatedRequestQuery, RequestPageResult } from "@/lib/data-access/payment-requests";

export interface DashboardRequestCard {
  id: string;
}

// Phase 1 scaffold: Phase 2 will compose paginated dashboard reads here.
export async function getDashboardRequestPage(
  query: PaginatedRequestQuery,
): Promise<RequestPageResult<DashboardRequestCard>> {
  void query;
  throw new Error("getDashboardRequestPage is not implemented yet.");
}
