export const DEFAULT_DASHBOARD_PAGE_SIZE = 10;

export interface DashboardCursorPayload {
  createdAt: string;
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
