import { users, type User } from "@/drizzle/schema";

import { db } from "@/lib/db";
import { normalizeEmail, normalizePhone } from "@/lib/validation/requests";

export async function upsertUserByEmail(email: string): Promise<User> {
  const now = new Date();

  const [user] = await db
    .insert(users)
    .values({
      createdAt: now,
      email,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      set: {
        email,
        updatedAt: now,
      },
      target: users.email,
    })
    .returning();

  return user;
}

export interface UserLookupInput {
  email?: string;
  id?: string;
  phone?: string;
}

export async function findUser(
  input: UserLookupInput,
): Promise<User | null> {
  if (input.id) {
    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, input.id as string),
    });

    return user ?? null;
  }

  if (input.email) {
    const user = await db.query.users.findFirst({
      where: (table, { eq }) =>
        eq(table.email, normalizeEmail(input.email as string)),
    });

    return user ?? null;
  }

  if (input.phone) {
    const normalizedPhone = normalizePhone(input.phone);

    if (!normalizedPhone) {
      return null;
    }

    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.phone, normalizedPhone),
    });

    return user ?? null;
  }

  return null;
}

export async function findUserByRecipientContact(
  contactType: "email" | "phone",
  contactValue: string,
) {
  if (contactType === "email") {
    const user = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.email, normalizeEmail(contactValue)),
    });

    return user ?? null;
  }

  const normalizedPhone = normalizePhone(contactValue);

  if (!normalizedPhone) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.phone, normalizedPhone),
  });

  return user ?? null;
}
