export function DashboardResultsLoading() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-live="polite"
      data-testid="dashboard-results-loading"
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="space-y-4 rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-8 w-48 animate-pulse rounded-2xl bg-muted" />
            <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-4 animate-pulse rounded-full bg-muted" />
            <div className="h-4 animate-pulse rounded-full bg-muted" />
            <div className="h-4 animate-pulse rounded-full bg-muted" />
            <div className="h-4 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-20 animate-pulse rounded-2xl bg-muted/80" />
        </div>
      ))}
    </div>
  );
}
