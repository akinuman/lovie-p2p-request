import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getIncomingDashboardRequestPage,
  serializeDashboardRequestPage,
} from "@/lib/use-cases/requests/dashboard";
import { parseDashboardQueryState } from "@/lib/request-flow/query-state";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = await getIncomingDashboardRequestPage(currentUser, {
    ...parseDashboardQueryState(Object.fromEntries(searchParams.entries())),
  });

  return NextResponse.json(serializeDashboardRequestPage(page));
}
