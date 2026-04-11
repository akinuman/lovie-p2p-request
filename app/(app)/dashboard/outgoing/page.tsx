import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RequestCreatedDialogHost } from "@/components/requests/request-created-dialog-host";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/route-guard";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getEnv } from "@/lib/env";
import {
  getDashboardPageReadResult,
} from "@/use-cases/read-dashboard";

export default async function OutgoingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const resolvedSearchParams = await searchParams;
  const pageState = await getDashboardPageReadResult({
    searchParams: resolvedSearchParams,
    user: currentUser,
    variant: "outgoing",
  });
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

      <DashboardShell
        basePath={AUTHENTICATED_HOME_PATH}
        filters={pageState.filters}
        initialPage={pageState.initialPage}
        queryLabel="Search outgoing requests"
        shareBaseUrl={shareBaseUrl}
        variant="outgoing"
      />
    </div>
  );
}
