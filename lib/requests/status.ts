import type { RequestStatus } from "@/drizzle/schema";

import type { RequestViewerRole } from "@/lib/auth/current-user";
import { isRequestExpired } from "@/lib/requests/expiry";

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

interface RecipientActionGuardInput {
  expiresAt: Date;
  now?: Date;
  status: RequestStatus;
  viewerRole: RequestViewerRole;
}

export type RecipientAction = "decline" | "pay";

function getRecipientActionLabel(action: RecipientAction) {
  return action === "pay" ? "paid" : "declined";
}

export function getRecipientActionGuardMessage(
  action: RecipientAction,
  input: RecipientActionGuardInput,
) {
  if (input.viewerRole !== "recipient") {
    return `Only the intended recipient can ${action} this request.`;
  }

  if (
    input.status === "Expired" ||
    (input.status === "Pending" &&
      isRequestExpired(input.expiresAt, input.now))
  ) {
    return `This request has expired and can’t be ${getRecipientActionLabel(action)}.`;
  }

  if (!isPendingStatus(input.status)) {
    return `Only pending requests can be ${getRecipientActionLabel(action)}.`;
  }

  return null;
}
