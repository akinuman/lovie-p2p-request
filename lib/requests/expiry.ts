import {
  PrismaClient,
  RequestStatus,
  type PaymentRequest,
  type Prisma,
} from "@prisma/client";

export const REQUEST_EXPIRY_DAYS = 7;
export const REQUEST_EXPIRY_MS = REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

type DatabaseClient = Prisma.TransactionClient | PrismaClient;

export function computeExpiresAt(fromDate = new Date()) {
  return new Date(fromDate.getTime() + REQUEST_EXPIRY_MS);
}

export function isRequestExpired(expiresAt: Date, now = new Date()) {
  return now.getTime() >= expiresAt.getTime();
}

export async function syncExpiredRequest(
  client: DatabaseClient,
  request: PaymentRequest,
) {
  if (
    request.status !== RequestStatus.PENDING ||
    !isRequestExpired(request.expiresAt)
  ) {
    return request;
  }

  return client.paymentRequest.update({
    where: { id: request.id },
    data: {
      status: RequestStatus.EXPIRED,
      lastStatusChangedAt: new Date(),
    },
  });
}
