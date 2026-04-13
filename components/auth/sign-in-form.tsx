import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/use-cases/auth-actions";

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  return (
    <form action={signInAction} className="space-y-5">
      {redirectTo && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="sender@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
        Demo accounts: <strong>sender@example.com</strong>,{" "}
        <strong>recipient@example.com</strong>
      </div>

      <FormSubmitButton
        className="w-full rounded-full"
        idleLabel="Continue to dashboard"
        pendingLabel="Signing in..."
      />
    </form>
  );
}
