import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getCurrentUser();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const from =
    typeof resolvedSearchParams?.from === "string"
      ? resolvedSearchParams.from
      : null;

  if (user) {
    redirect("/dashboard/outgoing");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(20,83,45,0.12),transparent_28%),linear-gradient(180deg,#f5ead1_0%,#f7f1e6_48%,#fffaf3_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <Card className="w-full max-w-xl border-white/60 bg-card/85 shadow-[0_24px_80px_rgba(83,59,30,0.14)] backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
              Mock auth
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl tracking-[-0.04em] md:text-4xl">
                Sign in with email
              </CardTitle>
              {from ? (
                <p className="request-flow-feedback rounded-2xl border border-border/70 bg-background/70">
                  Sign in to continue to{" "}
                  <span className="font-medium">{from}</span>.
                </p>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
