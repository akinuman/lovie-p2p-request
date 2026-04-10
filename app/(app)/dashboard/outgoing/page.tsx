import Link from "next/link";

import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { OutgoingList } from "@/components/dashboard/outgoing-list";
import { RequestCreatedDialog } from "@/components/requests/request-created-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/route-guard";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getEnv } from "@/lib/env";
import {
  getCreatedRequestForUser,
  getDashboardPageReadResult,
} from "@/lib/use-cases/requests/read";

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
  const createdRequest = await getCreatedRequestForUser(
    pageState.createdRequestId,
    currentUser,
  );
  const shareBaseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  return (
    <div className="space-y-6">
      {createdRequest ? (
        <RequestCreatedDialog
          amountCents={createdRequest.amountCents}
          currencyCode={createdRequest.currencyCode}
          currentPath={pageState.currentPath}
          note={createdRequest.note}
          recipientLabel={createdRequest.recipientContactValue}
          requestId={createdRequest.id}
          shareBaseUrl={shareBaseUrl}
          sharePath={`/r/${createdRequest.id}`}
        />
      ) : null}

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

      <DashboardFilters
        basePath={AUTHENTICATED_HOME_PATH}
        filters={pageState.filters}
        queryLabel="Search outgoing requests"
      />

      {pageState.requestError ? (
        <Card className="border-destructive/30 bg-destructive/10 shadow-none">
          <CardContent className="pt-6 text-sm leading-6 text-destructive">
            {pageState.requestError}
          </CardContent>
        </Card>
      ) : null}

      {pageState.statusMessage ? (
        <Card className="border-primary/25 bg-primary/5 shadow-none">
          <CardContent className="pt-6 text-sm leading-6 text-foreground">
            {pageState.statusMessage}
          </CardContent>
        </Card>
      ) : null}

      <OutgoingList
        createdRequestId={pageState.createdRequestId}
        currentPath={pageState.currentPath}
        filters={pageState.filters}
        hasActiveFilters={Boolean(pageState.filters.q || pageState.filters.status)}
        initialPage={pageState.initialPage}
        shareBaseUrl={shareBaseUrl}
      />
    </div>
  );
}
