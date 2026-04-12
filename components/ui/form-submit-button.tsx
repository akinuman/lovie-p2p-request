"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface FormSubmitButtonProps {
  className?: string;
  idleLabel: string;
  pendingLabel: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
}

export function FormSubmitButton({
  className = "w-full rounded-full sm:w-auto",
  idleLabel,
  pendingLabel,
  variant = "default",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      loading={pending}
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
