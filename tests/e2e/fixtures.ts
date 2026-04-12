import { expect, test as base } from "@playwright/test";

export const demoUsers = {
  sender: "sender@example.com",
  recipient: "recipient@example.com",
  recipientPhone: "recipient-phone@example.com",
  recipientPhoneContact: "+1 (555) 222-3000",
} as const;

type AuthFixtures = {
  signInAs: (email: string) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  signInAs: async ({ page }, applyFixture) => {
    await applyFixture(async (email: string) => {
      await page.context().clearCookies();
      await page.goto("/sign-in");
      await page.getByRole("textbox", { name: "Email" }).fill(email);
      await page.getByRole("button", { name: "Continue to dashboard" }).click();
      await expect(page).toHaveURL(/\/dashboard\/outgoing$/, { timeout: 15000 });
    });
  },
});

export { expect };
