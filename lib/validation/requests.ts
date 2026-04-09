import { z } from "zod";

import { parseAmountToCents } from "@/lib/money/parse-amount";

const REQUEST_STATUSES = [
  "Pending",
  "Paid",
  "Declined",
  "Cancelled",
  "Expired",
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RequestStatusLabel = (typeof REQUEST_STATUSES)[number];
export type ContactTypeLabel = "email" | "phone";

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (trimmed.startsWith("+") && digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

export function parseRecipientContact(
  value: string,
): { type: ContactTypeLabel; value: string } | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalizedEmail = normalizeEmail(trimmed);
  if (EMAIL_PATTERN.test(normalizedEmail)) {
    return {
      type: "email",
      value: normalizedEmail,
    };
  }

  const normalizedPhone = normalizePhone(trimmed);
  if (normalizedPhone) {
    return {
      type: "phone",
      value: normalizedPhone,
    };
  }

  return null;
}

export function isSelfRequestRecipient(input: {
  currentUserEmail: string;
  currentUserPhone?: string | null;
  recipientContactType: ContactTypeLabel;
  recipientContactValue: string;
}) {
  if (
    input.recipientContactType === "email" &&
    normalizeEmail(input.currentUserEmail) === input.recipientContactValue
  ) {
    return true;
  }

  if (!input.currentUserPhone || input.recipientContactType !== "phone") {
    return false;
  }

  return normalizePhone(input.currentUserPhone) === input.recipientContactValue;
}

export const requestCreateSchema = z
  .object({
    amount: z.string().trim().min(1, "Amount is required."),
    note: z
      .string()
      .trim()
      .max(280, "Keep notes to 280 characters or less.")
      .optional()
      .transform((value) => value || undefined),
    recipientContact: z.string().trim().min(1, "Recipient email or phone is required."),
  })
  .transform((input, context) => {
    const contact = parseRecipientContact(input.recipientContact);

    if (!contact) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid recipient email or phone number.",
        path: ["recipientContact"],
      });

      return z.NEVER;
    }

    let amountCents = 0;

    try {
      amountCents = parseAmountToCents(input.amount);
    } catch (error) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          error instanceof Error
            ? error.message
            : "Enter a valid amount greater than zero.",
        path: ["amount"],
      });

      return z.NEVER;
    }

    return {
      amount: input.amount,
      amountCents,
      note: input.note,
      recipientContact: input.recipientContact,
      recipientContactType: contact.type,
      recipientContactValue: contact.value,
    };
  });

export const dashboardFilterSchema = z.object({
  q: z.string().trim().optional().transform((value) => value || undefined),
  status: z
    .enum(REQUEST_STATUSES)
    .optional()
    .or(z.literal("all"))
    .transform((value) => (value === "all" ? undefined : value)),
});

export type DashboardFilterInput = z.infer<typeof dashboardFilterSchema>;
export type RequestCreateInput = z.infer<typeof requestCreateSchema>;
