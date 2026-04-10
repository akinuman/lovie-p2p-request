import Link from "next/link";

import type { PaymentRequestRecord } from "@/lib/requests/queries";
import { RequestActions } from "@/components/requests/request-actions";
import { RequestCard } from "@/components/requests/request-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutgoingListProps {
  createdRequestId?: string;
  currentPath: string;
  hasActiveFilters?: boolean;
  requests: PaymentRequestRecord[];
  shareBaseUrl: string;
}

export function OutgoingList({
  createdRequestId,
  currentPath,
  hasActiveFilters = false,
  requests,
  shareBaseUrl,
}: OutgoingListProps) {
  if (requests.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.04em]">
            {hasActiveFilters
              ? "No outgoing requests match these filters"
              : "No outgoing requests yet"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            {hasActiveFilters
              ? "Try a broader search or clear the filters to see all of your sent requests again."
              : "Create your first request to generate a shareable link and start tracking the status from one place."}
          </p>
          <Button asChild className="rounded-full">
            <Link href={hasActiveFilters ? "/dashboard/outgoing" : "/requests/new"}>
              {hasActiveFilters ? "Clear filters" : "Create a request"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          data-testid="outgoing-request-card"
          className={
            request.id === createdRequestId
              ? "rounded-[1.5rem] ring-2 ring-primary/30 ring-offset-4 ring-offset-background"
              : undefined
          }
        >
          <div className="space-y-3">
            <RequestCard
              request={request}
              shareUrl={`${shareBaseUrl}/r/${request.id}`}
            />
            <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-card/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/requests/${request.id}`}>View details</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/r/${request.id}`}>Preview share page</Link>
                </Button>
              </div>
              <RequestActions
                requestId={request.id}
                returnTo={currentPath}
                status={request.status}
                viewerRole="sender"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
