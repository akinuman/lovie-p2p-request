import { notFound } from "next/navigation";

import type { User } from "@/drizzle/schema";

import { RequestDetail } from "@/components/requests/request-detail";
import { getRequestDetailReadResult } from "@/use-cases/read-request";

interface RequestDetailContentProps {
  currentUser: User;
  requestId: string;
}

export async function RequestDetailContent({
  currentUser,
  requestId,
}: RequestDetailContentProps) {
  const detailState = await getRequestDetailReadResult(requestId, currentUser);

  if (!detailState) {
    notFound();
  }

  return (
    <RequestDetail
      request={detailState.request}
      viewerRole={detailState.viewerRole}
    />
  );
}
