import { PrismaClient } from "@prisma/client";

import { normalizeEmail, normalizePhone } from "@/lib/validation/requests";

const prisma = new PrismaClient();

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
  await prisma.paymentRequest.deleteMany();

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: normalizeEmail(user.email) },
      update: {
        phone: user.phone,
      },
      create: {
        email: normalizeEmail(user.email),
        phone: user.phone,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
