import { redirect } from "next/navigation";

import { signInAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function SignInPage() {
  const user = await getCurrentUser();

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
              <CardDescription className="text-base leading-7">
                This take-home uses simple email-based mock auth. We create or
                reuse a demo user and store a signed HTTP-only session cookie.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form action={signInAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="sender@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                Demo accounts: <strong>sender@example.com</strong>,{" "}
                <strong>recipient@example.com</strong>, and{" "}
                <strong>recipient-phone@example.com</strong>.
              </div>

              <Button type="submit" className="w-full rounded-full">
                Continue to dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
