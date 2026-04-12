"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrencyInput } from "@/hooks/use-currency-input";
import { useRequestCreationRedirect } from "@/hooks/use-request-creation-redirect";
import { AMOUNT_PRESETS } from "@/lib/constants";
import {
  DEFAULT_CURRENCY_CODE,
  formatAmountFromCents,
} from "@/lib/money/format-amount";
import { MAX_REQUEST_AMOUNT_CENTS } from "@/lib/money/parse-amount";
import { cn } from "@/lib/utils";
import {
  initialCreateRequestActionState,
  type CreateRequestActionState,
} from "@/use-cases/create-request-form-state";
import { createRequestAction } from "@/use-cases/request-actions";

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

function RequestFormFields({ state }: { state: CreateRequestActionState }) {
  const { pending } = useFormStatus();
  const {
    displayValue,
    rawValue,
    cents,
    inputRef,
    handleKeyDown,
    handleChange,
    setFromPreset,
  } = useCurrencyInput(state.values.amount, state.values.amount);

  const currencySymbol =
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: DEFAULT_CURRENCY_CODE,
    })
      .formatToParts(0)
      .find((x) => x.type === "currency")?.value || "$";

  return (
    <fieldset className="space-y-8" disabled={pending}>
      <div className="flex flex-col items-center justify-center space-y-3 pt-2 pb-4 text-center">
        <Label
          htmlFor="amount"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70"
        >
          Amount
        </Label>
        <div className="flex w-fit max-w-full items-baseline justify-center gap-1 font-light tracking-tighter">
          <span
            className={cn(
              "shrink-0 text-4xl md:text-5xl transition-colors",
              cents > 0 ? "text-foreground/60" : "text-muted-foreground/60",
            )}
          >
            {currencySymbol}
          </span>
          {/* Hidden input carries the raw parseable value for form submission */}
          <input type="hidden" name="amount" value={rawValue} />
          <input
            ref={inputRef}
            id="amount"
            inputMode="decimal"
            autoComplete="off"
            value={displayValue}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            autoFocus
            className={cn(
              "min-w-[4ch] max-w-full bg-transparent text-5xl sm:text-6xl md:text-7xl outline-none border-none ring-0 p-0 [field-sizing:content]",
              cents === 0 && "text-muted-foreground/20",
            )}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {AMOUNT_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setFromPreset(preset)}
            >
              ${preset}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Should be less than{" "}
          {formatAmountFromCents(
            MAX_REQUEST_AMOUNT_CENTS,
            DEFAULT_CURRENCY_CODE,
          )}
        </p>
        <FieldError message={state.errors.amount} />
      </div>

      <div className="space-y-5 rounded-3xl border border-border/40 bg-muted/30 p-5 shadow-sm">
        <div className="space-y-2">
          <Label
            htmlFor="recipientContact"
            className="text-sm font-medium text-foreground"
          >
            To
          </Label>
          <Input
            id="recipientContact"
            name="recipientContact"
            autoComplete="off"
            placeholder="recipient@example.com or +1 555 222 3000"
            defaultValue={state.values.recipientContact}
            aria-invalid={Boolean(state.errors.recipientContact)}
            className={cn(
              "rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-sm transition-colors focus-visible:bg-background h-12 text-base",
              state.errors.recipientContact &&
                "border-destructive focus-visible:ring-destructive",
            )}
            required
          />
          <FieldError message={state.errors.recipientContact} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note" className="text-sm font-medium text-foreground">
            Note
          </Label>
          <Textarea
            id="note"
            name="note"
            placeholder="Split dinner from Friday night..."
            defaultValue={state.values.note}
            aria-invalid={Boolean(state.errors.note)}
            className={cn(
              "min-h-[80px] resize-none rounded-xl border-border/60 bg-background/50 backdrop-blur-sm shadow-sm transition-colors focus-visible:bg-background text-base",
              state.errors.note &&
                "border-destructive focus-visible:ring-destructive",
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

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-muted-foreground">
          Requests stay pending for 7 days unless resolved.
        </p>
        <SubmitButton />
      </div>
    </fieldset>
  );
}

export function RequestForm() {
  const [state, formAction] = useActionState(
    createRequestAction,
    initialCreateRequestActionState,
  );

  useRequestCreationRedirect(state.createdRequest ?? null);

  return (
    <Card className="mx-auto w-full max-w-lg overflow-hidden border-white/20 bg-card/60 backdrop-blur-xl shadow-2xl shadow-primary/5 sm:rounded-[2rem]">
      <CardHeader className="space-y-1 pb-4 pt-8 text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
          Request Money
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-8 sm:px-8">
        <form action={formAction} className="space-y-5">
          <RequestFormFields state={state} />
        </form>
      </CardContent>
    </Card>
  );
}
