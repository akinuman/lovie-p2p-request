"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  DashboardRequestPagePayload,
} from "@/use-cases/read-dashboard";
import type { DashboardFilterInput } from "@/lib/validation/requests";

function buildDashboardApiUrl(
  apiPath: string,
  filters: DashboardFilterInput,
  cursor?: string | null,
) {
  const searchParams = new URLSearchParams();

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  if (filters.q) {
    searchParams.set("q", filters.q);
  }

  if (filters.status) {
    searchParams.set("status", filters.status);
  }

  const query = searchParams.toString();

  return query ? `${apiPath}?${query}` : apiPath;
}

export function useDashboardPagination({
  apiPath,
  filters,
  initialPage,
}: {
  apiPath: string;
  filters: DashboardFilterInput;
  initialPage: DashboardRequestPagePayload;
}) {
  const queryKey = JSON.stringify({
    q: filters.q ?? "",
    status: filters.status ?? "",
  });
  const [items, setItems] = useState(initialPage.items);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestGenerationRef = useRef(0);

  useEffect(() => {
    requestGenerationRef.current += 1;
    setItems(initialPage.items);
    setErrorMessage(null);
    setHasMore(initialPage.hasMore);
    setIsLoadingMore(false);
    setNextCursor(initialPage.nextCursor);
  }, [initialPage, queryKey]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !nextCursor) {
      return;
    }

    const requestGeneration = requestGenerationRef.current;
    setIsLoadingMore(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        buildDashboardApiUrl(apiPath, filters, nextCursor),
      );

      if (!response.ok) {
        throw new Error("We couldn’t load more requests.");
      }

      const page = (await response.json()) as DashboardRequestPagePayload;

      if (requestGeneration !== requestGenerationRef.current) {
        return;
      }

      setItems((currentItems) => [...currentItems, ...page.items]);
      setHasMore(page.hasMore);
      setNextCursor(page.nextCursor);
    } catch (error) {
      if (requestGeneration !== requestGenerationRef.current) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t load more requests.",
      );
    } finally {
      if (requestGeneration === requestGenerationRef.current) {
        setIsLoadingMore(false);
      }
    }
  }, [apiPath, filters, hasMore, isLoadingMore, nextCursor]);

  useEffect(() => {
    const sentinelNode = sentinelRef.current;

    if (!sentinelNode || !hasMore || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      {
        rootMargin: "240px 0px",
      },
    );

    observer.observe(sentinelNode);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMore, queryKey]);

  return {
    errorMessage,
    hasMore,
    isLoadingMore,
    items,
    loadMore,
    sentinelRef,
  };
}
