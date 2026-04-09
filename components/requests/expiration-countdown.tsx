"use client";

import { useEffect, useState } from "react";

interface ExpirationCountdownProps {
  expiresAt: Date | string;
}

function formatRemainingTime(remainingMs: number) {
  if (remainingMs <= 60_000) {
    return "Expires in less than a minute";
  }

  const totalMinutes = Math.floor(remainingMs / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `Expires in ${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `Expires in ${hours}h ${minutes}m`;
  }

  return `Expires in ${minutes}m`;
}

export function ExpirationCountdown({
  expiresAt,
}: ExpirationCountdownProps) {
  const expiryTime = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const remainingMs = expiryTime - now;

  return (
    <p className="text-sm font-medium text-foreground">
      {remainingMs <= 0 ? "Expired" : formatRemainingTime(remainingMs)}
    </p>
  );
}
