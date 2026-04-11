import type { RequestStatus } from "@/drizzle/schema";

import { formatAmountFromCents } from "@/lib/money/format-amount";

export interface RequestPresentationInput {
  amountCents: number;
  currencyCode: string;
  expiresAt?: Date;
  id: string;
  note?: string | null;
  recipientLabel?: string;
  senderLabel?: string;
  shareUrl?: string;
  status?: RequestStatus;
}

export interface RequestPresentationOutput extends RequestPresentationInput {
  formattedAmount: string;
  notePreview: string | null;
}

export function buildRequestPresentation<TInput extends RequestPresentationInput>(
  input: TInput,
): TInput & RequestPresentationOutput {
  const trimmedNote = input.note?.trim();

  return {
    ...input,
    formattedAmount: formatAmountFromCents(
      input.amountCents,
      input.currencyCode,
    ),
    notePreview: trimmedNote ? trimmedNote.slice(0, 140) : null,
  };
}
