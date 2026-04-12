"use client";

import Link from "next/link";

import { RequestActions } from "@/components/requests/request-actions";
import type { PublicShareSummary } from "@/components/requests/request-share-summary";
import { StatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { formatDateTime } from "@/lib/format-date";
import type { DashboardRequestCardPayload } from "@/use-cases/read-dashboard";

type RequestCardProps =
  | {
      request: DashboardRequestCardPayload;
      shareUrl: string;
      variant?: "outgoing";
      summary?: never;
    }
  | {
      summary: PublicShareSummary;
      shareUrl: string;
      variant: "share";
      request?: never;
    };

export function RequestCard(props: RequestCardProps) {
  const { shareUrl, variant = "outgoing" } = props;
  const isShareVariant = variant === "share";

  // Extract display values from whichever data shape we received.
  // We check props.variant directly (not a derived boolean) so TypeScript
  // narrows the discriminated union and knows which fields exist.
  const id =
    props.variant === "share" ? props.summary.id : props.request.id;
  const status =
    props.variant === "share" ? props.summary.status : props.request.status;
  const createdAt =
    props.variant === "share"
      ? props.summary.createdAt
      : props.request.createdAt;
  const expiresAt =
    props.variant === "share"
      ? props.summary.expiresAt
      : props.request.expiresAt;
  const noteText =
    props.variant === "share"
      ? (props.summary.note?.trim() || null)
      : props.request.notePreview;
  const formattedAmount =
    props.variant === "share"
      ? `$${(props.summary.amountCents / 100).toFixed(2)}`
      : props.request.formattedAmount;

  // Share variant shows sender, outgoing shows recipient
  const contactLabel =
    props.variant === "share"
      ? props.summary.senderLabel
      : (props.request.recipientLabel ?? "Unknown recipient");
  const contactRoleLabel = isShareVariant ? "Requested by" : "Recipient";

  return (
    <Card className="overflow-hidden border-white/70 bg-card/95 shadow-[0_18px_50px_rgba(83,59,30,0.1)]">
      <CardHeader className="gap-4 border-b border-border/70 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Request #{id.slice(-6)}
            </p>
            <CardTitle className="text-2xl tracking-[-0.04em]">
              {formattedAmount}
            </CardTitle>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        <dl className="grid gap-4 text-sm leading-6 text-muted-foreground sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              {contactRoleLabel}
            </dt>
            <dd className="text-foreground">{contactLabel}</dd>
          </div>
          <div className="space-y-1">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Created
            </dt>
            <dd className="text-foreground">{formatDateTime(createdAt)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Expires
            </dt>
            <dd className="text-foreground">{formatDateTime(expiresAt)}</dd>
          </div>
          {!isShareVariant ? (
            <div className="min-w-0 space-y-1 sm:col-span-2">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Share link
              </dt>
              <dd className="min-w-0">
                <CopyLinkButton url={shareUrl} />
              </dd>
            </div>
          ) : null}
        </dl>

        {noteText ? (
          <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Note
            </p>
            <p className="mt-2 text-sm leading-6 text-foreground">{noteText}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/80 bg-background/40 p-4 text-sm text-muted-foreground">
            No note was added to this request.
          </div>
        )}

        {props.variant !== "share" ? (
          <div className="flex flex-col gap-3 border-t border-border/70 pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/requests/${id}`}>View details</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/r/${id}`}>Preview</Link>
                </Button>
              </div>
              <RequestActions
                requestId={id}
                status={props.request.status}
                viewerRole="sender"
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
