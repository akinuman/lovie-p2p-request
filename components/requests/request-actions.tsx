"use client";

import { useFormStatus } from "react-dom";

import {
  cancelRequestAction,
  declineRequestAction,
  payRequestAction,
} from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import type { RequestStatus } from "@/drizzle/schema";
import type { RequestViewerRole } from "@/lib/auth/current-user";
import { getRequestActionAvailabilityMessage } from "@/lib/requests/status";

interface RequestActionsProps {
  requestId: string;
  returnTo: string;
  status: RequestStatus;
  viewerRole: RequestViewerRole;
}

interface ActionButtonProps {
  idleLabel: string;
  pendingLabel: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

function ActionButton({
  idleLabel,
  pendingLabel,
  variant = "default",
}: ActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      className="w-full rounded-full sm:w-auto"
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

interface RequestActionFormProps {
  action: (formData: FormData) => Promise<void>;
  idleLabel: string;
  pendingLabel: string;
  requestId: string;
  returnTo: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

function RequestActionForm({
  action,
  idleLabel,
  pendingLabel,
  requestId,
  returnTo,
  variant,
}: RequestActionFormProps) {
  return (
    <form action={action}>
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <ActionButton
        idleLabel={idleLabel}
        pendingLabel={pendingLabel}
        variant={variant}
      />
    </form>
  );
}

function getResolutionMessage(status: RequestStatus, viewerRole: RequestViewerRole) {
  return getRequestActionAvailabilityMessage(status, viewerRole);
}

export function RequestActions({
  requestId,
  returnTo,
  status,
  viewerRole,
}: RequestActionsProps) {
  if (viewerRole === "sender" && status === "Pending") {
    return (
      <RequestActionForm
        action={cancelRequestAction}
        idleLabel="Cancel request"
        pendingLabel="Cancelling..."
        requestId={requestId}
        returnTo={returnTo}
        variant="outline"
      />
    );
  }

  if (viewerRole !== "recipient" || status !== "Pending") {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        {getResolutionMessage(status, viewerRole)}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <RequestActionForm
        action={payRequestAction}
        idleLabel="Pay request"
        pendingLabel="Processing payment..."
        requestId={requestId}
        returnTo={returnTo}
      />
      <RequestActionForm
        action={declineRequestAction}
        idleLabel="Decline request"
        pendingLabel="Declining..."
        requestId={requestId}
        returnTo={returnTo}
        variant="outline"
      />
    </div>
  );
}
