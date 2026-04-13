import { notFound, redirect } from "next/navigation";

import { RequestShareSummary } from "@/components/requests/request-share-summary";
import { getCurrentUser, getRequestViewerRole } from "@/lib/auth/current-user";
import { getEnv } from "@/lib/env";
import { getShareSummaryRequest } from "@/use-cases/read-request";

// NOTE: Share URLs use the payment request's database PK as the public token.
// This was a deliberate time tradeoff for the take-home — it works, but couples
// the internal identifier with the public-facing link. In production, share
// links should use a separate opaque token (e.g. a random base62 slug) stored
// alongside the request, so tokens can be rotated or revoked independently
// without affecting the primary key used in logs, revalidation, and internal APIs.
export default async function ShareSummaryPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const result = await getShareSummaryRequest(requestId);

  if (!result) {
    notFound();
  }

  const currentUser = await getCurrentUser();

  // Use the recipient-matching fields server-side only — they never leave the RSC boundary.
  if (
    currentUser &&
    getRequestViewerRole(currentUser, result._recipientMatch) === "recipient"
  ) {
    redirect(`/requests/${result.id}`);
  }

  const shareUrl = `${getEnv().NEXT_PUBLIC_APP_URL}/r/${result.id}`;

  // Destructure out the internal fields so only the safe DTO goes to the client.
  const { _recipientMatch: _, ...shareSummary } = result;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%),linear-gradient(180deg,#f6ede0_0%,#f8f4ec_54%,#fffaf3_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Public request summary
          </p>
          <h1 className="text-4xl tracking-[-0.05em] text-foreground">
            {currentUser
              ? "Review the shared request."
              : "Review the request before you sign in."}
          </h1>
        </div>

        <RequestShareSummary
          summary={shareSummary}
          shareUrl={shareUrl}
          isSignedIn={!!currentUser}
        />
      </div>
    </main>
  );
}
