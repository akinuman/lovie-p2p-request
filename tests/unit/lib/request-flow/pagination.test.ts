import { describe, expect, it } from "vitest";

import {
  decodeDashboardCursor,
  encodeDashboardCursor,
  getNextDashboardCursor,
  resolveDashboardPageSize,
} from "@/use-cases/dashboard-pagination";

describe("dashboard pagination helpers", () => {
  it("round-trips dashboard cursors", () => {
    const cursor = encodeDashboardCursor({
      createdAt: "2026-04-10T10:00:00.000Z",
      id: "request-123",
    });

    expect(decodeDashboardCursor(cursor)).toEqual({
      createdAt: "2026-04-10T10:00:00.000Z",
      id: "request-123",
    });
  });

  it("clamps invalid or oversized page sizes", () => {
    expect(resolveDashboardPageSize()).toBe(10);
    expect(resolveDashboardPageSize(0)).toBe(10);
    expect(resolveDashboardPageSize(999)).toBe(25);
  });

  it("builds the next cursor from the last item in the page", () => {
    const cursor = getNextDashboardCursor([
      {
        createdAt: new Date("2026-04-10T10:00:00.000Z"),
        id: "request-123",
      },
      {
        createdAt: new Date("2026-04-09T10:00:00.000Z"),
        id: "request-122",
      },
    ]);

    expect(cursor).not.toBeNull();
    expect(decodeDashboardCursor(cursor as string)).toEqual({
      createdAt: "2026-04-09T10:00:00.000Z",
      id: "request-122",
    });
  });
});
