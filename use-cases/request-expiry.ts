import { type PaymentRequest } from "@/drizzle/schema";
import { updatePaymentRequestRecord } from "@/data-access/payment-requests";

const REQUEST_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export function computeExpiresAt(fromDate = new Date()) {
  return new Date(fromDate.getTime() + REQUEST_EXPIRY_MS);
}

function isRequestExpired(expiresAt: Date, now = new Date()) {
  return now.getTime() >= expiresAt.getTime();
}

export function shouldSyncExpiredRequest(
  request: Pick<PaymentRequest, "expiresAt" | "status">,
  now = new Date(),
) {
  return request.status === "Pending" && isRequestExpired(request.expiresAt, now);
}

export async function syncExpiredRequest(request: PaymentRequest) {
  if (!shouldSyncExpiredRequest(request)) {
    return request;
  }

  const now = new Date();
  const updatedRequest = await updatePaymentRequestRecord(request.id, {
      cancelledAt: request.cancelledAt,
      declinedAt: request.declinedAt,
      paidAt: request.paidAt,
      status: "Expired",
      lastStatusChangedAt: now,
      updatedAt: now,
  });

  if (!updatedRequest) {
    throw new Error("Request not found.");
  }

  return updatedRequest;
}

