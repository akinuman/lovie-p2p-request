"use server";

import { redirect } from "next/navigation";

import { upsertUserByEmail } from "@/data-access/users";
import { AUTHENTICATED_HOME_PATH } from "@/lib/auth/route-guard";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session";
import { signInSchema } from "@/lib/validation/auth";

function getSafeRedirectPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return AUTHENTICATED_HOME_PATH;
  }
  return value;
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.parse({
    email: formData.get("email"),
  });

  const user = await upsertUserByEmail(parsed.email);

  await setSessionCookie({
    email: user.email,
    userId: user.id,
  });

  redirect(getSafeRedirectPath(formData.get("redirectTo")));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/sign-in");
}
