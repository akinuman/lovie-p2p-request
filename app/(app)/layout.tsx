import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireCurrentUser();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="space-y-1">
            <Link
              href="/dashboard/outgoing"
              className="font-mono text-xs uppercase tracking-[0.2em] text-primary"
            >
              Lovie P2P
            </Link>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/outgoing">Outgoing</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/incoming">Incoming</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/requests/new">New request</Link>
            </Button>
            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
