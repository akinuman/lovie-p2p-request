import { cache } from "react";

import type { User } from "@prisma/client";
import { redirect } from "next/navigation";

import { getSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSessionCookie();

  if (!session) {
    return null;
  }

  return db.user.findUnique({
    where: {
      id: session.userId,
    },
  });
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
