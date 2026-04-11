import { Suspense } from "react";

import { DashboardResults } from "@/components/dashboard/dashboard-results";
import { DashboardResultsLoading } from "@/components/dashboard/dashboard-results-loading";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/route-guard";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getEnv } from "@/lib/env";
import { parseDashboardQueryState } from "@/use-cases/dashboard-query";

export default async function OutgoingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const resolvedSearchParams = await searchParams;
  const filters = parseDashboardQueryState(resolvedSearchParams);
  const shareBaseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  return (
    <DashboardShell
      basePath={AUTHENTICATED_HOME_PATH}
      filters={filters}
      queryLabel="Search outgoing requests"
    >
      <Suspense fallback={<DashboardResultsLoading />}>
        <DashboardResults
          filters={filters}
          shareBaseUrl={shareBaseUrl}
          user={currentUser}
          variant="outgoing"
        />
      </Suspense>
    </DashboardShell>
  );
}
