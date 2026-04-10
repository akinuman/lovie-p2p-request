import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { IncomingList } from "@/components/dashboard/incoming-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  getIncomingDashboardRequestPage,
  serializeDashboardRequestPage,
} from "@/lib/use-cases/requests/dashboard";
import { parseDashboardQueryState } from "@/lib/request-flow/query-state";
import {
  type DashboardFilterInput,
} from "@/lib/validation/requests";

function readStringParam(
  value: string | string[] | undefined,
) {
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

export default async function IncomingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const resolvedSearchParams = await searchParams;
  const filters = parseDashboardQueryState(resolvedSearchParams);
  const initialPage = serializeDashboardRequestPage(
    await getIncomingDashboardRequestPage(currentUser, filters),
  );
  const updatedRequestId = readStringParam(resolvedSearchParams.updated);
  const requestError = readStringParam(resolvedSearchParams.requestError);
  const statusMessage = readStatusMessage(
    readStringParam(resolvedSearchParams.updatedStatus),
  );
  const currentPath = buildCurrentPath("/dashboard/incoming", filters);

  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-card/90 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
        <CardHeader>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Incoming dashboard
          </p>
          <CardTitle className="text-4xl tracking-[-0.05em]">
            Review and resolve every request sent your way.
          </CardTitle>
        </CardHeader>
      </Card>

      <DashboardFilters
        basePath="/dashboard/incoming"
        filters={filters}
        queryLabel="Search incoming requests"
      />

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

      <IncomingList
        currentPath={currentPath}
        filters={filters}
        hasActiveFilters={Boolean(filters.q || filters.status)}
        initialPage={initialPage}
        updatedRequestId={updatedRequestId}
      />
    </div>
  );
}
