"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createRequestAction,
} from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCreateRequestActionState,
  initialCreateRequestActionState,
  type CreateRequestActionState,
} from "@/lib/requests/create-request-action-state";
import { MAX_REQUEST_AMOUNT_LABEL } from "@/lib/money/parse-amount";
import { cn } from "@/lib/utils";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full rounded-full sm:w-auto"
      loading={pending}
      disabled={pending}
    >
      {pending ? "Creating request..." : "Create request"}
    </Button>
  );
}

function RequestFormFields({
  state,
}: {
  state: CreateRequestActionState;
}) {
  const { pending } = useFormStatus();

  return (
    <fieldset className="space-y-5" disabled={pending}>
      <div className="space-y-2">
        <Label htmlFor="recipientContact">Recipient email or phone</Label>
        <Input
          id="recipientContact"
          name="recipientContact"
          placeholder="recipient@example.com or +1 555 222 3000"
          defaultValue={state.values.recipientContact}
          aria-invalid={Boolean(state.errors.recipientContact)}
          className={cn(
            "rounded-2xl",
            state.errors.recipientContact && "border-destructive",
          )}
          required
        />
        <p className="text-sm leading-6 text-muted-foreground">
          We normalize email to lowercase and phone numbers to E.164-style
          `+1...` values for matching.
        </p>
        <FieldError message={state.errors.recipientContact} />
      </div>

      <div className="grid gap-5 md:grid-cols-[0.7fr_1fr]">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="24.50"
            defaultValue={state.values.amount}
            aria-invalid={Boolean(state.errors.amount)}
            className={cn(
              "rounded-2xl",
              state.errors.amount && "border-destructive",
            )}
            required
          />
          <p className="text-sm leading-6 text-muted-foreground">
            Enter a value greater than zero and no more than{" "}
            {MAX_REQUEST_AMOUNT_LABEL}.
          </p>
          <FieldError message={state.errors.amount} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Textarea
            id="note"
            name="note"
            placeholder="Split dinner from Friday night"
            defaultValue={state.values.note}
            aria-invalid={Boolean(state.errors.note)}
            className={cn(
              "min-h-[96px] rounded-2xl",
              state.errors.note && "border-destructive",
            )}
          />
          <FieldError message={state.errors.note} />
        </div>
      </div>

      {state.errors.form ? (
        <div
          role="alert"
          aria-live="polite"
          className="request-flow-feedback-error rounded-2xl"
        >
          {state.errors.form}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-muted-foreground">
          Requests stay pending for seven days unless they are resolved or
          cancelled sooner.
        </p>
        <SubmitButton />
      </div>
    </fieldset>
  );
}

function normalizeCreateRequestActionState(
  state: unknown,
): CreateRequestActionState {
  if (!state || typeof state !== "object") {
    return initialCreateRequestActionState;
  }

  const candidate = state as Partial<CreateRequestActionState>;
  const values =
    candidate.values && typeof candidate.values === "object"
      ? candidate.values
      : undefined;
  const errors =
    candidate.errors && typeof candidate.errors === "object"
      ? candidate.errors
      : undefined;

  return createCreateRequestActionState({
    errors,
    values,
  });
}

export function RequestForm() {
  const [state, formAction] = useActionState(
    createRequestAction,
    initialCreateRequestActionState,
  );
  const safeState = normalizeCreateRequestActionState(state);

  return (
    <Card className="border-white/70 bg-card/90 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
      <CardHeader className="space-y-3">
        <div className="inline-flex w-fit rounded-full bg-accent px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground">
          Sender flow
        </div>
        <CardTitle className="text-3xl tracking-[-0.04em]">
          Create a payment request
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={formAction} className="space-y-5">
          <RequestFormFields state={safeState} />
        </form>
      </CardContent>
    </Card>
  );
}
