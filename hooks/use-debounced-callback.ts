"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `callback` after `delayMs` of inactivity.
 * The timer resets whenever any value in `deps` changes.
 * Skips the initial mount so the callback doesn't fire immediately.
 */
export function useDebouncedCallback(
  callback: () => void,
  delayMs: number,
  deps: readonly unknown[],
) {
  const isFirstRender = useRef(true);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      callbackRef.current();
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
