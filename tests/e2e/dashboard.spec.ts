import { demoUsers, expect, test } from "./fixtures";

test.describe("Outgoing Dashboard", () => {
  test.beforeEach(async ({ signInAs }) => {
    await signInAs(demoUsers.sender);
  });

  test("displays outgoing request cards with statuses", async ({ page }) => {
    const cards = page.getByTestId("outgoing-request-card");
    await expect(cards.first()).toBeVisible({ timeout: 15000 });

    // Seeded data includes Pending, Paid, Declined, Cancelled
    await expect(page.getByText("Pending").first()).toBeVisible();
    await expect(page.getByText("Paid").first()).toBeVisible();
    await expect(page.getByText("Declined").first()).toBeVisible();
    await expect(page.getByText("Cancelled").first()).toBeVisible();
  });

  test("outgoing card has View details, Preview, and share link", async ({
    page,
  }) => {
    const firstCard = page.getByTestId("outgoing-request-card").first();
    await expect(firstCard).toBeVisible();

    await expect(
      firstCard.getByRole("link", { name: /view details/i }),
    ).toBeVisible();
    await expect(
      firstCard.getByRole("link", { name: /preview/i }),
    ).toBeVisible();
    await expect(firstCard.getByText("Share link")).toBeVisible();
  });

  test("pending outgoing card shows Cancel button", async ({ page }) => {
    const pendingCard = page
      .getByTestId("outgoing-request-card")
      .filter({
        hasText: "Pending",
      })
      .first();
    await expect(pendingCard).toBeVisible();

    await expect(
      pendingCard.getByRole("button", { name: /cancel/i }),
    ).toBeVisible();
  });

  test("status filter updates list without Apply button", async ({ page }) => {
    // Select "Paid" filter
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Paid" }).click();

    // Wait for URL to update
    await expect(page).toHaveURL(/status=Paid/);

    // Wait for filtered results to appear
    const firstCard = page.getByTestId("outgoing-request-card").first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await expect(firstCard.getByText("Paid")).toBeVisible();
  });

  test("search filters results with debounce", async ({ page }) => {
    const searchInput = page.getByPlaceholder(
      "Search by request id, contact, or note",
    );
    await searchInput.fill("Coffee");

    // Wait for debounced search to apply
    await expect(page).toHaveURL(/q=Coffee/, { timeout: 5000 });

    // Should show matching result
    await expect(
      page.getByText("Coffee and croissant from Tuesday"),
    ).toBeVisible({ timeout: 15000 });
  });

  test("clear button resets filters", async ({ page }) => {
    // Apply a filter first
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Paid" }).click();
    await expect(page).toHaveURL(/status=Paid/);

    // Click clear
    await page.getByRole("button", { name: /clear/i }).click();

    // URL should be clean
    await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
  });
});

test.describe("Incoming Dashboard", () => {
  test.beforeEach(async ({ signInAs }) => {
    await signInAs(demoUsers.recipient);
  });

  test("displays incoming request cards", async ({ page }) => {
    await page.goto("/dashboard/incoming");

    const cards = page.getByTestId("incoming-request-card");
    await expect(cards.first()).toBeVisible();
  });

  test("incoming pending card has Pay and Decline actions", async ({
    page,
  }) => {
    await page.goto("/dashboard/incoming");

    const pendingCard = page
      .getByTestId("incoming-request-card")
      .filter({
        hasText: "Pending",
      })
      .first();
    await expect(pendingCard).toBeVisible();

    await expect(
      pendingCard.getByRole("button", { name: /pay/i }),
    ).toBeVisible();
    await expect(
      pendingCard.getByRole("button", { name: /decline/i }),
    ).toBeVisible();
  });

  test("incoming card has View details link", async ({ page }) => {
    await page.goto("/dashboard/incoming");

    const firstCard = page.getByTestId("incoming-request-card").first();
    await expect(firstCard).toBeVisible();
    await expect(
      firstCard.getByRole("link", { name: /view details/i }),
    ).toBeVisible();
  });

  test("status filter works on incoming dashboard", async ({ page }) => {
    await page.goto("/dashboard/incoming");

    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Pending" }).click();

    await expect(page).toHaveURL(/status=Pending/);

    // Wait for filtered results
    const firstCard = page.getByTestId("incoming-request-card").first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
  });
});
