import { describe, expect, it } from "vitest";

import {
  hasActiveDashboardQueryState,
  normalizeDashboardQueryState,
  parseDashboardQueryState,
} from "@/lib/request-flow/query-state";

describe("normalizeDashboardQueryState", () => {
  it("trims search text and applies the default page size", () => {
    expect(
      normalizeDashboardQueryState({
        q: "  dinner  ",
      }),
    ).toEqual({
      limit: 10,
      q: "dinner",
    });
  });

  it("preserves cursor and status while clamping page size", () => {
    expect(
      normalizeDashboardQueryState({
        cursor: "cursor-123",
        limit: 999,
        status: "Pending",
      }),
    ).toEqual({
      cursor: "cursor-123",
      limit: 25,
      status: "Pending",
    });
  });
});

describe("hasActiveDashboardQueryState", () => {
  it("returns true only when search or filters are active", () => {
    expect(hasActiveDashboardQueryState({})).toBe(false);
    expect(hasActiveDashboardQueryState({ q: "rent" })).toBe(true);
    expect(hasActiveDashboardQueryState({ status: "Paid" })).toBe(true);
  });
});

describe("parseDashboardQueryState", () => {
  it("parses url-owned search params into normalized state", () => {
    expect(
      parseDashboardQueryState({
        cursor: "cursor-abc",
        limit: "15",
        q: "  brunch  ",
        status: "Pending",
      }),
    ).toEqual({
      cursor: "cursor-abc",
      limit: 15,
      q: "brunch",
      status: "Pending",
    });
  });

  it("falls back to the default query state when parsing fails", () => {
    expect(
      parseDashboardQueryState({
        limit: "0",
        status: "not-a-status",
      }),
    ).toEqual({
      limit: 10,
    });
  });
});
