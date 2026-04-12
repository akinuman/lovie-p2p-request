"use client";

import { useEffect, useState } from "react";

import { formatRemainingTime } from "@/lib/format-date";

export function useCountdown(expiresAt: Date | string) {
  const expiryTime = new Date(expiresAt).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const remainingMs = expiryTime - now;
  const isExpired = remainingMs <= 0;

  return {
    isExpired,
    label: isExpired ? "Expired" : formatRemainingTime(remainingMs),
    remainingMs,
  };
}
