export default function OutgoingDashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-3xl border border-white/70 bg-card/90 p-6 shadow-[0_24px_80px_rgba(83,59,30,0.12)]">
          <div className="h-3 w-32 animate-pulse rounded-full bg-primary/20" />
          <div className="h-12 w-4/5 animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-10 w-44 animate-pulse rounded-full bg-primary/20" />
        </div>

        <div className="space-y-4 rounded-3xl border border-white/70 bg-card/90 p-6 shadow-[0_18px_60px_rgba(20,83,45,0.08)]">
          <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
      </section>

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
              <div className="h-8 w-48 animate-pulse rounded-2xl bg-muted" />
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
