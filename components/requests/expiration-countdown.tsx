"use client";

import { useCountdown } from "@/hooks/use-countdown";

interface ExpirationCountdownProps {
  expiresAt: Date | string;
}

export function ExpirationCountdown({
  expiresAt,
}: ExpirationCountdownProps) {
  const { label } = useCountdown(expiresAt);

  return (
    <p className="text-sm font-medium text-foreground">
      {label}
    </p>
  );
}
