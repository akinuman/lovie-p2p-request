import Link from "next/link";

import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { OutgoingList } from "@/components/dashboard/outgoing-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getEnv } from "@/lib/env";
import {
  getOutgoingDashboardRequestPage,
  serializeDashboardRequestPage,
} from "@/lib/use-cases/requests/dashboard";
import { parseDashboardQueryState } from "@/lib/request-flow/query-state";
import {
  type DashboardFilterInput,
} from "@/lib/validation/requests";

function readStringParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readStatusMessage(status?: string) {
  if (!status) {
    return null;
  }

  return `Request updated to ${status}.`;
}

function buildCurrentPath(
  basePath: string,
  filters: DashboardFilterInput,
) {
  const url = new URL(basePath, "http://localhost");

  if (filters.q) {
    url.searchParams.set("q", filters.q);
  }

  if (filters.status) {
    url.searchParams.set("status", filters.status);
  }

  return `${url.pathname}${url.search}`;
}

export default async function OutgoingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const resolvedSearchParams = await searchParams;
  const filters = parseDashboardQueryState(resolvedSearchParams);
  const initialPage = serializeDashboardRequestPage(
    await getOutgoingDashboardRequestPage(currentUser.id, filters),
  );
  const createdRequestId = readStringParam(resolvedSearchParams.created);
  const createdRequest = initialPage.items.find((request) => request.id === createdRequestId);
  const statusMessage = readStatusMessage(
    readStringParam(resolvedSearchParams.updatedStatus),
  );
  const requestError = readStringParam(resolvedSearchParams.requestError);
  const currentPath = buildCurrentPath("/dashboard/outgoing", filters);
  const shareBaseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-card/90 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
              Outgoing dashboard
            </p>
            <CardTitle className="text-4xl tracking-[-0.05em]">
              Every request you&apos;ve sent, all in one place.
            </CardTitle>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/requests/new">Create another request</Link>
          </Button>
        </CardHeader>
      </Card>

      <DashboardFilters
        basePath="/dashboard/outgoing"
        filters={filters}
        queryLabel="Search outgoing requests"
      />

      {createdRequest ? (
        <Card className="border-primary/25 bg-primary/5 shadow-none">
          <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Request created and ready to share.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Share link:{" "}
                <Link
                  href={`${shareBaseUrl}${createdRequest.shareUrl}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {`${shareBaseUrl}${createdRequest.shareUrl}`}
                </Link>
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={createdRequest.shareUrl ?? `/r/${createdRequest.id}`}>Preview share page</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {requestError ? (
        <Card className="border-destructive/30 bg-destructive/10 shadow-none">
          <CardContent className="pt-6 text-sm leading-6 text-destructive">
            {requestError}
          </CardContent>
        </Card>
      ) : null}

      {statusMessage ? (
        <Card className="border-primary/25 bg-primary/5 shadow-none">
          <CardContent className="pt-6 text-sm leading-6 text-foreground">
            {statusMessage}
          </CardContent>
        </Card>
      ) : null}

      <OutgoingList
        createdRequestId={createdRequestId}
        currentPath={currentPath}
        filters={filters}
        hasActiveFilters={Boolean(filters.q || filters.status)}
        initialPage={initialPage}
        shareBaseUrl={shareBaseUrl}
      />
    </div>
  );
}
