import { demoUsers, expect, test } from "@/tests/e2e/fixtures";

const EXPIRED_SEEDED_NOTE = "Expired seeded request";

async function createRequest(
  page: Parameters<typeof test>[0],
  recipientContact: string,
  note: string,
  options?: {
    keepDialogOpen?: boolean;
  },
) {
  await page.getByRole("link", { name: "New request" }).click();
  await expect(page).toHaveURL(/\/requests\/new$/);

  await page.getByLabel("Recipient email or phone").fill(recipientContact);
  await page.getByLabel("Amount").fill("31.00");
  await page.getByLabel(/Note \(optional\)/).fill(note);
  await page.getByRole("button", { name: "Create request" }).click();

  await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
  await expect(page.getByText("Your request is ready to share.")).toBeVisible();

  if (!options?.keepDialogOpen) {
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
  }
}

function outgoingCard(page: Parameters<typeof test>[0], note: string) {
  return page.getByTestId("outgoing-request-card").filter({ hasText: note }).first();
}

function incomingCard(page: Parameters<typeof test>[0], note: string) {
  return page.getByTestId("incoming-request-card").filter({ hasText: note }).first();
}

async function chooseStatus(
  page: Parameters<typeof test>[0],
  label: string,
  value: string,
) {
  await page.getByLabel(label).click();
  await page.getByRole("option", { name: value }).click();
}

test("sender can cancel a pending request and filter outgoing requests", async ({
  page,
  signInAs,
}) => {
  await signInAs(demoUsers.sender);
  let delayedOutgoingFilterTransitionSeen = false;
  await page.route("**/dashboard/outgoing?**", async (route) => {
    const url = route.request().url();

    if (
      !delayedOutgoingFilterTransitionSeen &&
      (url.includes("q=") || url.includes("status="))
    ) {
      delayedOutgoingFilterTransitionSeen = true;
      await page.waitForTimeout(600);
    }

    await route.continue();
  });

  await createRequest(page, demoUsers.recipient, "Cancel me");
  await createRequest(page, demoUsers.recipient, "Keep me visible");

  await expect(page.getByText("Cancel me")).toBeVisible();
  await expect(page.getByText("Keep me visible")).toBeVisible();

  await outgoingCard(page, "Cancel me")
    .getByRole("button", { name: "Cancel request" })
    .click();

  await expect(page.getByText("Request cancelled.")).toBeVisible();
  await expect(outgoingCard(page, "Cancel me").getByText("Cancelled")).toBeVisible();

  await page.getByLabel("Search outgoing requests").fill("Keep me");
  await expect(page).toHaveURL(/q=Keep(\+|%20)me/);
  await expect(page.getByText("Keep me visible")).toBeVisible();
  await expect(page.getByText("Cancel me")).toHaveCount(0);

  await chooseStatus(page, "Status", "Cancelled");
  await expect(page.getByText("Updating results...")).toBeVisible();
  await expect(page.getByTestId("dashboard-results-loading")).toBeVisible();
  await expect(page).toHaveURL(/status=Cancelled/);
  await expect(page.getByText("No outgoing requests match these filters")).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page.getByText("Updating results...")).toBeVisible();
  await expect(page.getByTestId("dashboard-results-loading")).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
  await expect(page.getByText("Cancel me")).toBeVisible();
});

test("recipient sees expired requests as non-payable and can filter incoming requests", async ({
  page,
  signInAs,
}) => {
  await signInAs(demoUsers.recipient);
  let delayedIncomingFilterTransitionSeen = false;
  await page.route("**/dashboard/incoming?**", async (route) => {
    const url = route.request().url();

    if (
      !delayedIncomingFilterTransitionSeen &&
      (url.includes("q=") || url.includes("status="))
    ) {
      delayedIncomingFilterTransitionSeen = true;
      await page.waitForTimeout(600);
    }

    await route.continue();
  });

  await page.getByRole("link", { name: "Incoming" }).click();

  await expect(page).toHaveURL(/\/dashboard\/incoming$/);
  await expect(page.getByText(EXPIRED_SEEDED_NOTE)).toBeVisible();
  await expect(incomingCard(page, EXPIRED_SEEDED_NOTE).getByText("Expired")).toBeVisible();

  await incomingCard(page, EXPIRED_SEEDED_NOTE)
    .getByRole("link", { name: "View details" })
    .click();

  await expect(page).toHaveURL(/\/requests\/.+$/);
  await expect(page.getByText(EXPIRED_SEEDED_NOTE)).toBeVisible();
  await expect(page.getByText("This request has expired and can no longer be acted on.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pay request" })).toHaveCount(0);

  await page.getByRole("link", { name: "Incoming" }).click();
  await page.getByLabel("Search incoming requests").fill("Expired seeded");
  await chooseStatus(page, "Status", "Expired");

  await expect(page.getByText("Updating results...")).toBeVisible();
  await expect(page.getByTestId("dashboard-results-loading")).toBeVisible();
  await expect(page).toHaveURL(/status=Expired/);
  await expect(page.getByText(EXPIRED_SEEDED_NOTE)).toBeVisible();
});
