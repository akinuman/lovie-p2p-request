"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { toast } from "@/hooks/use-toast";
import type { RequestMutationActionState } from "@/use-cases/request-action-state";

/**
 * Reacts to action state transitions — shows a toast and refreshes
 * the page data on success.
 */
export function useActionStateEffect(
  state: RequestMutationActionState,
  onSuccess?: () => void,
) {
  const router = useRouter();

  useEffect(() => {
    if (state.status === "idle") {
      return;
    }

    toast({
      title: state.message,
      variant: state.status === "error" ? "destructive" : "default",
    });

    if (state.status === "success") {
      onSuccess?.();
      router.refresh();
    }
  }, [onSuccess, router, state]);
}
