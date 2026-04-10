import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { IncomingList } from "@/components/dashboard/incoming-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getIncomingRequestsForUser } from "@/lib/requests/queries";
import {
  dashboardFilterSchema,
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

function readDashboardFilters(
  searchParams: Record<string, string | string[] | undefined>,
): DashboardFilterInput {
  const parsed = dashboardFilterSchema.safeParse({
    q: readStringParam(searchParams.q),
    status: readStringParam(searchParams.status),
  });

  if (!parsed.success) {
    return {};
  }

  return parsed.data;
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
  const filters = readDashboardFilters(resolvedSearchParams);
  const requests = await getIncomingRequestsForUser(currentUser, filters);
  const updatedRequestId = readStringParam(resolvedSearchParams.updated);
  const requestError = readStringParam(resolvedSearchParams.requestError);
  const statusMessage = readStatusMessage(
    readStringParam(resolvedSearchParams.updatedStatus),
  );
  const currentPath = buildCurrentPath("/dashboard/incoming", filters);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-white/70 bg-card/90 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
          <CardHeader className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
              Incoming dashboard
            </p>
            <CardTitle className="text-4xl tracking-[-0.05em]">
              Review and resolve every request sent your way.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Requests addressed to your email or saved phone number appear
              here with their latest lifecycle state, note, and actions.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-gradient-to-br from-accent/70 via-card to-card shadow-[0_18px_60px_rgba(20,83,45,0.08)]">
          <CardHeader>
            <CardTitle className="text-xl tracking-[-0.04em]">
              Recipient protections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Email and phone recipients are matched against your signed-in
              account before any action is allowed.
            </p>
            <p>
              Open the detail page to inspect the live expiration countdown
              before you pay or decline.
            </p>
          </CardContent>
        </Card>
      </section>

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
        hasActiveFilters={Boolean(filters.q || filters.status)}
        requests={requests}
        updatedRequestId={updatedRequestId}
      />
    </div>
  );
}
