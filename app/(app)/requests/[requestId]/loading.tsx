export default function RequestDetailLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="max-w-3xl space-y-3">
        <div className="h-3 w-28 animate-pulse rounded-full bg-primary/20" />
        <div className="h-12 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.85fr]">
        <div className="space-y-6 rounded-3xl border border-white/70 bg-card/95 p-6 shadow-[0_18px_50px_rgba(83,59,30,0.1)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
              <div className="h-12 w-40 animate-pulse rounded-2xl bg-muted" />
            </div>
            <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-2xl border border-border/70 bg-background/70 p-4">
            <div className="h-3 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/70 bg-card/90 p-6 shadow-[0_18px_50px_rgba(83,59,30,0.08)]">
          <div className="h-7 w-40 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
