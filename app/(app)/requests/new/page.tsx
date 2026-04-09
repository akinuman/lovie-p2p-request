import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewRequestPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create request</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-muted-foreground">
        The Phase 2 foundation now supports the validation and persistence layer
        needed for request creation. The form UI arrives in User Story 1.
      </CardContent>
    </Card>
  );
}
