import Link from "next/link";

import type { DashboardFilterInput } from "@/lib/validation/requests";
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
  return (
    <Card className="border-white/70 bg-card/90 shadow-[0_18px_50px_rgba(83,59,30,0.06)]">
      <CardContent className="pt-6">
        <form method="get" action={basePath} className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <div className="space-y-2">
            <Label htmlFor={`${basePath}-q`}>{queryLabel}</Label>
            <Input
              id={`${basePath}-q`}
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Search by request id, contact, or note"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${basePath}-status`}>Status</Label>
            <select
              id={`${basePath}-status`}
              name="status"
              defaultValue={filters.status ?? "all"}
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 self-end sm:flex-row lg:justify-end">
            <Button type="submit" className="rounded-full">
              Apply filters
            </Button>
            <Button asChild type="button" variant="outline" className="rounded-full">
              <Link href={basePath}>Clear</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
