"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

interface FormSubmitButtonProps {
  className?: string;
  idleLabel: string;
  pendingLabel: string;
  variant?: "default" | "destructive" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function FormSubmitButton({
  className = "w-full rounded-full sm:w-auto",
  idleLabel,
  pendingLabel,
  variant = "default",
  size = "default",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      loading={pending}
      disabled={pending}
    >
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
