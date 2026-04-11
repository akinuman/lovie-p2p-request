import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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
    <DashboardShell
      basePath="/dashboard/incoming"
      filters={pageState.filters}
      initialPage={pageState.initialPage}
      queryLabel="Search incoming requests"
      variant="incoming"
    />
  );
}
