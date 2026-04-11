import { notFound } from "next/navigation";

import { RequestDetail } from "@/components/requests/request-detail";
import { Card, CardContent } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  getRequestDetailReadResult,
  getRequestPageAlerts,
} from "@/use-cases/read-request";

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ requestId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const { requestId } = await params;
  const detailState = await getRequestDetailReadResult(requestId, currentUser);

  if (!detailState) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const alerts = getRequestPageAlerts(resolvedSearchParams);

  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          Request detail
        </p>
        <h1 className="text-3xl tracking-[-0.05em] text-foreground sm:text-4xl">
          Inspect the request before you decide what happens next.
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          This detail view keeps the timeline, participant information, and
          expiration countdown in one place so both sender and recipient can
          trust the current state.
        </p>
      </div>

      {alerts.requestError ? (
        <Card className="border-destructive/30 bg-destructive/10 shadow-none">
          <CardContent className="pt-6 text-sm leading-6 text-destructive">
            {alerts.requestError}
          </CardContent>
        </Card>
      ) : null}

      {alerts.statusMessage ? (
        <Card className="border-primary/25 bg-primary/5 shadow-none">
          <CardContent className="pt-6 text-sm leading-6 text-foreground">
            {alerts.statusMessage}
          </CardContent>
        </Card>
      ) : null}

      <RequestDetail
        request={detailState.request}
        viewerRole={detailState.viewerRole}
      />
    </div>
  );
}
