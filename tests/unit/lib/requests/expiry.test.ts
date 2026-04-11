import { describe, expect, it, vi } from "vitest";

const updatePaymentRequestRecord = vi.fn();

vi.mock("@/data-access/payment-requests", () => ({
  updatePaymentRequestRecord,
}));

const {
  REQUEST_EXPIRY_MS,
  computeExpiresAt,
  shouldSyncExpiredRequest,
  syncExpiredRequest,
} = await import("@/use-cases/request-expiry");

describe("expiry helpers", () => {
  it("computes the expiry timestamp seven days from the source date", () => {
    const createdAt = new Date("2026-04-01T12:00:00.000Z");
    expect(computeExpiresAt(createdAt).getTime()).toBe(
      createdAt.getTime() + REQUEST_EXPIRY_MS,
    );
  });

  it("identifies overdue pending requests for synchronization", () => {
    expect(
      shouldSyncExpiredRequest({
        expiresAt: new Date(Date.now() - 60_000),
        status: "Pending",
      }),
    ).toBe(true);

    expect(
      shouldSyncExpiredRequest({
        expiresAt: new Date(Date.now() + 60_000),
        status: "Pending",
      }),
    ).toBe(false);
  });

  it("updates an overdue pending request to Expired", async () => {
    const expiredRequest = {
      amountCents: 2500,
      cancelledAt: null,
      createdAt: new Date("2026-04-01T12:00:00.000Z"),
      declinedAt: null,
      expiresAt: new Date(Date.now() - 60_000),
      id: "request-expired",
      lastStatusChangedAt: new Date("2026-04-01T12:00:00.000Z"),
      note: "expired request",
      paidAt: null,
      recipientContactType: "email" as const,
      recipientContactValue: "recipient@example.com",
      recipientMatchedUserId: "recipient-id",
      senderUserId: "sender-id",
      status: "Pending" as const,
      updatedAt: new Date("2026-04-01T12:00:00.000Z"),
    };

    updatePaymentRequestRecord.mockResolvedValueOnce(
      {
        ...expiredRequest,
        status: "Expired" as const,
      },
    );

    const result = await syncExpiredRequest(expiredRequest);

    expect(updatePaymentRequestRecord).toHaveBeenCalled();
    expect(result.status).toBe("Expired");
  });
});
