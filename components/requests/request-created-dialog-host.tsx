"use client";

import { useEffect, useState } from "react";

import { RequestCreatedDialog } from "@/components/requests/request-created-dialog";
import {
  clearCreatedRequestDialogState,
  readCreatedRequestDialogState,
} from "@/lib/request-created-dialog-storage";
import type { CreatedRequestDialogState } from "@/use-cases/create-request-form-state";

export function RequestCreatedDialogHost({
  shareBaseUrl,
}: {
  shareBaseUrl: string;
}) {
  const [createdRequest, setCreatedRequest] =
    useState<CreatedRequestDialogState | null>(null);

  useEffect(() => {
    setCreatedRequest(readCreatedRequestDialogState());
  }, []);

  function handleClose() {
    clearCreatedRequestDialogState();
    setCreatedRequest(null);
  }

  if (!createdRequest) {
    return null;
  }

  return (
    <RequestCreatedDialog
      amountCents={createdRequest.amountCents}
      currencyCode={createdRequest.currencyCode}
      note={createdRequest.note}
      onClose={handleClose}
      recipientLabel={createdRequest.recipientLabel}
      requestId={createdRequest.requestId}
      shareBaseUrl={shareBaseUrl}
      sharePath={`/r/${createdRequest.requestId}`}
    />
  );
}
