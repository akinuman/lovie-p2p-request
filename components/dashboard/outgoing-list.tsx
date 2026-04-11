"use client";

import Link from "next/link";

import type { DashboardFilterInput } from "@/lib/validation/requests";
import type { DashboardRequestPagePayload } from "@/use-cases/read-dashboard";
import { RequestCard } from "@/components/requests/request-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardPagination } from "@/components/dashboard/use-dashboard-pagination";

interface OutgoingListProps {
  createdRequestId?: string;
  currentPath: string;
  filters: DashboardFilterInput;
  hasActiveFilters?: boolean;
  initialPage: DashboardRequestPagePayload;
  shareBaseUrl: string;
}

export function OutgoingList({
  createdRequestId,
  currentPath,
  filters,
  hasActiveFilters = false,
  initialPage,
  shareBaseUrl,
}: OutgoingListProps) {
  const { errorMessage, hasMore, isLoadingMore, items, loadMore, sentinelRef } =
    useDashboardPagination({
      apiPath: "/api/requests/outgoing",
      filters,
      initialPage,
    });

  if (items.length === 0) {
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
      {items.map((request) => (
        <div
          key={request.id}
          data-testid="outgoing-request-card"
          className={
            request.id === createdRequestId
              ? "rounded-[1.5rem] ring-2 ring-primary/30 ring-offset-4 ring-offset-background"
              : undefined
          }
        >
          <RequestCard
            currentPath={currentPath}
            request={request}
            shareUrl={`${shareBaseUrl}${request.shareUrl ?? `/r/${request.id}`}`}
          />
        </div>
      ))}

      {errorMessage ? (
        <Card className="border-destructive/30 bg-destructive/10 shadow-none">
          <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-destructive">{errorMessage}</p>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => void loadMore()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

      {isLoadingMore ? (
        <Card className="border-white/70 bg-card/90 shadow-[0_18px_50px_rgba(83,59,30,0.06)]">
          <CardContent className="flex items-center justify-center gap-3 pt-6 text-sm text-muted-foreground">
            <span className="ui-spinner" aria-hidden="true" />
            Loading more requests...
          </CardContent>
        </Card>
      ) : null}

      {!hasMore && items.length > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          You&apos;ve reached the end of your outgoing requests.
        </p>
      ) : null}
    </div>
  );
}
