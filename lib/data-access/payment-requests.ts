export interface PaginatedRequestQuery {
  cursor?: string;
  limit?: number;
  q?: string;
  status?: string;
}

export interface RequestPageResult<TItem> {
  hasMore: boolean;
  items: TItem[];
  nextCursor: string | null;
}

// Phase 1 scaffold: Phase 2 will move concrete Drizzle reads and writes here.
export async function listPaginatedPaymentRequests<TItem>(
  query: PaginatedRequestQuery,
): Promise<RequestPageResult<TItem>> {
  void query;
  throw new Error("listPaginatedPaymentRequests is not implemented yet.");
}

// Phase 1 scaffold: Phase 2 will move concrete request CRUD operations here.
export async function mutatePaymentRequest(): Promise<never> {
  throw new Error("mutatePaymentRequest is not implemented yet.");
}
