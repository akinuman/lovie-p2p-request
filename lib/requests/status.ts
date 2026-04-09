import type { RequestStatus } from "@/drizzle/schema";

export const TERMINAL_REQUEST_STATUSES = new Set<RequestStatus>([
  "Cancelled",
  "Declined",
  "Expired",
  "Paid",
]);

export const REQUEST_STATUS_LABELS: Record<RequestStatus, RequestStatus> = {
  Cancelled: "Cancelled",
  Declined: "Declined",
  Expired: "Expired",
  Paid: "Paid",
  Pending: "Pending",
};

export function isPendingStatus(status: RequestStatus) {
  return status === "Pending";
}

export function isTerminalStatus(status: RequestStatus) {
  return TERMINAL_REQUEST_STATUSES.has(status);
}

export function getStatusLabel(status: RequestStatus) {
  return REQUEST_STATUS_LABELS[status];
}
