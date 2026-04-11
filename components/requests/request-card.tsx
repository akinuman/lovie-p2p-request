"use client";

import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { RequestActions } from "@/components/requests/request-actions";
import { StatusBadge } from "@/components/requests/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentRequestRecord } from "@/data-access/payment-requests";
import { formatAmountFromCents } from "@/lib/money/format-amount";
import {
  createAsyncActionFeedbackState,
  createPendingAsyncActionFeedbackState,
  initialAsyncActionFeedbackState,
} from "@/use-cases/async-action-feedback";
import type { DashboardRequestCardPayload } from "@/use-cases/read-dashboard";

interface RequestCardProps {
  request: DashboardRequestCardPayload | PaymentRequestRecord;
  shareUrl: string;
  variant?: "outgoing" | "share";
}

function isDashboardRequestCardPayload(
  request: DashboardRequestCardPayload | PaymentRequestRecord,
): request is DashboardRequestCardPayload {
  return typeof request.createdAt === "string";
}

function formatDateTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getFormattedAmount(
  request: DashboardRequestCardPayload | PaymentRequestRecord,
) {
  if (isDashboardRequestCardPayload(request)) {
    return request.formattedAmount;
  }

  return formatAmountFromCents(request.amountCents, request.currencyCode);
}

function getRecipientLabel(
  request: DashboardRequestCardPayload | PaymentRequestRecord,
) {
  if (isDashboardRequestCardPayload(request)) {
    return request.recipientLabel ?? "Unknown recipient";
  }

  return request.recipientContactValue;
}

function getSenderLabel(
  request: DashboardRequestCardPayload | PaymentRequestRecord,
) {
  if (isDashboardRequestCardPayload(request)) {
    return request.senderLabel ?? "Unknown sender";
  }

  return request.sender.email;
}

function getNoteText(
  request: DashboardRequestCardPayload | PaymentRequestRecord,
) {
  if (isDashboardRequestCardPayload(request)) {
    return request.notePreview;
  }

  return request.note?.trim() || null;
}

export function RequestCard({
  request,
  shareUrl,
  variant = "outgoing",
}: RequestCardProps) {
  const isShareVariant = variant === "share";
  const [copyFeedback, setCopyFeedback] = useState(
    initialAsyncActionFeedbackState,
  );
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const recipientLabel = getRecipientLabel(request);
  const senderLabel = getSenderLabel(request);
  const noteText = getNoteText(request);

  async function handleCopyLink() {
    setCopyMessage(null);
    setCopyFeedback(createPendingAsyncActionFeedbackState());

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopyFeedback(initialAsyncActionFeedbackState);
      setCopyMessage("Share link copied.");
      setTimeout(() => setCopyMessage(null), 2500);
    } catch {
      setCopyFeedback(
        createAsyncActionFeedbackState({
          errorMessage:
            "We couldn’t copy the share link. Copy it manually below.",
        }),
      );
    }
  }

  return (
    <Card className="overflow-hidden border-white/70 bg-card/95 shadow-[0_18px_50px_rgba(83,59,30,0.1)]">
      <CardHeader className="gap-4 border-b border-border/70 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Request #{request.id.slice(-6)}
            </p>
            <CardTitle className="text-2xl tracking-[-0.04em]">
              {getFormattedAmount(request)}
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
              <dd className="text-foreground">{senderLabel}</dd>
            </div>
          ) : (
            <div className="space-y-1">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Recipient
              </dt>
              <dd className="text-foreground">{recipientLabel}</dd>
            </div>
          )}
          <div className="space-y-1">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Created
            </dt>
            <dd className="text-foreground">
              {formatDateTime(request.createdAt)}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
              Expires
            </dt>
            <dd className="text-foreground">
              {formatDateTime(request.expiresAt)}
            </dd>
          </div>
          {!isShareVariant ? (
            <div className="space-y-1">
              <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">
                Share link
              </dt>
              <dd className="space-y-2">
                <Button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={copyFeedback.pending}
                  className="group flex w-full cursor-pointer flex-row items-center justify-between gap-2.5 rounded-xl border border-border/40 bg-muted/10 p-2 shadow-sm transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <p className="truncate font-mono text-xs text-muted-foreground text-left">
                    {shareUrl}
                  </p>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-background/80">
                    {copyMessage ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 opacity-70" />
                    )}
                  </div>
                </Button>
                {copyFeedback.errorMessage ? (
                  <p className="text-sm text-destructive pl-1">
                    {copyFeedback.errorMessage}
                  </p>
                ) : null}
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

        {!isShareVariant ? (
          <div className="flex flex-col gap-3 border-t border-border/70 pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/requests/${request.id}`}>View details</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/r/${request.id}`}>Preview</Link>
                </Button>
              </div>
              <RequestActions
                requestId={request.id}
                status={request.status}
                viewerRole="sender"
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
