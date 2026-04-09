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

export async function syncExpiredRequest(request: PaymentRequest) {
  if (request.status !== "Pending" || !isRequestExpired(request.expiresAt)) {
    return request;
  }

  const [updatedRequest] = await db
    .update(paymentRequests)
    .set({
      status: "Expired",
      lastStatusChangedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(paymentRequests.id, request.id))
    .returning();

  return updatedRequest;
}
