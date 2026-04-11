import { ExpirationCountdown } from "@/components/requests/expiration-countdown";
import { RequestActions } from "@/components/requests/request-actions";
import { ShareLinkActions } from "@/components/requests/share-link-actions";
import { StatusBadge } from "@/components/requests/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RequestViewerRole } from "@/lib/auth/current-user";
import { getEnv } from "@/lib/env";
import {
  formatAmountFromCents,
  formatCurrencyCodeLabel,
} from "@/lib/money/format-amount";
import type { PaymentRequestRecord } from "@/data-access/payment-requests";

interface RequestDetailProps {
  request: PaymentRequestRecord;
  viewerRole: RequestViewerRole;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getViewerRoleLabel(viewerRole: RequestViewerRole) {
  if (viewerRole === "recipient") {
    return "Recipient view";
  }

  if (viewerRole === "sender") {
    return "Sender view";
  }

  return "Request view";
}

function getActionPanelTitle(viewerRole: RequestViewerRole) {
  return viewerRole === "sender" ? "Manage request" : "Resolve request";
}

function getActionPanelCopy(viewerRole: RequestViewerRole) {
  if (viewerRole === "sender") {
    return "Senders can cancel a pending request before it is paid, declined, or expired. Terminal states stay visible here for both participants.";
  }

  return "Intended recipients can pay or decline while the request is still pending. Sender access stays read-only so both sides share the same canonical status.";
}

export function RequestDetail({
  request,
  viewerRole,
}: RequestDetailProps) {
  const sharePath = `/r/${request.id}`;
  const shareUrl = new URL(sharePath, getEnv().NEXT_PUBLIC_APP_URL).toString();
  const currencyLabel = formatCurrencyCodeLabel(request.currencyCode);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
      <Card className="border-white/70 bg-card/95 shadow-[0_18px_50px_rgba(83,59,30,0.1)]">
        <CardHeader className="gap-4 border-b border-border/70 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {getViewerRoleLabel(viewerRole)}
              </p>
              <CardTitle className="text-3xl tracking-[-0.05em]">
                {formatAmountFromCents(request.amountCents, request.currencyCode)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Currency {currencyLabel}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <dl className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Request ID
              </dt>
              <dd className="font-mono text-foreground">{request.id}</dd>
            </div>
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
            <div className="space-y-1">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Countdown
              </dt>
              <dd>
                <ExpirationCountdown expiresAt={request.expiresAt} />
              </dd>
            </div>
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

      <Card className="border-white/70 bg-card/90 shadow-[0_18px_50px_rgba(83,59,30,0.08)]">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.04em]">
            {getActionPanelTitle(viewerRole)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>{getActionPanelCopy(viewerRole)}</p>
          <RequestActions
            amountCents={request.amountCents}
            currencyCode={request.currencyCode}
            requestId={request.id}
            status={request.status}
            viewerRole={viewerRole}
          />
          {viewerRole === "sender" ? (
            <ShareLinkActions previewHref={sharePath} shareUrl={shareUrl} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
