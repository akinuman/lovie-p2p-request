"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { storeCreatedRequestDialogState } from "@/lib/request-created-dialog-storage";
import type { CreatedRequestDialogState } from "@/use-cases/create-request-form-state";

/**
 * When a request is successfully created, stores the dialog state in
 * sessionStorage and redirects to the outgoing dashboard.
 */
export function useRequestCreationRedirect(
  createdRequest: CreatedRequestDialogState | null,
) {
  const router = useRouter();
  const handledRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!createdRequest) {
      return;
    }

    if (handledRequestIdRef.current === createdRequest.requestId) {
      return;
    }

    handledRequestIdRef.current = createdRequest.requestId;
    storeCreatedRequestDialogState(createdRequest);
    router.push("/dashboard/outgoing");
  }, [router, createdRequest]);
}
