import Link from "next/link";

import type { PaymentRequestRecord } from "@/lib/requests/queries";
import { RequestCard } from "@/components/requests/request-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatAmountFromCents,
  formatCurrencyCodeLabel,
} from "@/lib/money/format-amount";

interface RequestShareSummaryProps {
  request: PaymentRequestRecord;
  shareUrl: string;
}

export function RequestShareSummary({
  request,
  shareUrl,
}: RequestShareSummaryProps) {
  const formattedAmount = formatAmountFromCents(
    request.amountCents,
    request.currencyCode,
  );
  const currencyLabel = formatCurrencyCodeLabel(request.currencyCode);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.8fr]">
      <RequestCard request={request} shareUrl={shareUrl} variant="share" />

      <Card className="border-white/70 bg-card/90 shadow-[0_18px_50px_rgba(83,59,30,0.08)]">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.04em]">
            Shared summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Requested amount
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formattedAmount}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Currency {currencyLabel}
            </p>
          </div>
          <p>
            Anyone with this link can see the amount, sender, note, and current
            lifecycle state.
          </p>
          <p>
            Only the intended recipient can unlock full details and take action
            after signing in with the matching account.
          </p>
          <Button asChild className="w-full rounded-full">
            <Link href="/sign-in">Sign in to continue</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
