"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          Request detail
        </p>
        <h1 className="text-4xl tracking-[-0.05em] text-foreground">
          We couldn&apos;t load this request right now.
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          Try the detail page again, or head back to a dashboard while the app
          refreshes the latest state.
        </p>
      </div>

      <Card className="border-destructive/30 bg-destructive/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.04em] text-destructive">
            Something interrupted this request lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-destructive">
          <p>{error.message || "Unknown request detail error."}</p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={reset} className="rounded-full">
              Try again
            </Button>
            <Button asChild type="button" variant="outline" className="rounded-full">
              <Link href="/dashboard/incoming">Back to incoming</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
