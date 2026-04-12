"use client";

import type { ReactNode } from "react";

import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { DashboardResultsLoading } from "@/components/dashboard/dashboard-results-loading";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import type { DashboardFilterInput } from "@/lib/validation/requests";

interface DashboardShellProps {
  basePath: string;
  children: ReactNode;
  filters: DashboardFilterInput;
  queryLabel: string;
}

export function DashboardShell({
  basePath,
  children,
  filters,
  queryLabel,
}: DashboardShellProps) {
  const {
    isPending,
    onClear,
    onSearchChange,
    onStatusChange,
    searchValue,
    statusValue,
  } = useDashboardFilters({ basePath, filters });

  return (
    <div className="space-y-6">
      <DashboardFilters
        basePath={basePath}
        isPending={isPending}
        onClear={onClear}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        queryLabel={queryLabel}
        searchValue={searchValue}
        statusValue={statusValue}
      />

      {isPending ? <DashboardResultsLoading /> : children}
    </div>
  );
}
