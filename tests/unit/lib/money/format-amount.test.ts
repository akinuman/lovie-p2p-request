import { describe, expect, it } from "vitest";

import { formatAmountFromCents } from "@/lib/money/format-amount";

describe("formatAmountFromCents", () => {
  it("formats cents with the backend-provided currency code", () => {
    expect(formatAmountFromCents(2450, "USD")).toBe("$24.50");
    expect(formatAmountFromCents(2450, "eur")).toBe("€24.50");
  });

  it("falls back to the default backend currency", () => {
    expect(formatAmountFromCents(2500)).toBe("$25.00");
  });

  it("rejects non-integer cent values", () => {
    expect(() => formatAmountFromCents(24.5, "USD")).toThrow(
      "Amount cents must be an integer.",
    );
  });
});
