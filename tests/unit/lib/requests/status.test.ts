import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/requests/expiry", () => ({
  isRequestExpired: (expiresAt: Date, now = new Date()) =>
    now.getTime() >= expiresAt.getTime(),
}));

const { getRecipientActionGuardMessage } = await import("@/lib/requests/status");

describe("getRecipientActionGuardMessage", () => {
  it("allows the matched recipient to resolve a pending request", () => {
    expect(
      getRecipientActionGuardMessage("pay", {
        expiresAt: new Date(Date.now() + 60_000),
        status: "Pending",
        viewerRole: "recipient",
      }),
    ).toBeNull();
  });

  it("blocks non-recipients from paying", () => {
    expect(
      getRecipientActionGuardMessage("pay", {
        expiresAt: new Date(Date.now() + 60_000),
        status: "Pending",
        viewerRole: "sender",
      }),
    ).toBe("Only the intended recipient can pay this request.");
  });

  it("blocks expired requests from being paid", () => {
    expect(
      getRecipientActionGuardMessage("pay", {
        expiresAt: new Date(Date.now() - 1_000),
        now: new Date(),
        status: "Pending",
        viewerRole: "recipient",
      }),
    ).toBe("This request has expired and can’t be paid.");
  });

  it("blocks terminal requests from being declined", () => {
    expect(
      getRecipientActionGuardMessage("decline", {
        expiresAt: new Date(Date.now() + 60_000),
        status: "Paid",
        viewerRole: "recipient",
      }),
    ).toBe("Only pending requests can be declined.");
  });
});
