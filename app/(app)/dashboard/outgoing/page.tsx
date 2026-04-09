import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OutgoingDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outgoing requests</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        Phase 2 foundation is in place. The sender request list and create flow
        land in the next implementation phase.
      </CardContent>
    </Card>
  );
}
