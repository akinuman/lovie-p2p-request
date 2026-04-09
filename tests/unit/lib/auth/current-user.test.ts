import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getSessionCookie: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}));

const {
  doesUserMatchRequestRecipient,
  getRequestViewerRole,
} = await import("@/lib/auth/current-user");

describe("doesUserMatchRequestRecipient", () => {
  it("matches requests addressed to the signed-in email", () => {
    expect(
      doesUserMatchRequestRecipient(
        {
          email: "recipient@example.com",
          id: "user-recipient",
          phone: null,
        },
        {
          recipientContactType: "email",
          recipientContactValue: "recipient@example.com",
          recipientMatchedUserId: null,
          senderUserId: "user-sender",
        },
      ),
    ).toBe(true);
  });

  it("matches phone-addressed requests against the stored profile phone", () => {
    expect(
      doesUserMatchRequestRecipient(
        {
          email: "recipient-phone@example.com",
          id: "user-recipient-phone",
          phone: "+1 (555) 222-3000",
        },
        {
          recipientContactType: "phone",
          recipientContactValue: "+15552223000",
          recipientMatchedUserId: null,
          senderUserId: "user-sender",
        },
      ),
    ).toBe(true);
  });

  it("rejects unrelated users", () => {
    expect(
      doesUserMatchRequestRecipient(
        {
          email: "other@example.com",
          id: "user-other",
          phone: null,
        },
        {
          recipientContactType: "email",
          recipientContactValue: "recipient@example.com",
          recipientMatchedUserId: null,
          senderUserId: "user-sender",
        },
      ),
    ).toBe(false);
  });
});

describe("getRequestViewerRole", () => {
  it("treats the sender as a sender even when they are also the matched recipient", () => {
    expect(
      getRequestViewerRole(
        {
          email: "sender@example.com",
          id: "user-sender",
          phone: "+15551111000",
        },
        {
          recipientContactType: "email",
          recipientContactValue: "sender@example.com",
          recipientMatchedUserId: "user-sender",
          senderUserId: "user-sender",
        },
      ),
    ).toBe("sender");
  });

  it("returns recipient for the intended recipient", () => {
    expect(
      getRequestViewerRole(
        {
          email: "recipient@example.com",
          id: "user-recipient",
          phone: null,
        },
        {
          recipientContactType: "email",
          recipientContactValue: "recipient@example.com",
          recipientMatchedUserId: null,
          senderUserId: "user-sender",
        },
      ),
    ).toBe("recipient");
  });
});
