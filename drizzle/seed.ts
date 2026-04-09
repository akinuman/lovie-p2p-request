import { db } from "@/lib/db";
import { paymentRequests, users } from "@/drizzle/schema";
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

  for (const user of demoUsers) {
    const now = new Date();

    await db
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
      });
  }
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
