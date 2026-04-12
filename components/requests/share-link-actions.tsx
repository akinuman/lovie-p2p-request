"use client";

import { CopyLinkButton } from "@/components/ui/copy-link-button";

interface ShareLinkActionsProps {
  shareUrl: string;
}

export function ShareLinkActions({ shareUrl }: ShareLinkActionsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Share link
        </p>
        <CopyLinkButton url={shareUrl} />
      </div>
    </div>
  );
}
