"use server";

import { redirect } from "next/navigation";

import { upsertUserByEmail } from "@/data-access/users";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { signInSchema } from "@/lib/validation/auth";

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.parse({
    email: formData.get("email"),
  });

  const user = await upsertUserByEmail(parsed.email);

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
