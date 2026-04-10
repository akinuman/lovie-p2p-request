import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestDetailNotFound() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          Request detail
        </p>
        <h1 className="text-4xl tracking-[-0.05em] text-foreground">
          This request is missing or unavailable.
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          The link may be invalid, the request may no longer be accessible to
          the signed-in user, or the record may have been removed from the demo
          database.
        </p>
      </div>

      <Card className="border-white/70 bg-card/90 shadow-[0_18px_50px_rgba(83,59,30,0.08)]">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.04em]">
            Next step
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Return to a dashboard to keep reviewing active requests or create a
            new one from the sender flow.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/outgoing">Go to outgoing</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/incoming">Go to incoming</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
