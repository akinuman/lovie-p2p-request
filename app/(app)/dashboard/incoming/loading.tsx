export default function IncomingDashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="rounded-3xl border border-border/70 bg-card/80 p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_auto]">
          <div className="h-10 animate-pulse rounded-2xl bg-muted" />
          <div className="h-10 animate-pulse rounded-2xl bg-muted" />
          <div className="h-10 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="space-y-4 rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="h-8 w-52 animate-pulse rounded-2xl bg-muted" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 animate-pulse rounded-full bg-muted" />
              <div className="h-4 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
