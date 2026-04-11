import type { IncomingRequestScope } from "@/data-access/payment-requests";

import { IncomingList } from "@/components/dashboard/incoming-list";
import { OutgoingList } from "@/components/dashboard/outgoing-list";
import type { DashboardQueryState } from "@/use-cases/dashboard-query";
import {
  getDashboardRequestPage,
  serializeDashboardRequestPage,
} from "@/use-cases/read-dashboard";

interface DashboardResultsProps {
  filters: DashboardQueryState;
  shareBaseUrl?: string;
  user: IncomingRequestScope;
  variant: "incoming" | "outgoing";
}

export async function DashboardResults({
  filters,
  shareBaseUrl,
  user,
  variant,
}: DashboardResultsProps) {
  const initialPage = serializeDashboardRequestPage(
    await getDashboardRequestPage({ ...filters, user, variant }),
  );
  const hasActiveFilters = Boolean(filters.q || filters.status);

  if (variant === "incoming") {
    return (
      <IncomingList
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        initialPage={initialPage}
      />
    );
  }

  return (
    <OutgoingList
      filters={filters}
      hasActiveFilters={hasActiveFilters}
      initialPage={initialPage}
      shareBaseUrl={shareBaseUrl ?? ""}
    />
  );
}
