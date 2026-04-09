import { cache } from "react";

import { redirect } from "next/navigation";
import { type User } from "@/drizzle/schema";

import { getSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSessionCookie();

  if (!session) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, session.userId),
  });

  return user ?? null;
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
