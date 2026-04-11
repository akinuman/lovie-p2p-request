"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import {
  cancelRequestAction,
  declineRequestAction,
  payRequestAction,
} from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { RequestStatus } from "@/drizzle/schema";
import { toast } from "@/hooks/use-toast";
import type { RequestViewerRole } from "@/lib/auth/current-user";
import {
  formatAmountFromCents,
  formatCurrencyCodeLabel,
} from "@/lib/money/format-amount";
import {
  initialRequestMutationActionState,
  type RequestMutationActionState,
} from "@/use-cases/request-action-state";

interface RequestActionsProps {
  amountCents?: number;
  currencyCode?: string;
  requestId: string;
  status: RequestStatus;
  viewerRole: RequestViewerRole;
}

interface ActionButtonProps {
  fullWidth?: boolean;
  idleLabel: string;
  pendingLabel: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

function ActionButton({
  fullWidth = false,
  idleLabel,
  pendingLabel,
  variant = "default",
}: ActionButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      className={fullWidth ? "w-full rounded-full" : "w-full rounded-full sm:w-auto"}
      loading={pending}
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}

interface RequestActionFormProps {
  action: (
    previousState: RequestMutationActionState,
    formData: FormData,
  ) => Promise<RequestMutationActionState>;
  children?: React.ReactNode;
  fullWidth?: boolean;
  idleLabel: string;
  onSuccess?: () => void;
  pendingLabel: string;
  requestId: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

function RequestActionForm({
  action,
  children,
  fullWidth = false,
  idleLabel,
  onSuccess,
  pendingLabel,
  requestId,
  variant,
}: RequestActionFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    action,
    initialRequestMutationActionState,
  );

  useEffect(() => {
    if (state.status === "idle") {
      return;
    }

    toast({
      title: state.message,
      variant: state.status === "error" ? "destructive" : "default",
    });

    if (state.status === "success") {
      onSuccess?.();
      router.refresh();
    }
  }, [onSuccess, router, state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="requestId" value={requestId} />
      {children}
      <ActionButton
        fullWidth={fullWidth}
        idleLabel={idleLabel}
        pendingLabel={pendingLabel}
        variant={variant}
      />
    </form>
  );
}

interface PayConfirmationDialogProps {
  amountCents: number;
  currencyCode: string;
  requestId: string;
}

function PayConfirmationDialog({
  amountCents,
  currencyCode,
  requestId,
}: PayConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const formattedAmount = formatAmountFromCents(amountCents, currencyCode);
  const currencyLabel = formatCurrencyCodeLabel(currencyCode);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="w-full rounded-full sm:w-auto">
          Pay request
        </Button>
      </DialogTrigger>
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
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full sm:w-auto"
            >
              Not now
            </Button>
          </DialogClose>
          <div className="w-full sm:w-auto">
            <RequestActionForm
              action={payRequestAction}
              fullWidth
              idleLabel="Confirm payment"
              onSuccess={() => setOpen(false)}
              pendingLabel="Processing payment..."
              requestId={requestId}
            >
              <input type="hidden" name="confirmed" value="true" />
            </RequestActionForm>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RequestActions({
  amountCents,
  currencyCode,
  requestId,
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
        variant="outline"
      />
    );
  }

  if (viewerRole !== "recipient" || status !== "Pending") {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {typeof amountCents === "number" && currencyCode ? (
        <PayConfirmationDialog
          amountCents={amountCents}
          currencyCode={currencyCode}
          requestId={requestId}
        />
      ) : null}
      <RequestActionForm
        action={declineRequestAction}
        idleLabel="Decline request"
        pendingLabel="Declining..."
        requestId={requestId}
        variant="outline"
      />
    </div>
  );
}
