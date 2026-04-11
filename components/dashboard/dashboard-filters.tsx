"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import type { DashboardFilterInput } from "@/lib/validation/requests";
import { hasActiveDashboardQueryState } from "@/use-cases/dashboard-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const commitFilters = useCallback(
    (nextFilters: DashboardFilterInput) => {
      const url = new URL(basePath, "http://localhost");

      if (nextFilters.q) {
        url.searchParams.set("q", nextFilters.q);
      }

      if (nextFilters.status) {
        url.searchParams.set("status", nextFilters.status);
      }

      startTransition(() => {
        router.replace(`${url.pathname}${url.search}`, { scroll: false });
      });
    },
    [basePath, router],
  );

  useEffect(() => {
    setSearchValue(filters.q ?? "");
    setStatusValue(filters.status ?? "all");
  }, [filters.q, filters.status]);

  function handleClear() {
    setSearchValue("");
    setStatusValue("all");
    commitFilters({});
  }

  function handleStatusChange(nextStatus: string) {
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
  }, [commitFilters, filters.q, searchValue, statusValue]);

  return (
    <Card className="border-white/70 bg-card/90 shadow-[0_18px_50px_rgba(83,59,30,0.06)]">
      <CardContent className="pt-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <div className="space-y-2">
            <Label htmlFor={`${basePath}-q`}>{queryLabel}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={`${basePath}-q`}
                value={searchValue}
                placeholder="Search by request id, contact, or note"
                className="pl-9 rounded-2xl"
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${basePath}-status`}>Status</Label>
            <Select value={statusValue} onValueChange={handleStatusChange}>
              <SelectTrigger id={`${basePath}-status`} className="h-10 w-full rounded-2xl">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-xl">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 self-end sm:flex-row lg:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full px-4"
              disabled={!hasActiveQuery || isPending}
              onClick={handleClear}
            >
              <X className="mr-1.5 h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
