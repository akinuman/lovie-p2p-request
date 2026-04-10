"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

import {
  cancelRequestAction,
  declineRequestAction,
  payRequestAction,
} from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RequestStatus } from "@/drizzle/schema";
import type { RequestViewerRole } from "@/lib/auth/current-user";
import {
  formatAmountFromCents,
  formatCurrencyCodeLabel,
} from "@/lib/money/format-amount";
import { getRequestActionAvailabilityMessage } from "@/lib/requests/status";

interface RequestActionsProps {
  amountCents?: number;
  currencyCode?: string;
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
      loading={pending}
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

function PayConfirmButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full rounded-full" loading={pending}>
      {pending ? "Processing payment..." : "Confirm payment"}
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

interface PayConfirmationDialogProps {
  amountCents: number;
  currencyCode: string;
  requestId: string;
  returnTo: string;
}

function PayConfirmationDialog({
  amountCents,
  currencyCode,
  requestId,
  returnTo,
}: PayConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const formattedAmount = formatAmountFromCents(amountCents, currencyCode);
  const currencyLabel = formatCurrencyCodeLabel(currencyCode);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" className="w-full rounded-full sm:w-auto" onClick={handleOpen}>
        Pay request
      </Button>
      <DialogContent className="border-white/70 bg-card/95 shadow-[0_24px_80px_rgba(83,59,30,0.16)]">
        <DialogHeader className="space-y-3 text-left">
          <DialogTitle className="text-2xl tracking-[-0.04em]">
            Confirm this payment
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-muted-foreground">
            We’ll start the simulated processing step only after you confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Amount to pay
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
            {formattedAmount}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Currency {currencyLabel}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full sm:w-auto"
            onClick={handleClose}
          >
            Not now
          </Button>
          <form action={payRequestAction} className="w-full sm:w-auto">
            <input type="hidden" name="confirmed" value="true" />
            <input type="hidden" name="requestId" value={requestId} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <PayConfirmButton />
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RequestActions({
  amountCents,
  currencyCode,
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
      {typeof amountCents === "number" && currencyCode ? (
        <PayConfirmationDialog
          amountCents={amountCents}
          currencyCode={currencyCode}
          requestId={requestId}
          returnTo={returnTo}
        />
      ) : null}
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
