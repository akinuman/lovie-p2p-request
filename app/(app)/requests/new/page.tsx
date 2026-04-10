import { RequestForm } from "@/components/requests/request-form";

export default function NewRequestPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="max-w-2xl space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">
          New request
        </p>
        <h1 className="text-3xl tracking-[-0.05em] text-foreground sm:text-4xl">
          Create a request that is ready to share in one pass.
        </h1>
      </div>
      <RequestForm />
    </div>
  );
}
