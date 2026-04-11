import { Suspense } from "react";

import { DashboardResults } from "@/components/dashboard/dashboard-results";
import { DashboardResultsLoading } from "@/components/dashboard/dashboard-results-loading";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { parseDashboardQueryState } from "@/use-cases/dashboard-query";

export default async function IncomingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const resolvedSearchParams = await searchParams;
  const filters = parseDashboardQueryState(resolvedSearchParams);

  return (
    <DashboardShell
      basePath="/dashboard/incoming"
      filters={filters}
      queryLabel="Search incoming requests"
    >
      <Suspense fallback={<DashboardResultsLoading />}>
        <DashboardResults
          filters={filters}
          user={currentUser}
          variant="incoming"
        />
      </Suspense>
    </DashboardShell>
  );
}
