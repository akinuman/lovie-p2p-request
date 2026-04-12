import { demoUsers, expect, test } from "./fixtures";

test.describe("Request Creation Flow", () => {
  test.beforeEach(async ({ signInAs }) => {
    await signInAs(demoUsers.sender);
  });

  test("creates a request and shows success dialog on outgoing dashboard", async ({
    page,
  }) => {
    await page.goto("/requests/new");

    // Fill amount
    const amountInput = page.locator("#amount");
    await amountInput.press("5");
    await amountInput.press("0");

    // Fill recipient and note
    await page.getByRole("textbox", { name: "To" }).fill(demoUsers.recipient);
    await page
      .getByRole("textbox", { name: "Note" })
      .fill("E2E creation test lunch");

    // Submit
    await page.getByRole("button", { name: "Create request" }).click();

    // Should redirect to outgoing dashboard
    await expect(page).toHaveURL(/\/dashboard\/outgoing/);

    // Success dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("$50.00");
    await expect(dialog).toContainText(demoUsers.recipient);

    // Dialog should have share link section
    await expect(dialog.getByText("Share link")).toBeVisible();

    // Close dialog
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();

    // New request visible in the list
    await expect(
      page.getByText("E2E creation test lunch").first(),
    ).toBeVisible();
  });

  test("amount presets fill the correct value", async ({ page }) => {
    await page.goto("/requests/new");

    await page.getByRole("button", { name: "$10" }).click();

    const amountInput = page.locator("#amount");
    await expect(amountInput).toHaveValue("10.00");

    await page.getByRole("button", { name: "$50" }).click();
    await expect(amountInput).toHaveValue("50.00");
  });

  test("validates empty amount", async ({ page }) => {
    await page.goto("/requests/new");
    await page.getByRole("textbox", { name: "To" }).fill(demoUsers.recipient);
    await page.getByRole("button", { name: "Create request" }).click();

    // Should stay on the page (form not submitted or validation error)
    await expect(page).toHaveURL(/\/requests\/new/);
  });

  test("validates amount exceeding $50,000", async ({ page }) => {
    await page.goto("/requests/new");

    const amountInput = page.locator("#amount");
    await amountInput.press("5");
    await amountInput.press("0");
    await amountInput.press("0");
    await amountInput.press("0");
    await amountInput.press("1");

    await page.getByRole("textbox", { name: "To" }).fill(demoUsers.recipient);
    await page.getByRole("button", { name: "Create request" }).click();

    // Should show max amount validation error
    await expect(page.getByText(/50,000 or less/)).toBeVisible();
  });

  test("validates invalid recipient email", async ({ page }) => {
    await page.goto("/requests/new");

    const amountInput = page.locator("#amount");
    await amountInput.press("1");
    await amountInput.press("0");

    await page.getByRole("textbox", { name: "To" }).fill("not-an-email");
    await page.getByRole("button", { name: "Create request" }).click();

    await expect(page.getByText(/valid.*email|phone/i)).toBeVisible();
  });

  test("blocks self-request", async ({ page }) => {
    await page.goto("/requests/new");

    const amountInput = page.locator("#amount");
    await amountInput.press("1");
    await amountInput.press("0");

    await page.getByRole("textbox", { name: "To" }).fill(demoUsers.sender);
    await page.getByRole("button", { name: "Create request" }).click();

    await expect(page.getByText(/self/i)).toBeVisible();
  });
});
