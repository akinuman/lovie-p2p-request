import Link from "next/link";

import { RequestActions } from "@/components/requests/request-actions";
import { StatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RequestViewerRole } from "@/lib/auth/current-user";
import { formatAmountFromCents } from "@/lib/money/format-amount";
import type { PaymentRequestRecord } from "@/lib/requests/queries";

interface IncomingListProps {
  requests: PaymentRequestRecord[];
  updatedRequestId?: string;
  viewerRole?: RequestViewerRole;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function IncomingList({
  requests,
  updatedRequestId,
}: IncomingListProps) {
  if (requests.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.04em]">
            No incoming requests yet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Requests addressed to your email or saved phone number will appear
            here as soon as they are created.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/dashboard/outgoing">Review your sent requests</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const isUpdated = request.id === updatedRequestId;

        return (
          <Card
            key={request.id}
            className={
              isUpdated
                ? "border-primary/30 bg-primary/5 shadow-[0_0_0_1px_rgba(194,120,3,0.18)]"
                : "border-white/70 bg-card/95 shadow-[0_18px_50px_rgba(83,59,30,0.1)]"
            }
          >
            <CardHeader className="gap-4 border-b border-border/70 pb-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Incoming request #{request.id.slice(-6)}
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
                <div className="space-y-1">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                    Sender
                  </dt>
                  <dd className="text-foreground">{request.sender.email}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                    Recipient
                  </dt>
                  <dd className="text-foreground">{request.recipientContactValue}</dd>
                </div>
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
              </dl>

              {request.note ? (
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{request.note}</p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 border-t border-border/70 pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/requests/${request.id}`}>View details</Link>
                  </Button>
                  <RequestActions
                    requestId={request.id}
                    returnTo="/dashboard/incoming"
                    status={request.status}
                    viewerRole="recipient"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
