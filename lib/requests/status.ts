import type { RequestStatus } from "@/drizzle/schema";

import type { RequestViewerRole } from "@/lib/auth/current-user";

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

function hasRequestExpired(expiresAt: Date, now = new Date()) {
  return now.getTime() >= expiresAt.getTime();
}

interface RecipientActionGuardInput {
  expiresAt: Date;
  now?: Date;
  status: RequestStatus;
  viewerRole: RequestViewerRole;
}

export type RequestAction = "cancel" | "decline" | "pay";

function getActionRequiredRole(action: RequestAction): RequestViewerRole {
  return action === "cancel" ? "sender" : "recipient";
}

function getActionVerb(action: RequestAction) {
  if (action === "pay") {
    return "pay";
  }

  if (action === "decline") {
    return "decline";
  }

  return "cancel";
}

function getActionPastTense(action: RequestAction) {
  if (action === "pay") {
    return "paid";
  }

  if (action === "decline") {
    return "declined";
  }

  return "cancelled";
}

export function getRequestActionGuardMessage(
  action: RequestAction,
  input: RecipientActionGuardInput,
) {
  const requiredRole = getActionRequiredRole(action);

  if (input.viewerRole !== requiredRole) {
    return requiredRole === "sender"
      ? "Only the sender can cancel this request."
      : `Only the intended recipient can ${getActionVerb(action)} this request.`;
  }

  if (
    input.status === "Expired" ||
    (input.status === "Pending" &&
      hasRequestExpired(input.expiresAt, input.now))
  ) {
    return `This request has expired and can’t be ${getActionPastTense(action)}.`;
  }

  if (!isPendingStatus(input.status)) {
    return `Only pending requests can be ${getActionPastTense(action)}.`;
  }

  return null;
}

export function getRequestActionAvailabilityMessage(
  status: RequestStatus,
  viewerRole: RequestViewerRole,
) {
  if (viewerRole === "sender") {
    if (status === "Cancelled") {
      return "You already cancelled this request.";
    }

    if (status === "Expired") {
      return "This request expired before it could be cancelled.";
    }

    if (status === "Paid") {
      return "This request has already been paid.";
    }

    if (status === "Declined") {
      return "This request has already been declined.";
    }

    return "Only pending requests can be cancelled.";
  }

  if (status === "Cancelled") {
    return "The sender cancelled this request.";
  }

  if (status === "Expired") {
    return "This request has expired and can no longer be acted on.";
  }

  if (status === "Paid") {
    return "This request has already been paid.";
  }

  if (status === "Declined") {
    return "This request has already been declined.";
  }

  return "Only the matched recipient can pay or decline this request.";
}
