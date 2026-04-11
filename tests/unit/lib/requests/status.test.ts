import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/use-cases/requests/request-expiry", () => ({
  isRequestExpired: (expiresAt: Date, now = new Date()) =>
    now.getTime() >= expiresAt.getTime(),
}));

const {
  getRequestActionGuardMessage,
} = await import("@/lib/use-cases/requests/request-status");

describe("getRequestActionGuardMessage", () => {
  it("allows the matched recipient to resolve a pending request", () => {
    expect(
      getRequestActionGuardMessage("pay", {
        expiresAt: new Date(Date.now() + 60_000),
        status: "Pending",
        viewerRole: "recipient",
      }),
    ).toBeNull();
  });

  it("blocks non-recipients from paying", () => {
    expect(
      getRequestActionGuardMessage("pay", {
        expiresAt: new Date(Date.now() + 60_000),
        status: "Pending",
        viewerRole: "sender",
      }),
    ).toBe("Only the intended recipient can pay this request.");
  });

  it("blocks expired requests from being paid", () => {
    expect(
      getRequestActionGuardMessage("pay", {
        expiresAt: new Date(Date.now() - 1_000),
        now: new Date(),
        status: "Pending",
        viewerRole: "recipient",
      }),
    ).toBe("This request has expired and can’t be paid.");
  });

  it("blocks terminal requests from being declined", () => {
    expect(
      getRequestActionGuardMessage("decline", {
        expiresAt: new Date(Date.now() + 60_000),
        status: "Paid",
        viewerRole: "recipient",
      }),
    ).toBe("Only pending requests can be declined.");
  });

  it("blocks recipients from cancelling sender-owned requests", () => {
    expect(
      getRequestActionGuardMessage("cancel", {
        expiresAt: new Date(Date.now() + 60_000),
        status: "Pending",
        viewerRole: "recipient",
      }),
    ).toBe("Only the sender can cancel this request.");
  });
});
