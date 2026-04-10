import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/data-access/payment-requests", () => ({
  findMatchedRecipientUser: vi.fn(),
  findPaymentRequestById: vi.fn(),
  listIncomingPaymentRequests: vi.fn(),
  listOutgoingPaymentRequests: vi.fn(),
}));

vi.mock("@/lib/requests/expiry", () => ({
  syncExpiredRequest: vi.fn(async (request: unknown) => request),
  syncExpiredRequests: vi.fn(async (requests: unknown[]) => requests),
}));

vi.mock("@/lib/auth/current-user", () => ({
  getRequestViewerRole: (
    user: { email: string; id: string; phone: string | null },
    request: {
      recipientContactType: "email" | "phone";
      recipientContactValue: string;
      recipientMatchedUserId: string | null;
      senderUserId: string;
    },
  ) => {
    if (request.senderUserId === user.id) {
      return "sender";
    }

    if (request.recipientMatchedUserId === user.id) {
      return "recipient";
    }

    if (
      request.recipientContactType === "email" &&
      request.recipientContactValue === user.email
    ) {
      return "recipient";
    }

    return "none";
  },
}));

const {
  filterIncomingRequests,
  filterOutgoingRequests,
} = await import("@/lib/requests/queries");

function makeRequest(overrides: Record<string, unknown>) {
  return {
    amountCents: 2500,
    cancelledAt: null,
    createdAt: new Date("2026-04-01T12:00:00.000Z"),
    declinedAt: null,
    expiresAt: new Date("2026-04-08T12:00:00.000Z"),
    id: "request-default",
    lastStatusChangedAt: new Date("2026-04-01T12:00:00.000Z"),
    note: "Default note",
    paidAt: null,
    recipientContactType: "email",
    recipientContactValue: "recipient@example.com",
    recipientMatchedUser: {
      createdAt: new Date("2026-04-01T12:00:00.000Z"),
      email: "recipient@example.com",
      id: "user-recipient",
      phone: null,
      updatedAt: new Date("2026-04-01T12:00:00.000Z"),
    },
    recipientMatchedUserId: "user-recipient",
    sender: {
      createdAt: new Date("2026-04-01T12:00:00.000Z"),
      email: "sender@example.com",
      id: "user-sender",
      phone: "+15551111000",
      updatedAt: new Date("2026-04-01T12:00:00.000Z"),
    },
    senderUserId: "user-sender",
    status: "Pending",
    updatedAt: new Date("2026-04-01T12:00:00.000Z"),
    ...overrides,
  };
}

describe("filterOutgoingRequests", () => {
  it("filters outgoing requests by search text and status", () => {
    const requests = [
      makeRequest({
        id: "request-brunch",
        note: "Brunch split",
        recipientContactValue: "friend@example.com",
        status: "Pending",
      }),
      makeRequest({
        id: "request-rent",
        note: "April rent",
        recipientContactValue: "roommate@example.com",
        status: "Cancelled",
      }),
    ];

    expect(
      filterOutgoingRequests(requests, {
        q: "rent",
        status: "Cancelled",
      }),
    ).toHaveLength(1);
  });
});

describe("filterIncomingRequests", () => {
  it("returns only requests visible to the matched recipient and matching filters", () => {
    const requests = [
      makeRequest({
        id: "incoming-expired",
        note: "Expired seeded request",
        status: "Expired",
      }),
      makeRequest({
        id: "incoming-paid",
        note: "Utilities split",
        status: "Paid",
      }),
      makeRequest({
        id: "incoming-other",
        note: "Wrong recipient",
        recipientContactValue: "other@example.com",
        recipientMatchedUser: null,
        recipientMatchedUserId: null,
      }),
    ];

    const results = filterIncomingRequests(
      requests,
      {
        email: "recipient@example.com",
        id: "user-recipient",
        phone: null,
      },
      {
        q: "expired",
        status: "Expired",
      },
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("incoming-expired");
  });
});
