import { describe, expect, it, vi } from "vitest";

import { getNextDashboardCursor } from "@/lib/use-cases/requests/dashboard-pagination";

vi.mock("@/lib/data-access/payment-requests", () => ({
  listIncomingPaymentRequestsPage: vi.fn(),
  listOutgoingPaymentRequestsPage: vi.fn(),
}));

vi.mock("@/lib/use-cases/requests/request-expiry", () => ({
  syncExpiredRequest: vi.fn(async (request: unknown) => request),
}));

const {
  getIncomingDashboardRequestPage,
  getOutgoingDashboardRequestPage,
  serializeDashboardRequestPage,
} = await import("@/lib/use-cases/requests/read-dashboard");
const dataAccess = await import("@/lib/data-access/payment-requests");

function makeRequest(overrides: Record<string, unknown> = {}) {
  return {
    amountCents: 2450,
    cancelledAt: null,
    createdAt: new Date("2026-04-10T10:00:00.000Z"),
    currencyCode: "USD",
    declinedAt: null,
    expiresAt: new Date("2026-04-17T10:00:00.000Z"),
    id: "request-123",
    lastStatusChangedAt: new Date("2026-04-10T10:00:00.000Z"),
    note: "Dinner split",
    paidAt: null,
    recipientContactType: "email",
    recipientContactValue: "recipient@example.com",
    recipientMatchedUser: null,
    recipientMatchedUserId: null,
    sender: {
      createdAt: new Date("2026-04-10T10:00:00.000Z"),
      email: "sender@example.com",
      id: "user-sender",
      phone: null,
      updatedAt: new Date("2026-04-10T10:00:00.000Z"),
    },
    senderUserId: "user-sender",
    status: "Pending",
    updatedAt: new Date("2026-04-10T10:00:00.000Z"),
    ...overrides,
  };
}

describe("dashboard request use cases", () => {
  it("shapes outgoing requests into card presentation data", async () => {
    vi.mocked(dataAccess.listOutgoingPaymentRequestsPage).mockResolvedValue({
      hasMore: false,
      items: [makeRequest()],
      nextCursor: null,
    });

    const page = await getOutgoingDashboardRequestPage("user-sender", {});

    expect(page.items[0]).toMatchObject({
      formattedAmount: "$24.50",
      notePreview: "Dinner split",
      recipientLabel: "recipient@example.com",
      shareUrl: "/r/request-123",
      status: "Pending",
    });
  });

  it("shapes incoming requests with sender labels and serializes page payloads", async () => {
    vi.mocked(dataAccess.listIncomingPaymentRequestsPage).mockResolvedValue({
      hasMore: true,
      items: [
        makeRequest({
          amountCents: 5100,
          currencyCode: "USD",
          id: "request-456",
          sender: {
            createdAt: new Date("2026-04-10T10:00:00.000Z"),
            email: "friend@example.com",
            id: "user-friend",
            phone: null,
            updatedAt: new Date("2026-04-10T10:00:00.000Z"),
          },
        }),
      ],
      nextCursor: "cursor-456",
    });

    const page = await getIncomingDashboardRequestPage(
      {
        email: "recipient@example.com",
        id: "user-recipient",
        phone: null,
      },
      {},
    );
    const serialized = serializeDashboardRequestPage(page);

    expect(page.items[0]).toMatchObject({
      formattedAmount: "$51.00",
      senderLabel: "friend@example.com",
    });
    expect(serialized).toMatchObject({
      hasMore: true,
      nextCursor: getNextDashboardCursor(page.items),
    });
    expect(serialized.items[0]?.createdAt).toBe("2026-04-10T10:00:00.000Z");
  });
});
