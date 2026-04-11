import { notFound, redirect } from "next/navigation";

import { RequestShareSummary } from "@/components/requests/request-share-summary";
import { getCurrentUser, getRequestViewerRole } from "@/lib/auth/current-user";
import { getEnv } from "@/lib/env";
import { getShareSummaryRequest } from "@/lib/use-cases/requests/read-request";

export default async function ShareSummaryPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const request = await getShareSummaryRequest(requestId);

  if (!request) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  if (
    currentUser &&
    getRequestViewerRole(currentUser, request) === "recipient"
  ) {
    redirect(`/requests/${request.id}`);
  }

  const shareUrl = `${getEnv().NEXT_PUBLIC_APP_URL}/r/${request.id}`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%),linear-gradient(180deg,#f6ede0_0%,#f8f4ec_54%,#fffaf3_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Public request summary
          </p>
          <h1 className="text-4xl tracking-[-0.05em] text-foreground">
            Review the request before you sign in.
          </h1>
        </div>

        <RequestShareSummary request={request} shareUrl={shareUrl} />
      </div>
    </main>
  );
}
