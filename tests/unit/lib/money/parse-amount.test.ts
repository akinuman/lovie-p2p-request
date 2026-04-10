import { describe, expect, it } from "vitest";

import { parseAmountToCents } from "@/lib/money/parse-amount";

describe("parseAmountToCents", () => {
  it("parses whole-dollar and decimal amounts into integer cents", () => {
    expect(parseAmountToCents("24")).toBe(2400);
    expect(parseAmountToCents("24.5")).toBe(2450);
    expect(parseAmountToCents("24.50")).toBe(2450);
  });

  it("rejects zero, blanks, and values with too many decimals", () => {
    expect(() => parseAmountToCents("0")).toThrow(
      "Amount must be greater than zero.",
    );
    expect(() => parseAmountToCents("")).toThrow(
      "Enter a valid amount with up to 2 decimal places.",
    );
    expect(() => parseAmountToCents("10.999")).toThrow(
      "Enter a valid amount with up to 2 decimal places.",
    );
  });

  it("rejects amounts above the 50,000 maximum", () => {
    expect(() => parseAmountToCents("50000.01")).toThrow(
      "Amount must be 50,000 or less.",
    );
  });
});
