import Link from "next/link";

import { RequestCreatedDialogHost } from "@/components/requests/request-created-dialog-host";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getEnv } from "@/lib/env";

export default function OutgoingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shareBaseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  return (
    <div className="space-y-6">
      <RequestCreatedDialogHost shareBaseUrl={shareBaseUrl} />

      <Card className="border-white/70 bg-card/90 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
              Outgoing dashboard
            </p>
            <CardTitle className="text-3xl tracking-[-0.05em] sm:text-4xl">
              Every request you&apos;ve sent, all in one place.
            </CardTitle>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/requests/new">Create request</Link>
          </Button>
        </CardHeader>
      </Card>

      {children}
    </div>
  );
}
