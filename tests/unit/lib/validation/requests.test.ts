import { describe, expect, it } from "vitest";

import {
  isSelfRequestRecipient,
  parseRecipientContact,
  requestCreateSchema,
} from "@/lib/validation/requests";

describe("requestCreateSchema", () => {
  it("normalizes recipient email and converts the amount to integer cents", () => {
    const result = requestCreateSchema.parse({
      amount: "24.50",
      note: "  Dinner split  ",
      recipientContact: "Recipient@Example.com ",
    });

    expect(result.amountCents).toBe(2450);
    expect(result.note).toBe("Dinner split");
    expect(result.recipientContactType).toBe("email");
    expect(result.recipientContactValue).toBe("recipient@example.com");
  });

  it("accepts pragmatic US phone formatting", () => {
    expect(parseRecipientContact("(555) 222-3000")).toEqual({
      type: "phone",
      value: "+15552223000",
    });
  });

  it("rejects invalid contacts", () => {
    const result = requestCreateSchema.safeParse({
      amount: "25.00",
      note: "",
      recipientContact: "not-a-contact",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.recipientContact?.[0]).toBe(
      "Enter a valid recipient email or phone number.",
    );
  });
});

describe("isSelfRequestRecipient", () => {
  it("blocks self-requests addressed to the signed-in email", () => {
    expect(
      isSelfRequestRecipient({
        currentUserEmail: "sender@example.com",
        recipientContactType: "email",
        recipientContactValue: "sender@example.com",
      }),
    ).toBe(true);
  });

  it("blocks self-requests addressed to the signed-in phone", () => {
    expect(
      isSelfRequestRecipient({
        currentUserEmail: "sender@example.com",
        currentUserPhone: "+1 (555) 111-1000",
        recipientContactType: "phone",
        recipientContactValue: "+15551111000",
      }),
    ).toBe(true);
  });

  it("allows requests to a different contact", () => {
    expect(
      isSelfRequestRecipient({
        currentUserEmail: "sender@example.com",
        currentUserPhone: "+1 (555) 111-1000",
        recipientContactType: "email",
        recipientContactValue: "recipient@example.com",
      }),
    ).toBe(false);
  });
});
