import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getDashboardPagePayloadForUser } from "@/use-cases/read-dashboard";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = await getDashboardPagePayloadForUser({
    searchParams: Object.fromEntries(searchParams.entries()),
    user: currentUser,
    variant: "outgoing",
  });

  return NextResponse.json(page);
}
