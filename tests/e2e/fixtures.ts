import { expect, test as base } from "@playwright/test";

export const demoUsers = {
  recipientPhoneContact: "+1 (555) 222-3000",
  recipient: "recipient@example.com",
  recipientPhone: "recipient-phone@example.com",
  sender: "sender@example.com",
} as const;

type AuthFixtures = {
  signInAs: (email: string) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  signInAs: async ({ page }, applyFixture) => {
    await applyFixture(async (email: string) => {
      await page.goto("/sign-in");
      await page.context().clearCookies();
      await page.getByLabel("Email").fill(email);
      await page.getByRole("button", { name: "Continue to dashboard" }).click();
      await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
    });
  },
});

export { expect };
