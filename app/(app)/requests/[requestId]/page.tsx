import { Suspense } from "react";

import { RequestDetailContent } from "@/components/requests/request-detail-content";
import { RequestDetailResultsLoading } from "@/components/requests/request-detail-results-loading";
import { requireCurrentUser } from "@/lib/auth/current-user";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const currentUser = await requireCurrentUser();
  const { requestId } = await params;

  return (
    <Suspense fallback={<RequestDetailResultsLoading />}>
      <RequestDetailContent currentUser={currentUser} requestId={requestId} />
    </Suspense>
  );
}
