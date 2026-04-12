"use client";

import { useCallback, useState } from "react";

interface CopyToClipboardState {
  copied: boolean;
  error: string | null;
  pending: boolean;
}

const RESET_DELAY = 2500;

export function useCopyToClipboard() {
  const [state, setState] = useState<CopyToClipboardState>({
    copied: false,
    error: null,
    pending: false,
  });

  const copy = useCallback(async (text: string) => {
    setState({ copied: false, error: null, pending: true });

    try {
      await navigator.clipboard.writeText(text);
      setState({ copied: true, error: null, pending: false });
      setTimeout(() => {
        setState((prev) => (prev.copied ? { ...prev, copied: false } : prev));
      }, RESET_DELAY);
    } catch {
      setState({
        copied: false,
        error: "We couldn't copy the share link. Copy it manually below.",
        pending: false,
      });
    }
  }, []);

  return { ...state, copy };
}
