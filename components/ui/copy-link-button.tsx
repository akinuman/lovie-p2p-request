"use client";

import { Check, Copy } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  className?: string;
  url: string;
}

export function CopyLinkButton({ className, url }: CopyLinkButtonProps) {
  const { copied, copy, error, pending } = useCopyToClipboard();

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void copy(url)}
        disabled={pending}
        className={cn(
          "group flex w-full cursor-pointer flex-row items-center justify-between gap-3 overflow-hidden rounded-xl border border-border/40 bg-muted/20 p-2.5 shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <p className="min-w-0 truncate font-mono text-xs text-muted-foreground text-left">
          {url}
        </p>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-background">
          {copied ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <Copy className="h-4 w-4 opacity-70" />
          )}
        </div>
      </button>
      {error ? (
        <p className="text-sm text-destructive pl-1">{error}</p>
      ) : null}
    </div>
  );
}
