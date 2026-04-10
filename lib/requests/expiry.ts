import { eq } from "drizzle-orm";

import { paymentRequests, type PaymentRequest } from "@/drizzle/schema";
import { db } from "@/lib/db";

export const REQUEST_EXPIRY_DAYS = 7;
export const REQUEST_EXPIRY_MS = REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export function computeExpiresAt(fromDate = new Date()) {
  return new Date(fromDate.getTime() + REQUEST_EXPIRY_MS);
}

export function isRequestExpired(expiresAt: Date, now = new Date()) {
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
  const [updatedRequest] = await db
    .update(paymentRequests)
    .set({
      cancelledAt: request.cancelledAt,
      declinedAt: request.declinedAt,
      paidAt: request.paidAt,
      status: "Expired",
      lastStatusChangedAt: now,
      updatedAt: now,
    })
    .where(eq(paymentRequests.id, request.id))
    .returning();

  return updatedRequest;
}

export async function syncExpiredRequests<T extends PaymentRequest>(requests: T[]) {
  return Promise.all(requests.map((request) => syncExpiredRequest(request)));
}
