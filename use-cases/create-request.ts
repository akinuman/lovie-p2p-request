import {
  createPaymentRequestRecord,
  findPaymentRequestById,
} from "@/data-access/payment-requests";
import { findUserByRecipientContact } from "@/data-access/users";
import { DEFAULT_CURRENCY_CODE } from "@/lib/money/format-amount";
import { computeExpiresAt } from "@/use-cases/request-expiry";

export interface CreateRequestMutationInput {
  amountCents: number;
  note?: string;
  recipientContactType: "email" | "phone";
  recipientContactValue: string;
  senderUserId: string;
}

async function getFreshRequestOrThrow(requestId: string) {
  const request = await findPaymentRequestById(requestId);

  if (!request) {
    throw new Error("Request not found.");
  }

  return request;
}

export async function createRequestMutation(
  input: CreateRequestMutationInput,
) {
  const recipientMatchedUser = await findUserByRecipientContact(
    input.recipientContactType,
    input.recipientContactValue,
  );

  const now = new Date();
  const createdRequest = await createPaymentRequestRecord({
    amountCents: input.amountCents,
    createdAt: now,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt: computeExpiresAt(now),
    lastStatusChangedAt: now,
    note: input.note,
    recipientContactType: input.recipientContactType,
    recipientContactValue: input.recipientContactValue,
    recipientMatchedUserId: recipientMatchedUser?.id,
    senderUserId: input.senderUserId,
    updatedAt: now,
  });

  return getFreshRequestOrThrow(createdRequest.id);
}
