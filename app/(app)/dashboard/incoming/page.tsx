import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IncomingDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incoming requests</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        Recipient matching, actions, and countdown detail views are queued for
        the upcoming user story phases.
      </CardContent>
    </Card>
  );
}
