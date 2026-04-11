"use client";

import Link from "next/link";
import { useState } from "react";

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
      <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Share link
        </p>
        <p className="mt-2 break-all font-mono text-xs text-foreground">
          {shareUrl}
        </p>
      </div>

      {copyFeedback.errorMessage ? (
        <p className="text-sm text-destructive">{copyFeedback.errorMessage}</p>
      ) : null}

      {copyMessage ? (
        <p className="text-sm text-primary">{copyMessage}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {previewHref ? (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={previewHref}>Preview</Link>
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          loading={copyFeedback.pending}
          onClick={handleCopyLink}
        >
          Copy link
        </Button>
      </div>
    </div>
  );
}
