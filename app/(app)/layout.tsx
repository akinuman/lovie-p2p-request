import Link from "next/link";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/route-guard";
import { logoutAction } from "@/use-cases/auth-actions";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireCurrentUser();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="sticky top-0 border-b z-50 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="space-y-1">
            <Link
              href={AUTHENTICATED_HOME_PATH}
              className="font-mono text-xs uppercase tracking-[0.2em] text-primary"
            >
              Lovie P2P
            </Link>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <DashboardNav />
            <form action={logoutAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6">
        {children}
      </main>
    </div>
  );
}
