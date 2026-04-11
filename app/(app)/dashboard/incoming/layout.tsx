import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default async function IncomingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <Card className="border-white/70 bg-card/90 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
        <CardHeader>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
            Incoming dashboard
          </p>
          <CardTitle className="text-3xl tracking-[-0.05em] sm:text-4xl">
            Review and resolve every request sent your way.
          </CardTitle>
        </CardHeader>
      </Card>
      {children}
    </div>
  );
}
