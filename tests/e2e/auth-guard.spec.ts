import { test, expect, demoUsers } from "./fixtures";

test.describe("Authentication & Route Guards", () => {
  test("redirects unauthenticated user from dashboard to sign-in", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/dashboard/outgoing");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("redirects unauthenticated user from new request to sign-in", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/requests/new");
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("sign-in flow works and lands on outgoing dashboard", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByRole("textbox", { name: "Email" }).fill(demoUsers.sender);
    await page.getByRole("button", { name: "Continue to dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
  });

  test("signed-in user visiting sign-in is redirected to dashboard", async ({ signInAs, page }) => {
    await signInAs(demoUsers.sender);
    await page.goto("/sign-in");
    await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
  });

  test("root path redirects unauthenticated user to sign-in", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
