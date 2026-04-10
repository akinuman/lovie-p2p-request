import { demoUsers, expect, test } from "@/tests/e2e/fixtures";

async function createRequest(
  page: Parameters<typeof test>[0],
  recipientContact: string,
  note: string,
) {
  await page.goto("/requests/new");
  await expect(page).toHaveURL(/\/requests\/new$/);

  await page.getByLabel("Recipient email or phone").fill(recipientContact);
  await page.getByLabel("Amount").fill("12.40");
  await page.getByLabel(/Note \(optional\)/).fill(note);
  await page.getByRole("button", { name: "Create request" }).click();
  await expect(page).toHaveURL(/\/dashboard\/outgoing\?created=/);
}

test("outgoing dashboard debounces search, resets stale pagination, and keeps actions in-card", async ({
  page,
  signInAs,
  simulateClipboardFailure,
}) => {
  await signInAs(demoUsers.sender);

  for (let index = 1; index <= 12; index += 1) {
    await createRequest(
      page,
      demoUsers.recipient,
      `Dashboard polish ${index.toString().padStart(2, "0")}`,
    );
  }

  let delayedRequestSeen = false;
  await page.route("**/api/requests/outgoing**", async (route) => {
    const url = route.request().url();

    if (!delayedRequestSeen && url.includes("cursor=") && !url.includes("q=")) {
      delayedRequestSeen = true;
      await page.waitForTimeout(600);
    }

    await route.continue();
  });

  await page.goto("/dashboard/outgoing");
  await expect(page.getByRole("button", { name: "Apply filters" })).toHaveCount(0);
  await expect(page.getByText("Dashboard polish 12")).toBeVisible();
  await expect(page.getByText("Dashboard polish 01")).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByLabel("Search outgoing requests").fill("Dashboard polish 11");

  await expect(page).toHaveURL(/q=Dashboard(\+|%20)polish(\+|%20)11/);
  await expect(page.getByText("Dashboard polish 11")).toBeVisible();
  await expect(page.getByText("Dashboard polish 01")).toHaveCount(0);

  await page.getByTestId("outgoing-request-card")
    .filter({ hasText: "Dashboard polish 11" })
    .getByRole("button", { name: "Cancel request" })
    .click();

  await expect(page.getByText("Request updated to Cancelled.")).toBeVisible();
  await page.getByLabel("Status").selectOption("Cancelled");
  await expect(page).toHaveURL(/status=Cancelled/);
  await expect(
    page.getByTestId("outgoing-request-card").filter({ hasText: "Dashboard polish 11" }),
  ).toContainText("Cancelled");

  await simulateClipboardFailure();
  await page.reload();
  const outgoingCard = page.getByTestId("outgoing-request-card").filter({
    hasText: "Dashboard polish 11",
  });
  await outgoingCard.getByRole("button", { name: "Copy link" }).click();
  await expect(
    outgoingCard.getByText("We couldn’t copy the share link. Copy it manually below."),
  ).toBeVisible();
  await expect(outgoingCard.getByText(/http:\/\/127\.0\.0\.1:3000\/r\//)).toBeVisible();

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page).toHaveURL(/\/dashboard\/outgoing$/);
});

test("incoming dashboard appends more rows and filters without an apply step", async ({
  page,
  signInAs,
}) => {
  await signInAs(demoUsers.sender);

  for (let index = 1; index <= 12; index += 1) {
    await createRequest(
      page,
      demoUsers.recipient,
      `Incoming polish ${index.toString().padStart(2, "0")}`,
    );
  }

  await page.getByRole("button", { name: "Log out" }).click();
  await signInAs(demoUsers.recipient);
  await page.getByRole("link", { name: "Incoming" }).click();

  await expect(page.getByRole("button", { name: "Apply filters" })).toHaveCount(0);
  await expect(page.getByText("Incoming polish 12")).toBeVisible();
  await expect(page.getByText("Incoming polish 01")).toHaveCount(0);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByText("Incoming polish 01")).toBeVisible();

  await page.getByLabel("Search incoming requests").fill("Incoming polish 03");
  await expect(page).toHaveURL(/q=Incoming(\+|%20)polish(\+|%20)03/);
  await expect(page.getByText("Incoming polish 03")).toBeVisible();
  await expect(page.getByText("Incoming polish 12")).toHaveCount(0);

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(page).toHaveURL(/\/dashboard\/incoming$/);
});
