import { demoUsers, expect, test } from "./fixtures";

test.describe("Public Share Link", () => {
  test("non-recipient sees limited summary without actions", async ({
    signInAs,
    page,
  }) => {
    // First, sign in as sender and get a request ID from the outgoing dashboard
    await signInAs(demoUsers.sender);

    const firstCard = page.getByTestId("outgoing-request-card").first();
    const previewLink = firstCard.getByRole("link", { name: /preview/i });
    const previewHref = await previewLink.getAttribute("href");

    // Clear session so we're unauthenticated
    await page.context().clearCookies();

    // Visit the share link directly
    await page.goto(previewHref!);

    // Should see the public summary page
    await expect(page.getByText(/public request summary/i)).toBeVisible();

    // Should see the amount
    await expect(page.getByText(/\$/).first()).toBeVisible();

    // Should see sender label
    await expect(page.getByText(demoUsers.sender)).toBeVisible();

    // Should NOT see Pay or Decline buttons
    await expect(page.getByRole("button", { name: /pay/i })).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: /decline/i }),
    ).not.toBeVisible();

    // Should have a sign-in link
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("recipient visiting share link is redirected to detail page", async ({
    signInAs,
    page,
  }) => {
    // Sign in as sender and get a share link for a request to recipient
    await signInAs(demoUsers.sender);

    const pendingCard = page
      .getByTestId("outgoing-request-card")
      .filter({
        hasText: "Pending",
      })
      .first();
    const previewLink = pendingCard.getByRole("link", { name: /preview/i });
    const previewHref = await previewLink.getAttribute("href");

    // Sign in as recipient (the intended recipient)
    await signInAs(demoUsers.recipient);

    // Visit the share link — should redirect to detail page
    await page.goto(previewHref!);
    await expect(page).toHaveURL(/\/requests\//);

    // Should see full details with actions
    await expect(page.getByRole("button", { name: /pay/i })).toBeVisible();
  });

  test("sign-in from share page redirects to request detail", async ({
    signInAs,
    page,
  }) => {
    // Sign in as sender and grab a share link for a pending request
    await signInAs(demoUsers.sender);

    const pendingCard = page
      .getByTestId("outgoing-request-card")
      .filter({
        hasText: "Pending",
      })
      .first();
    const previewLink = pendingCard.getByRole("link", { name: /preview/i });
    const previewHref = await previewLink.getAttribute("href");
    const requestId = previewHref!.split("/r/")[1];

    // Clear session and visit the share link as unauthed user
    await page.context().clearCookies();
    await page.goto(previewHref!);

    // Click "Sign in to continue" — should navigate to /sign-in?from=/requests/<id>
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(
      new RegExp(`/sign-in\\?from=%2Frequests%2F${requestId}`),
    );

    // Sign in as recipient
    await page
      .getByRole("textbox", { name: "Email" })
      .fill(demoUsers.recipient);
    await page.getByRole("button", { name: "Continue to dashboard" }).click();

    // Should land on the request detail page, not the dashboard
    await expect(page).toHaveURL(new RegExp(`/requests/${requestId}`));
  });

  test("share page shows terminal status for resolved requests", async ({
    signInAs,
    page,
  }) => {
    // Sign in as sender and filter to Paid
    await signInAs(demoUsers.sender);

    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "Paid" }).click();
    await expect(page).toHaveURL(/status=Paid/);

    const paidCard = page.getByTestId("outgoing-request-card").first();
    const previewLink = paidCard.getByRole("link", { name: /preview/i });
    const previewHref = await previewLink.getAttribute("href");

    // Clear session
    await page.context().clearCookies();
    await page.goto(previewHref!);

    // Should show Paid status
    await expect(page.getByText("Paid")).toBeVisible();
  });
});
