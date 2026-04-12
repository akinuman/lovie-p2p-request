import { demoUsers, expect, test } from "./fixtures";

test.describe("Authentication & Route Guards", () => {
  test("redirects unauthenticated user from dashboard to sign-in", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/dashboard/outgoing");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("redirects unauthenticated user from new request to sign-in", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/requests/new");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in flow works and lands on outgoing dashboard", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/sign-in");
    await page.getByRole("textbox", { name: "Email" }).fill(demoUsers.sender);
    await page.getByRole("button", { name: "Continue to dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard\/outgoing$/, { timeout: 15000 });
  });

  test("signed-in user visiting sign-in is redirected to dashboard", async ({
    signInAs,
    page,
  }) => {
    await signInAs(demoUsers.sender);
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
  });

  test("preserves from param and redirects after sign-in", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/requests/some-id");

    // Middleware should redirect to sign-in with from param
    await expect(page).toHaveURL(/\/sign-in\?from=%2Frequests%2Fsome-id/);

    // Sign in
    await page.getByRole("textbox", { name: "Email" }).fill(demoUsers.sender);
    await page.getByRole("button", { name: "Continue to dashboard" }).click();

    // Should land on the original target, not dashboard
    await expect(page).toHaveURL(/\/requests\/some-id/, { timeout: 15000 });
  });

  test("root path redirects unauthenticated user to sign-in", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
