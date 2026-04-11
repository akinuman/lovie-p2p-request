"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { DashboardFilters, type DashboardStatusValue } from "@/components/dashboard/dashboard-filters";
import { IncomingList } from "@/components/dashboard/incoming-list";
import { OutgoingList } from "@/components/dashboard/outgoing-list";
import { DashboardResultsLoading } from "@/components/dashboard/dashboard-results-loading";
import type { DashboardFilterInput } from "@/lib/validation/requests";
import type { DashboardRequestPagePayload } from "@/use-cases/read-dashboard";
import { buildDashboardFilterHref } from "@/use-cases/dashboard-query";

interface DashboardShellProps {
  basePath: string;
  filters: DashboardFilterInput;
  initialPage: DashboardRequestPagePayload;
  queryLabel: string;
  shareBaseUrl?: string;
  variant: "incoming" | "outgoing";
}

function normalizeStatusValue(
  status: DashboardFilterInput["status"],
): DashboardStatusValue {
  return status ?? "all";
}

function getFilterSubmissionKey(
  searchValue: string,
  statusValue: DashboardStatusValue,
) {
  return JSON.stringify({
    q: searchValue.trim(),
    status: statusValue,
  });
}

export function DashboardShell({
  basePath,
  filters,
  initialPage,
  queryLabel,
  shareBaseUrl,
  variant,
}: DashboardShellProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(filters.q ?? "");
  const [statusValue, setStatusValue] = useState<DashboardStatusValue>(
    normalizeStatusValue(filters.status),
  );
  const lastSubmittedFilterKeyRef = useRef(
    getFilterSubmissionKey(filters.q ?? "", normalizeStatusValue(filters.status)),
  );
  const hasActiveFilters = Boolean(filters.q || filters.status);
  const appliedSearchValue = filters.q ?? "";
  const appliedStatusValue = normalizeStatusValue(filters.status);
  const appliedFilterKey = useMemo(
    () => getFilterSubmissionKey(appliedSearchValue, appliedStatusValue),
    [appliedSearchValue, appliedStatusValue],
  );

  useEffect(() => {
    setSearchValue(appliedSearchValue);
    setStatusValue(appliedStatusValue);
    lastSubmittedFilterKeyRef.current = appliedFilterKey;
  }, [appliedFilterKey, appliedSearchValue, appliedStatusValue]);

  const commitFilters = useCallback(
    (nextSearchValue: string, nextStatusValue: DashboardStatusValue) => {
      const nextFilters: DashboardFilterInput = {
        q: nextSearchValue.trim() || undefined,
        status:
          nextStatusValue === "all"
            ? undefined
            : nextStatusValue,
      };

      lastSubmittedFilterKeyRef.current = getFilterSubmissionKey(
        nextFilters.q ?? "",
        nextStatusValue,
      );

      startTransition(() => {
        router.replace(buildDashboardFilterHref(basePath, nextFilters), {
          scroll: false,
        });
      });
    },
    [basePath, router],
  );

  const handleSearchChange = useCallback((nextValue: string) => {
    setSearchValue(nextValue);
  }, []);

  const handleStatusChange = useCallback(
    (nextStatusValue: DashboardStatusValue) => {
      setStatusValue(nextStatusValue);
      commitFilters(searchValue, nextStatusValue);
    },
    [commitFilters, searchValue],
  );

  const handleClear = useCallback(() => {
    setSearchValue("");
    setStatusValue("all");
    commitFilters("", "all");
  }, [commitFilters]);

  useEffect(() => {
    const nextFilterKey = getFilterSubmissionKey(searchValue, statusValue);

    if (
      nextFilterKey === appliedFilterKey ||
      nextFilterKey === lastSubmittedFilterKeyRef.current
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      commitFilters(searchValue, statusValue);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [appliedFilterKey, commitFilters, searchValue, statusValue]);

  return (
    <div className="space-y-6">
      <DashboardFilters
        basePath={basePath}
        isPending={isPending}
        onClear={handleClear}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        queryLabel={queryLabel}
        searchValue={searchValue}
        statusValue={statusValue}
      />

      {isPending ? (
        <DashboardResultsLoading />
      ) : variant === "incoming" ? (
        <IncomingList
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          initialPage={initialPage}
        />
      ) : (
        <OutgoingList
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          initialPage={initialPage}
          shareBaseUrl={shareBaseUrl ?? ""}
        />
      )}
    </div>
  );
}
