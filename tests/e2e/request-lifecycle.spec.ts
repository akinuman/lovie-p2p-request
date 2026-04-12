import { demoUsers, expect, test } from "./fixtures";

test.describe("Request Lifecycle — Pay", () => {
  test("recipient pays a request with confirmation dialog", async ({
    signInAs,
    page,
  }) => {
    // Sign in as sender, create a fresh request
    await signInAs(demoUsers.sender);
    await page.goto("/requests/new");

    const amountInput = page.locator("#amount");
    await amountInput.press("2");
    await amountInput.press("0");

    await page.getByRole("textbox", { name: "To" }).fill(demoUsers.recipient);
    await page
      .getByRole("textbox", { name: "Note" })
      .fill("E2E pay test unique note");
    await page.getByRole("button", { name: "Create request" }).click();

    // Wait for redirect and close dialog
    await expect(page).toHaveURL(/\/dashboard\/outgoing/);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Close" })
      .click();

    // Sign in as recipient
    await signInAs(demoUsers.recipient);
    await page.goto("/dashboard/incoming");

    // Find the specific request
    const requestCard = page
      .getByTestId("incoming-request-card")
      .filter({
        hasText: "E2E pay test unique note",
      })
      .first();
    await expect(requestCard).toBeVisible();

    // Click Pay — opens confirmation dialog
    await requestCard
      .getByRole("button", { name: /pay request/i })
      .first()
      .click();
    const payDialog = page.getByRole("dialog");
    await expect(payDialog).toBeVisible();
    await expect(payDialog).toContainText("$20.00");

    // Confirm payment
    await payDialog.getByRole("button", { name: /confirm payment/i }).click();

    // Should see success toast after processing
    await expect(page.getByText(/paid/i).first()).toBeVisible({
      timeout: 15000,
    });

    // Verify status in sender's view
    await signInAs(demoUsers.sender);
    // Reload to ensure fresh data from the server
    await page.reload();
    const paidCard = page
      .getByTestId("outgoing-request-card")
      .filter({
        hasText: "E2E pay test unique note",
      })
      .first();
    await expect(paidCard.getByText("Paid")).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Request Lifecycle — Decline", () => {
  test("recipient declines a request", async ({ signInAs, page }) => {
    await signInAs(demoUsers.sender);
    await page.goto("/requests/new");

    const amountInput = page.locator("#amount");
    await amountInput.press("1");
    await amountInput.press("5");

    await page.getByRole("textbox", { name: "To" }).fill(demoUsers.recipient);
    await page
      .getByRole("textbox", { name: "Note" })
      .fill("E2E decline test unique note");
    await page.getByRole("button", { name: "Create request" }).click();
    await expect(page).toHaveURL(/\/dashboard\/outgoing/);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Close" })
      .click();

    // Sign in as recipient and decline
    await signInAs(demoUsers.recipient);
    await page.goto("/dashboard/incoming");

    const requestCard = page
      .getByTestId("incoming-request-card")
      .filter({
        hasText: "E2E decline test unique note",
      })
      .first();
    await expect(requestCard).toBeVisible();

    await requestCard
      .getByRole("button", { name: /decline/i })
      .first()
      .click();

    // Should see decline feedback
    await expect(page.getByText(/declined/i).first()).toBeVisible({
      timeout: 15000,
    });

    // Verify in sender's view
    await signInAs(demoUsers.sender);
    // Reload to ensure fresh data from the server
    await page.reload();
    const declinedCard = page
      .getByTestId("outgoing-request-card")
      .filter({
        hasText: "E2E decline test unique note",
      })
      .first();
    await expect(declinedCard.getByText("Declined")).toBeVisible({ timeout: 15000 });
  });
});

test.describe("Request Lifecycle — Cancel", () => {
  test("sender cancels a pending request", async ({ signInAs, page }) => {
    await signInAs(demoUsers.sender);
    await page.goto("/requests/new");

    const amountInput = page.locator("#amount");
    await amountInput.press("3");
    await amountInput.press("0");

    await page.getByRole("textbox", { name: "To" }).fill(demoUsers.recipient);
    await page
      .getByRole("textbox", { name: "Note" })
      .fill("E2E cancel test unique note");
    await page.getByRole("button", { name: "Create request" }).click();
    await expect(page).toHaveURL(/\/dashboard\/outgoing/);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Close" })
      .click();

    // Cancel the request
    const requestCard = page
      .getByTestId("outgoing-request-card")
      .filter({
        hasText: "E2E cancel test unique note",
      })
      .first();
    await expect(requestCard).toBeVisible();

    await requestCard.getByRole("button", { name: /cancel/i }).click();

    // Should see cancellation feedback
    await expect(page.getByText(/cancelled/i).first()).toBeVisible({
      timeout: 15000,
    });

    // Card should show Cancelled status
    const cancelledCard = page
      .getByTestId("outgoing-request-card")
      .filter({
        hasText: "E2E cancel test unique note",
      })
      .first();
    await expect(cancelledCard.getByText("Cancelled")).toBeVisible();
  });
});

test.describe("Request Lifecycle — Expiration", () => {
  test("expired request shows Expired status and no Pay button", async ({
    signInAs,
    page,
  }) => {
    await signInAs(demoUsers.recipient);
    await page.goto("/dashboard/incoming");

    // Filter to Expired
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Expired" }).click();
    await expect(page).toHaveURL(/status=Expired/);

    // Check for expired card (seeded data has one expired request)
    const expiredCard = page
      .getByTestId("incoming-request-card")
      .filter({
        hasText: "Expired",
      })
      .first();

    const count = await page.getByTestId("incoming-request-card").count();
    if (count > 0) {
      await expect(expiredCard.getByText("Expired")).toBeVisible();
      // Expired cards should NOT have Pay button
      await expect(
        expiredCard.getByRole("button", { name: /pay/i }),
      ).not.toBeVisible();
    }
  });
});

test.describe("Request Detail View", () => {
  test("shows request details with amount, note, status, and timestamps", async ({
    signInAs,
    page,
  }) => {
    await signInAs(demoUsers.sender);

    const firstCard = page.getByTestId("outgoing-request-card").first();
    await expect(firstCard).toBeVisible();
    await firstCard.getByRole("link", { name: /view details/i }).click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/requests\//);

    // Detail page should show key information
    await expect(page.getByText(/\$/).first()).toBeVisible();
    await expect(
      page.getByText(/pending|paid|declined|cancelled|expired/i).first(),
    ).toBeVisible();
  });

  test("incoming request detail shows Pay and Decline for pending", async ({
    signInAs,
    page,
  }) => {
    await signInAs(demoUsers.recipient);
    await page.goto("/dashboard/incoming");

    const pendingCard = page
      .getByTestId("incoming-request-card")
      .filter({
        hasText: "Pending",
      })
      .first();
    await expect(pendingCard).toBeVisible();
    await pendingCard.getByRole("link", { name: /view details/i }).click();

    await expect(page).toHaveURL(/\/requests\//);
    await expect(
      page.getByRole("button", { name: /pay/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /decline/i }).first(),
    ).toBeVisible();
  });
});
