export default function RequestDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      {children}
    </div>
  );
}
