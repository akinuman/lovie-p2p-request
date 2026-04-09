import Link from "next/link";

import type { PaymentRequestRecord } from "@/lib/requests/queries";
import { RequestCard } from "@/components/requests/request-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OutgoingListProps {
  createdRequestId?: string;
  requests: PaymentRequestRecord[];
  shareBaseUrl: string;
}

export function OutgoingList({
  createdRequestId,
  requests,
  shareBaseUrl,
}: OutgoingListProps) {
  if (requests.length === 0) {
    return (
      <Card className="border-dashed border-border/80 bg-card/80">
        <CardHeader>
          <CardTitle className="text-xl tracking-[-0.04em]">
            No outgoing requests yet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            Create your first request to generate a shareable link and start
            tracking the status from one place.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/requests/new">Create a request</Link>
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
          className={
            request.id === createdRequestId
              ? "rounded-[1.5rem] ring-2 ring-primary/30 ring-offset-4 ring-offset-background"
              : undefined
          }
        >
          <RequestCard
            request={request}
            shareUrl={`${shareBaseUrl}/r/${request.id}`}
          />
        </div>
      ))}
    </div>
  );
}
