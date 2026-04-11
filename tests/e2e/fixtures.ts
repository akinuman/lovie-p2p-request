import { expect, test as base } from "@playwright/test";

export const demoUsers = {
  recipientPhoneContact: "+1 (555) 222-3000",
  recipient: "recipient@example.com",
  recipientPhone: "recipient-phone@example.com",
  sender: "sender@example.com",
} as const;

type AuthFixtures = {
  expectRedirectToSignIn: (path: string) => Promise<void>;
  simulateClipboardFailure: () => Promise<void>;
  signInAs: (email: string) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  expectRedirectToSignIn: async ({ page }, applyFixture) => {
    await applyFixture(async (path: string) => {
      await page.context().clearCookies();
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in$/);
    });
  },
  signInAs: async ({ page }, applyFixture) => {
    await applyFixture(async (email: string) => {
      await page.goto("/sign-in");
      await page.context().clearCookies();
      await page.getByLabel("Email").fill(email);
      await page.getByRole("button", { name: "Continue to dashboard" }).click();
      await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
    });
  },
  simulateClipboardFailure: async ({ page }, applyFixture) => {
    await applyFixture(async () => {
      await page.addInitScript(() => {
        const clipboard = window.navigator.clipboard;

        if (!clipboard) {
          return;
        }

        Object.defineProperty(window.navigator, "clipboard", {
          configurable: true,
          value: {
            ...clipboard,
            writeText: async () => {
              throw new Error("Clipboard write blocked in test.");
            },
          },
        });
      });
    });
  },
});

export { expect };
