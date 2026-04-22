import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/use-cases/auth-actions";

const DEMO_ACCOUNTS = [
  { label: "Sender demo account", email: "sender@example.com" },
  { label: "Recipient demo account", email: "recipient@example.com" },
] as const;

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  return (
    <div className="space-y-5">
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

        <FormSubmitButton
          className="w-full rounded-full"
          idleLabel="Continue to dashboard"
          pendingLabel="Signing in..."
        />
      </form>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Or try it instantly with a preloaded demo account.
        </p>
        <div className="flex gap-2">
          {DEMO_ACCOUNTS.map(({ label, email }) => (
            <form key={email} action={signInAction} className="flex-1">
              {redirectTo && (
                <input type="hidden" name="redirectTo" value={redirectTo} />
              )}
              <input type="hidden" name="email" value={email} />
              <FormSubmitButton
                variant="outline"
                size="sm"
                className="w-full rounded-full"
                idleLabel={label}
                pendingLabel="Signing in..."
              />
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
