import { RequestForm } from "@/components/requests/request-form";

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <div className="max-w-3xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          New request
        </p>
        <h1 className="text-4xl tracking-[-0.05em] text-foreground">
          Ask for money with a link you can share in seconds.
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          Enter the recipient contact, amount, and an optional note. We’ll
          validate everything on the server, create a pending request, and send
          you back to the outgoing dashboard with the share link ready.
        </p>
      </div>

      <RequestForm />
    </div>
  );
}
