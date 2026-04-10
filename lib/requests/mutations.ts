import {
  cancelRequestMutation,
  createRequestMutation,
  declineRequestMutation,
  payRequestMutation,
} from "@/lib/use-cases/requests/mutations";
export { getRequestRevalidationPaths } from "@/lib/use-cases/requests/mutations";

export interface CreatePaymentRequestInput {
  amountCents: number;
  note?: string;
  recipientContactType: "email" | "phone";
  recipientContactValue: string;
  senderUserId: string;
}

export async function createPaymentRequest(input: CreatePaymentRequestInput) {
  return createRequestMutation(input);
}

export async function cancelPaymentRequest(requestId: string, actorUserId: string) {
  return cancelRequestMutation(requestId, actorUserId);
}

export async function declinePaymentRequest(requestId: string, actorUserId: string) {
  return declineRequestMutation(requestId, actorUserId);
}

export async function payPaymentRequest(requestId: string, actorUserId: string) {
  return payRequestMutation(requestId, actorUserId);
}
