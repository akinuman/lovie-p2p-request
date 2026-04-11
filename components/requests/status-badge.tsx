import type { RequestStatus } from "@/drizzle/schema";

import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/use-cases/request-status";

const STATUS_VARIANTS: Record<
  RequestStatus,
  "default" | "destructive" | "outline" | "secondary"
> = {
  Cancelled: "outline",
  Declined: "destructive",
  Expired: "outline",
  Paid: "secondary",
  Pending: "default",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className="rounded-full px-3 py-1">
      {getStatusLabel(status)}
    </Badge>
  );
}
