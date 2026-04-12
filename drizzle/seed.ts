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
  const phoneRecipient = createdUsers.get("recipient-phone@example.com");

  if (!sender || !emailRecipient || !phoneRecipient) {
    throw new Error("Failed to seed required demo users.");
  }

  const now = new Date();

  // ── Sender → Email Recipient: various statuses ──

  // 1. Pending request (recent)
  const pendingCreatedAt = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  await db.insert(paymentRequests).values({
    amountCents: 2500,
    createdAt: pendingCreatedAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt: new Date(pendingCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    lastStatusChangedAt: pendingCreatedAt,
    note: "Coffee and croissant from Tuesday",
    recipientContactType: "email",
    recipientContactValue: normalizeEmail(emailRecipient.email),
    recipientMatchedUserId: emailRecipient.id,
    senderUserId: sender.id,
    status: "Pending",
    updatedAt: pendingCreatedAt,
  });

  // 2. Paid request
  const paidCreatedAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const paidAt = new Date(paidCreatedAt.getTime() + 2 * 60 * 60 * 1000);
  await db.insert(paymentRequests).values({
    amountCents: 5000,
    createdAt: paidCreatedAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt: new Date(paidCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    lastStatusChangedAt: paidAt,
    note: "Uber ride split",
    paidAt,
    recipientContactType: "email",
    recipientContactValue: normalizeEmail(emailRecipient.email),
    recipientMatchedUserId: emailRecipient.id,
    senderUserId: sender.id,
    status: "Paid",
    updatedAt: paidAt,
  });

  // 3. Declined request
  const declinedCreatedAt = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
  const declinedAt = new Date(declinedCreatedAt.getTime() + 6 * 60 * 60 * 1000);
  await db.insert(paymentRequests).values({
    amountCents: 1500,
    createdAt: declinedCreatedAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    declinedAt,
    expiresAt: new Date(declinedCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    lastStatusChangedAt: declinedAt,
    note: "Movie tickets",
    recipientContactType: "email",
    recipientContactValue: normalizeEmail(emailRecipient.email),
    recipientMatchedUserId: emailRecipient.id,
    senderUserId: sender.id,
    status: "Declined",
    updatedAt: declinedAt,
  });

  // 4. Cancelled request
  const cancelledCreatedAt = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
  const cancelledAt = new Date(cancelledCreatedAt.getTime() + 1 * 60 * 60 * 1000);
  await db.insert(paymentRequests).values({
    amountCents: 3000,
    createdAt: cancelledCreatedAt,
    cancelledAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt: new Date(cancelledCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    lastStatusChangedAt: cancelledAt,
    note: "Cancelled dinner reservation",
    recipientContactType: "email",
    recipientContactValue: normalizeEmail(emailRecipient.email),
    recipientMatchedUserId: emailRecipient.id,
    senderUserId: sender.id,
    status: "Cancelled",
    updatedAt: cancelledAt,
  });

  // 5. Expired request (created 8 days ago, expired 1 day ago)
  const expiredCreatedAt = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
  const expiredExpiresAt = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  await db.insert(paymentRequests).values({
    amountCents: 4200,
    createdAt: expiredCreatedAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt: expiredExpiresAt,
    lastStatusChangedAt: expiredCreatedAt,
    note: "Expired seeded request",
    recipientContactType: "email",
    recipientContactValue: normalizeEmail(emailRecipient.email),
    recipientMatchedUserId: emailRecipient.id,
    senderUserId: sender.id,
    status: "Pending",
    updatedAt: expiredCreatedAt,
  });

  // 6. Another pending request for search testing
  const pending2CreatedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  await db.insert(paymentRequests).values({
    amountCents: 7500,
    createdAt: pending2CreatedAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt: new Date(pending2CreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    lastStatusChangedAt: pending2CreatedAt,
    note: "Grocery run last weekend",
    recipientContactType: "email",
    recipientContactValue: normalizeEmail(emailRecipient.email),
    recipientMatchedUserId: emailRecipient.id,
    senderUserId: sender.id,
    status: "Pending",
    updatedAt: pending2CreatedAt,
  });

  // ── Sender → Phone Recipient: pending request via phone ──
  const phonePendingCreatedAt = new Date(now.getTime() - 1.5 * 24 * 60 * 60 * 1000);
  await db.insert(paymentRequests).values({
    amountCents: 1000,
    createdAt: phonePendingCreatedAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt: new Date(phonePendingCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    lastStatusChangedAt: phonePendingCreatedAt,
    note: "Phone recipient test",
    recipientContactType: "phone",
    recipientContactValue: normalizePhone("+1 (555) 222-3000")!,
    recipientMatchedUserId: phoneRecipient.id,
    senderUserId: sender.id,
    status: "Pending",
    updatedAt: phonePendingCreatedAt,
  });

  // ── Email Recipient → Sender: reverse direction for incoming tests ──
  const reverseCreatedAt = new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000);
  await db.insert(paymentRequests).values({
    amountCents: 12000,
    createdAt: reverseCreatedAt,
    currencyCode: DEFAULT_CURRENCY_CODE,
    expiresAt: new Date(reverseCreatedAt.getTime() + 7 * 24 * 60 * 60 * 1000),
    lastStatusChangedAt: reverseCreatedAt,
    note: "Concert tickets split",
    recipientContactType: "email",
    recipientContactValue: normalizeEmail(sender.email),
    recipientMatchedUserId: sender.id,
    senderUserId: emailRecipient.id,
    status: "Pending",
    updatedAt: reverseCreatedAt,
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
