import Link from "next/link";

import type { PaymentRequestRecord } from "@/lib/requests/queries";
import { formatAmountFromCents } from "@/lib/money/format-amount";
import { StatusBadge } from "@/components/requests/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequestCardProps {
  request: PaymentRequestRecord;
  shareUrl: string;
  variant?: "outgoing" | "share";
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function RequestCard({
  request,
  shareUrl,
  variant = "outgoing",
}: RequestCardProps) {
  const isShareVariant = variant === "share";

  return (
    <Card className="overflow-hidden border-white/70 bg-card/95 shadow-[0_18px_50px_rgba(83,59,30,0.1)]">
      <CardHeader className="gap-4 border-b border-border/70 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Request #{request.id.slice(-6)}
            </p>
            <CardTitle className="text-2xl tracking-[-0.04em]">
              {formatAmountFromCents(request.amountCents)}
            </CardTitle>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <dl className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          {isShareVariant ? (
            <div className="space-y-1">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Requested by
              </dt>
              <dd className="text-foreground">{request.sender.email}</dd>
            </div>
          ) : (
            <div className="space-y-1">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Recipient
              </dt>
              <dd className="text-foreground">{request.recipientContactValue}</dd>
            </div>
          )}
          <div className="space-y-1">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Created
            </dt>
            <dd className="text-foreground">{formatDateTime(request.createdAt)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Expires
            </dt>
            <dd className="text-foreground">{formatDateTime(request.expiresAt)}</dd>
          </div>
          {!isShareVariant && (
            <div className="space-y-1">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Share link
              </dt>
              <dd>
                <Link
                  href={shareUrl}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Open share page
                </Link>
              </dd>
            </div>
          )}
        </dl>

        {request.note ? (
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Note
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">{request.note}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-background/40 p-4 text-sm text-muted-foreground">
            No note was added to this request.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
