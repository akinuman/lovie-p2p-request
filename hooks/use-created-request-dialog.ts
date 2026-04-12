"use client";

import { useEffect, useState } from "react";

import {
  clearCreatedRequestDialogState,
  readCreatedRequestDialogState,
} from "@/lib/request-created-dialog-storage";
import type { CreatedRequestDialogState } from "@/use-cases/create-request-form-state";

export function useCreatedRequestDialog() {
  const [createdRequest, setCreatedRequest] =
    useState<CreatedRequestDialogState | null>(null);

  useEffect(() => {
    setCreatedRequest(readCreatedRequestDialogState());
  }, []);

  function dismiss() {
    clearCreatedRequestDialogState();
    setCreatedRequest(null);
  }

  return { createdRequest, dismiss };
}
