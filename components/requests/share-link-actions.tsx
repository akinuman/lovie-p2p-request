"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  createAsyncActionFeedbackState,
  createPendingAsyncActionFeedbackState,
  initialAsyncActionFeedbackState,
} from "@/lib/use-cases/requests/async-action-feedback";

interface ShareLinkActionsProps {
  previewHref?: string;
  shareUrl: string;
}

export function ShareLinkActions({
  previewHref,
  shareUrl,
}: ShareLinkActionsProps) {
  const [copyFeedback, setCopyFeedback] = useState(
    initialAsyncActionFeedbackState,
  );
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

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
          errorMessage: "We couldn’t copy the share link. Copy it manually below.",
        }),
      );
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Share link
        </p>
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={copyFeedback.pending}
          className="group flex w-full cursor-pointer flex-row items-center justify-between gap-4 rounded-xl border border-border/40 bg-muted/20 p-2.5 shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <p className="truncate font-mono text-xs text-muted-foreground text-left">
            {shareUrl}
          </p>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-background">
            {copyMessage ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 opacity-70" />}
          </div>
        </button>
      </div>

      {copyFeedback.errorMessage ? (
        <p className="text-sm text-destructive pl-1">{copyFeedback.errorMessage}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {previewHref ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={previewHref}>Preview</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
