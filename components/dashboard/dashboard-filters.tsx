"use client";

import type { RequestStatus } from "@/drizzle/schema";
import { Search, X } from "lucide-react";

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
import type { DashboardFilterInput } from "@/lib/validation/requests";
import { hasActiveDashboardQueryState } from "@/use-cases/dashboard-query";

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

export type DashboardStatusValue = RequestStatus | "all";

interface DashboardFiltersProps {
  basePath: string;
  isPending: boolean;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: DashboardStatusValue) => void;
  queryLabel: string;
  searchValue: string;
  statusValue: DashboardStatusValue;
}

export function DashboardFilters({
  basePath,
  isPending,
  onClear,
  onSearchChange,
  queryLabel,
  searchValue,
  statusValue,
  onStatusChange,
}: DashboardFiltersProps) {
  const filters: DashboardFilterInput = {
    q: searchValue.trim() || undefined,
    status: statusValue === "all" ? undefined : statusValue,
  };
  const hasActiveQuery =
    hasActiveDashboardQueryState(filters) ||
    Boolean(searchValue.trim()) ||
    statusValue !== "all";

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
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${basePath}-status`}>Status</Label>
            <Select
              disabled={isPending}
              value={statusValue}
              onValueChange={(value) =>
                onStatusChange(value as DashboardStatusValue)
              }
            >
              <SelectTrigger
                id={`${basePath}-status`}
                className="h-10 w-full rounded-2xl"
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="rounded-xl"
                  >
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
              onClick={onClear}
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
