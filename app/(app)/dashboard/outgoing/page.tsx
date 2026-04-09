import Link from "next/link";

import { OutgoingList } from "@/components/dashboard/outgoing-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getEnv } from "@/lib/env";
import { getOutgoingRequestsForUser } from "@/lib/requests/queries";

function readStringParam(
  value: string | string[] | undefined,
): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export default async function OutgoingDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const currentUser = await requireCurrentUser();
  const requests = await getOutgoingRequestsForUser(currentUser.id);
  const resolvedSearchParams = await searchParams;
  const createdRequestId = readStringParam(resolvedSearchParams.created);
  const createdRequest = requests.find((request) => request.id === createdRequestId);
  const shareBaseUrl = getEnv().NEXT_PUBLIC_APP_URL;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-card/90 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
          <CardHeader className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
              Outgoing dashboard
            </p>
            <CardTitle className="text-4xl tracking-[-0.05em]">
              Every request you’ve sent, all in one place.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-7 text-muted-foreground">
            <p>
              Pending requests stay visible here with their share links, notes,
              recipient routing, and lifecycle status.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/requests/new">Create another request</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-gradient-to-br from-accent/70 via-card to-card shadow-[0_18px_60px_rgba(20,83,45,0.08)]">
          <CardHeader>
            <CardTitle className="text-xl tracking-[-0.04em]">
              Share-ready flow
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>
              Email and phone recipients are normalized before we persist the
              request.
            </p>
            <p>
              Every newly created request gets a public summary page at{" "}
              <span className="font-mono text-xs text-foreground">/r/&lt;requestId&gt;</span>.
            </p>
          </CardContent>
        </Card>
      </section>

      {createdRequest ? (
        <Card className="border-primary/25 bg-primary/5 shadow-none">
          <CardContent className="flex flex-col gap-4 pt-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Request created and ready to share.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Share link:{" "}
                <Link
                  href={`${shareBaseUrl}/r/${createdRequest.id}`}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {`${shareBaseUrl}/r/${createdRequest.id}`}
                </Link>
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link href={`/r/${createdRequest.id}`}>Preview share page</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <OutgoingList
        createdRequestId={createdRequestId}
        requests={requests}
        shareBaseUrl={shareBaseUrl}
      />
    </div>
  );
}
