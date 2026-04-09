import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const readinessItems = [
  "Next.js App Router monolith with TypeScript scaffolding",
  "Responsive shell direction for mobile and desktop review",
  "Playwright and Vitest configuration ready for flow coverage",
  "Environment placeholders for Neon, mock auth, and Vercel deployment",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(20,83,45,0.12),transparent_28%),linear-gradient(180deg,#f5ead1_0%,#f7f1e6_48%,#fffaf3_100%)] px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Card className="overflow-hidden border-white/60 bg-card/85 shadow-[0_24px_80px_rgba(83,59,30,0.14)] backdrop-blur">
          <CardHeader className="gap-8 p-6 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-4xl space-y-4">
                <Badge
                  variant="secondary"
                  className="w-fit rounded-full bg-primary/12 px-3 py-1 font-mono text-[11px] text-primary"
                >
                  Phase 1 foundation
                </Badge>
                <div className="space-y-4">
                  <CardTitle className="max-w-4xl text-4xl leading-[0.95] tracking-[-0.05em] md:text-6xl">
                    Consumer payment requests, built for a crisp take-home
                    review.
                  </CardTitle>
                  <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                    The product flow comes next. This first slice establishes the
                    monolithic app structure, shadcn/ui foundation, and test
                    harness so the request lifecycle can be implemented quickly
                    without churn.
                  </CardDescription>
                </div>
              </div>

              <div className="flex w-full max-w-sm flex-col gap-3 rounded-[1.5rem] border border-primary/15 bg-primary/5 p-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  UI direction
                </span>
                <p className="text-sm leading-6 text-muted-foreground">
                  Inline Tailwind utilities plus owned shadcn/ui primitives keep
                  the UI fast to build and visually consistent as new flows land.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="w-full justify-center rounded-full"
                  disabled
                >
                  Phase 2: auth shell next
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 p-6 pt-0 md:grid-cols-2 md:p-10 md:pt-0">
            {readinessItems.map((item) => (
              <Card
                key={item}
                className="border-border/70 bg-background/70 shadow-none"
              >
                <CardHeader className="space-y-3 p-5">
                  <Badge
                    variant="outline"
                    className="w-fit rounded-full border-primary/25 bg-background/80 font-mono text-[11px] text-primary"
                  >
                    Ready
                  </Badge>
                  <p className="text-base font-medium leading-7 text-card-foreground">
                    {item}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-white/60 bg-card/80 shadow-[0_20px_60px_rgba(83,59,30,0.1)]">
            <CardHeader className="space-y-3">
              <Badge
                variant="outline"
                className="w-fit rounded-full border-primary/20 bg-background/70 font-mono text-[11px] text-primary"
              >
                Planned stack
              </Badge>
              <p className="text-sm leading-7 text-muted-foreground">
                Next.js, Prisma, Neon, Zod, Tailwind, shadcn/ui, Playwright,
                and Vitest.
              </p>
            </CardHeader>
          </Card>

          <Card className="border-white/60 bg-card/80 shadow-[0_20px_60px_rgba(83,59,30,0.1)]">
            <CardHeader className="space-y-3">
              <Badge
                variant="outline"
                className="w-fit rounded-full border-primary/20 bg-background/70 font-mono text-[11px] text-primary"
              >
                Assignment guardrails
              </Badge>
              <p className="text-sm leading-7 text-muted-foreground">
                Integer cents only, mock auth, responsive UX, public
                deployment, and automated Playwright video evidence.
              </p>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
