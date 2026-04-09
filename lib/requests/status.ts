import { RequestStatus } from "@prisma/client";

export const TERMINAL_REQUEST_STATUSES = new Set<RequestStatus>([
  RequestStatus.CANCELLED,
  RequestStatus.DECLINED,
  RequestStatus.EXPIRED,
  RequestStatus.PAID,
]);

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  [RequestStatus.CANCELLED]: "Cancelled",
  [RequestStatus.DECLINED]: "Declined",
  [RequestStatus.EXPIRED]: "Expired",
  [RequestStatus.PAID]: "Paid",
  [RequestStatus.PENDING]: "Pending",
};

export function isPendingStatus(status: RequestStatus) {
  return status === RequestStatus.PENDING;
}

export function isTerminalStatus(status: RequestStatus) {
  return TERMINAL_REQUEST_STATUSES.has(status);
}

export function getStatusLabel(status: RequestStatus) {
  return REQUEST_STATUS_LABELS[status];
}
