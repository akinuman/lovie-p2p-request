import { signInAction } from "@/use-cases/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm() {
  return (
    <form action={signInAction} className="space-y-5">
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
        <strong>recipient@example.com</strong>, and{" "}
        <strong>recipient-phone@example.com</strong>.
      </div>

      <Button type="submit" className="w-full rounded-full">
        Continue to dashboard
      </Button>
    </form>
  );
}
