import Link from "next/link";

import type { PaymentRequestRecord } from "@/lib/requests/queries";
import { RequestCard } from "@/components/requests/request-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequestShareSummaryProps {
  request: PaymentRequestRecord;
  shareUrl: string;
}

export function RequestShareSummary({
  request,
  shareUrl,
}: RequestShareSummaryProps) {
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
