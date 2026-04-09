import type { RequestStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { getStatusLabel } from "@/lib/requests/status";

const STATUS_VARIANTS: Record<
  RequestStatus,
  "default" | "destructive" | "outline" | "secondary"
> = {
  CANCELLED: "outline",
  DECLINED: "destructive",
  EXPIRED: "outline",
  PAID: "secondary",
  PENDING: "default",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className="rounded-full px-3 py-1">
      {getStatusLabel(status)}
    </Badge>
  );
}
