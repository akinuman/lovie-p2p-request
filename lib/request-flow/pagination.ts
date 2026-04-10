export const DEFAULT_DASHBOARD_PAGE_SIZE = 10;
export const MAX_DASHBOARD_PAGE_SIZE = 25;

export interface DashboardCursorPayload {
  createdAt: string;
  id: string;
}

export interface CursorSortableRequest {
  createdAt: Date;
  id: string;
}

export function encodeDashboardCursor(payload: DashboardCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeDashboardCursor(cursor: string): DashboardCursorPayload | null {
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as Partial<DashboardCursorPayload>;

    if (typeof parsed.createdAt !== "string" || typeof parsed.id !== "string") {
      return null;
    }

    return {
      createdAt: parsed.createdAt,
      id: parsed.id,
    };
  } catch {
    return null;
  }
}

export function resolveDashboardPageSize(limit?: number): number {
  if (!limit || Number.isNaN(limit)) {
    return DEFAULT_DASHBOARD_PAGE_SIZE;
  }

  return Math.min(
    MAX_DASHBOARD_PAGE_SIZE,
    Math.max(1, Math.trunc(limit)),
  );
}

export function getNextDashboardCursor<TItem extends CursorSortableRequest>(
  items: TItem[],
): string | null {
  const lastItem = items.at(-1);

  if (!lastItem) {
    return null;
  }

  return encodeDashboardCursor({
    createdAt: lastItem.createdAt.toISOString(),
    id: lastItem.id,
  });
}
