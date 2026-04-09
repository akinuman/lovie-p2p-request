"use server";

import { users } from "@/drizzle/schema";
import { redirect } from "next/navigation";

import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { signInSchema } from "@/lib/validation/auth";

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.parse({
    email: formData.get("email"),
  });

  const [user] = await db
    .insert(users)
    .values({
      email: parsed.email,
    })
    .onConflictDoUpdate({
      set: {
        email: parsed.email,
        updatedAt: new Date(),
      },
      target: users.email,
    })
    .returning();

  await setSessionCookie({
    email: user.email,
    userId: user.id,
  });

  redirect("/dashboard/outgoing");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/sign-in");
}
