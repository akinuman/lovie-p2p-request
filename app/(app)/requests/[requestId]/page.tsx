import { notFound } from "next/navigation";

import { RequestDetail } from "@/components/requests/request-detail";
import { Card, CardContent } from "@/components/ui/card";
import {
  getRequestViewerRole,
  requireCurrentUser,
} from "@/lib/auth/current-user";
import { getRequestForUser } from "@/lib/requests/queries";

function readStringParam(
  value: string | string[] | undefined,
) {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function readStatusMessage(status?: string) {
  if (!status) {
    return null;
  }

  return `Request updated to ${status}.`;
}

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const { requestId } = await params;
  const request = await getRequestForUser(requestId, currentUser);

  if (!request) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const requestError = readStringParam(resolvedSearchParams.requestError);
  const statusMessage = readStatusMessage(
    readStringParam(resolvedSearchParams.updatedStatus),
  );
  const viewerRole = getRequestViewerRole(currentUser, request);

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          Request detail
        </p>
        <h1 className="text-4xl tracking-[-0.05em] text-foreground">
          Inspect the request before you decide what happens next.
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          This detail view keeps the timeline, participant information, and
          expiration countdown in one place so both sender and recipient can
          trust the current state.
        </p>
      </div>

      {requestError ? (
        <Card className="border-destructive/30 bg-destructive/10 shadow-none">
          <CardContent className="pt-6 text-sm leading-6 text-destructive">
            {requestError}
          </CardContent>
        </Card>
      ) : null}

      {statusMessage ? (
        <Card className="border-primary/25 bg-primary/5 shadow-none">
          <CardContent className="pt-6 text-sm leading-6 text-foreground">
            {statusMessage}
          </CardContent>
        </Card>
      ) : null}

      <RequestDetail request={request} viewerRole={viewerRole} />
    </div>
  );
}
