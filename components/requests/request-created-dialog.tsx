"use client";

import { useState } from "react";

import { ShareLinkActions } from "@/components/requests/share-link-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatAmountFromCents,
  formatCurrencyCodeLabel,
} from "@/lib/money/format-amount";
import { buildShareUrl } from "@/lib/url";

interface RequestCreatedDialogProps {
  amountCents: number;
  currencyCode: string;
  note?: string | null;
  onClose?: () => void;
  recipientLabel: string;
  requestId: string;
  shareBaseUrl: string;
  sharePath: string;
}

export function RequestCreatedDialog({
  amountCents,
  currencyCode,
  note,
  onClose,
  recipientLabel,
  requestId,
  shareBaseUrl,
  sharePath,
}: RequestCreatedDialogProps) {
  const [open, setOpen] = useState(true);
  const shareUrl = buildShareUrl(shareBaseUrl, sharePath);
  const formattedAmount = formatAmountFromCents(amountCents, currencyCode);
  const currencyLabel = formatCurrencyCodeLabel(currencyCode);
  const trimmedNote = note?.trim();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      onClose?.();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl border-white/70 bg-card/95 p-0 shadow-[0_24px_80px_rgba(83,59,30,0.16)]">
        <div className="min-w-0 space-y-6 overflow-hidden p-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Request created
            </div>
            <DialogTitle className="text-3xl tracking-[-0.04em]">
              Your request is ready to share.
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 rounded-[1.75rem] border border-border/70 bg-background/70 p-5 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Amount
              </p>
              <p className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
                {formattedAmount}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Currency
              </p>
              <p className="text-sm text-foreground">{currencyLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Recipient
              </p>
              <p className="text-sm text-foreground">{recipientLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Request ID
              </p>
              <p className="break-all font-mono text-xs text-foreground">
                {requestId}
              </p>
            </div>
          </div>

          {trimmedNote ? (
            <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Note
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {trimmedNote}
              </p>
            </div>
          ) : null}

          <ShareLinkActions shareUrl={shareUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
