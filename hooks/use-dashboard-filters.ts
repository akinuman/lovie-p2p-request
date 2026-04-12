"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { DashboardStatusValue } from "@/components/dashboard/dashboard-filters";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import type { DashboardFilterInput } from "@/lib/validation/requests";
import { buildDashboardFilterHref } from "@/use-cases/dashboard-query";

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

interface UseDashboardFiltersOptions {
  basePath: string;
  filters: DashboardFilterInput;
}

export function useDashboardFilters({
  basePath,
  filters,
}: UseDashboardFiltersOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(filters.q ?? "");
  const [statusValue, setStatusValue] = useState<DashboardStatusValue>(
    normalizeStatusValue(filters.status),
  );

  const lastSubmittedFilterKeyRef = useRef(
    getFilterSubmissionKey(filters.q ?? "", normalizeStatusValue(filters.status)),
  );

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
        status: nextStatusValue === "all" ? undefined : nextStatusValue,
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

  // Debounced search submission — skips when the local state already
  // matches either the applied URL filters or the last committed value.
  useDebouncedCallback(
    () => {
      const nextFilterKey = getFilterSubmissionKey(searchValue, statusValue);

      if (
        nextFilterKey === appliedFilterKey ||
        nextFilterKey === lastSubmittedFilterKeyRef.current
      ) {
        return;
      }

      commitFilters(searchValue, statusValue);
    },
    350,
    [searchValue, statusValue],
  );

  return {
    isPending,
    searchValue,
    statusValue,
    onSearchChange: handleSearchChange,
    onStatusChange: handleStatusChange,
    onClear: handleClear,
  };
}
