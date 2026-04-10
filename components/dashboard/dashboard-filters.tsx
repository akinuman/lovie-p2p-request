"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";

import type { DashboardFilterInput } from "@/lib/validation/requests";
import { hasActiveDashboardQueryState } from "@/lib/request-flow/query-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const STATUS_OPTIONS: Array<{
  label: string;
  value: NonNullable<DashboardFilterInput["status"]> | "all";
}> = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Paid", value: "Paid" },
  { label: "Declined", value: "Declined" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Expired", value: "Expired" },
];

interface DashboardFiltersProps {
  basePath: string;
  filters: DashboardFilterInput;
  queryLabel: string;
}

export function DashboardFilters({
  basePath,
  filters,
  queryLabel,
}: DashboardFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(filters.q ?? "");
  const [statusValue, setStatusValue] = useState(filters.status ?? "all");
  const hasActiveQuery =
    hasActiveDashboardQueryState(filters) ||
    Boolean(searchValue.trim()) ||
    statusValue !== "all";

  useEffect(() => {
    setSearchValue(filters.q ?? "");
    setStatusValue(filters.status ?? "all");
  }, [filters.q, filters.status]);

  const buildDashboardUrl = useCallback((nextFilters: DashboardFilterInput) => {
    const url = new URL(basePath, "http://localhost");

    if (nextFilters.q) {
      url.searchParams.set("q", nextFilters.q);
    }

    if (nextFilters.status) {
      url.searchParams.set("status", nextFilters.status);
    }

    return `${url.pathname}${url.search}`;
  }, [basePath]);

  const commitFilters = useCallback((nextFilters: DashboardFilterInput) => {
    startTransition(() => {
      router.replace(buildDashboardUrl(nextFilters), { scroll: false });
    });
  }, [buildDashboardUrl, router]);

  function handleClear() {
    setSearchValue("");
    setStatusValue("all");
    commitFilters({});
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextStatus = event.target.value;
    const normalizedSearch = searchValue.trim();

    setStatusValue(nextStatus);
    commitFilters({
      q: normalizedSearch || undefined,
      status:
        nextStatus === "all"
          ? undefined
          : (nextStatus as DashboardFilterInput["status"]),
    });
  }

  useEffect(() => {
    const normalizedSearch = searchValue.trim();
    const currentSearch = filters.q ?? "";

    if (normalizedSearch === currentSearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      commitFilters({
        q: normalizedSearch || undefined,
        status:
          statusValue === "all"
            ? undefined
            : (statusValue as DashboardFilterInput["status"]),
      });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [commitFilters, searchValue, statusValue, filters.q]);

  return (
    <Card className="border-white/70 bg-card/90 shadow-[0_18px_50px_rgba(83,59,30,0.06)]">
      <CardContent className="pt-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <div className="space-y-2">
            <Label htmlFor={`${basePath}-q`}>{queryLabel}</Label>
            <Input
              id={`${basePath}-q`}
              value={searchValue}
              placeholder="Search by request id, contact, or note"
              className="rounded-2xl"
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${basePath}-status`}>Status</Label>
            <select
              id={`${basePath}-status`}
              value={statusValue}
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
              onChange={handleStatusChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 self-end sm:flex-row lg:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={!hasActiveQuery || isPending}
              onClick={handleClear}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
