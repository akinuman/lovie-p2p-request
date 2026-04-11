import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { IncomingList } from "@/components/dashboard/incoming-list";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getDashboardPageReadResult } from "@/use-cases/read-dashboard";

export default async function IncomingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const resolvedSearchParams = await searchParams;
  const pageState = await getDashboardPageReadResult({
    searchParams: resolvedSearchParams,
    user: currentUser,
    variant: "incoming",
  });

  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-card/90 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
        <CardHeader>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Incoming dashboard
          </p>
          <CardTitle className="text-3xl tracking-[-0.05em] sm:text-4xl">
            Review and resolve every request sent your way.
          </CardTitle>
        </CardHeader>
      </Card>

      <DashboardFilters
        basePath="/dashboard/incoming"
        filters={pageState.filters}
        queryLabel="Search incoming requests"
      />

      <IncomingList
        filters={pageState.filters}
        hasActiveFilters={Boolean(pageState.filters.q || pageState.filters.status)}
        initialPage={pageState.initialPage}
      />
    </div>
  );
}
