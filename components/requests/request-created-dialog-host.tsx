"use client";

import { RequestCreatedDialog } from "@/components/requests/request-created-dialog";
import { useCreatedRequestDialog } from "@/hooks/use-created-request-dialog";

export function RequestCreatedDialogHost({
  shareBaseUrl,
}: {
  shareBaseUrl: string;
}) {
  const { createdRequest, dismiss } = useCreatedRequestDialog();

  if (!createdRequest) {
    return null;
  }

  return (
    <RequestCreatedDialog
      amountCents={createdRequest.amountCents}
      currencyCode={createdRequest.currencyCode}
      note={createdRequest.note}
      onClose={dismiss}
      recipientLabel={createdRequest.recipientLabel}
      requestId={createdRequest.requestId}
      shareBaseUrl={shareBaseUrl}
      sharePath={`/r/${createdRequest.requestId}`}
    />
  );
}
