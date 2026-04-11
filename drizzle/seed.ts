import { db } from "@/lib/db";
import { paymentRequests, users } from "@/drizzle/schema";
import { DEFAULT_CURRENCY_CODE } from "@/lib/money/format-amount";
import { normalizeEmail, normalizePhone } from "@/lib/validation/requests";

const demoUsers = [
  {
    email: "sender@example.com",
    phone: normalizePhone("+1 (555) 111-1000"),
  },
  {
    email: "recipient@example.com",
    phone: null,
  },
  {
    email: "recipient-phone@example.com",
    phone: normalizePhone("+1 (555) 222-3000"),
  },
] as const;

const seededExpiredRequestNote = "Expired seeded request";

async function main() {
  await db.delete(paymentRequests);

  const createdUsers = new Map<string, { email: string; id: string }>();

  for (const user of demoUsers) {
    const now = new Date();

    const [createdUser] = await db
      .insert(users)
      .values({
        createdAt: now,
        email: normalizeEmail(user.email),
        phone: user.phone,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        set: {
          phone: user.phone,
          updatedAt: now,
        },
        target: users.email,
      })
      .returning({
        email: users.email,
        id: users.id,
      });

    createdUsers.set(user.email, {
      email: createdUser.email,
      id: createdUser.id,
    });
  }

  const sender = createdUsers.get("sender@example.com");
  const emailRecipient = createdUsers.get("recipient@example.com");

  if (!sender || !emailRecipient) {
    throw new Error("Failed to seed required demo users.");
  }

  const now = new Date();
  const createdAt = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const expiresAt = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  await db.insert(paymentRequests).values({
    amountCents: 4200,
    createdAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt,
    lastStatusChangedAt: createdAt,
    note: seededExpiredRequestNote,
    recipientContactType: "email",
    recipientContactValue: normalizeEmail(emailRecipient.email),
    recipientMatchedUserId: emailRecipient.id,
    senderUserId: sender.id,
    status: "Pending",
    updatedAt: createdAt,
  });
}

main()
  .then(async () => {
    await db.$client.end();
  })
  .catch(async (error) => {
    console.error(error);
    await db.$client.end();
    process.exit(1);
  });
