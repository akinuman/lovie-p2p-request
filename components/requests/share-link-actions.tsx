"use client";

import Link from "next/link";

import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { Button } from "@/components/ui/button";

interface ShareLinkActionsProps {
  previewHref?: string;
  shareUrl: string;
}

export function ShareLinkActions({
  previewHref,
  shareUrl,
}: ShareLinkActionsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Share link
        </p>
        <CopyLinkButton url={shareUrl} />
      </div>

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
