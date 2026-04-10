import { demoUsers, expect, test } from "@/tests/e2e/fixtures";

async function createRequest(
  page: Parameters<typeof test>[0],
  recipientContact: string,
  note: string,
) {
  await page.getByRole("link", { name: "New request" }).click();
  await expect(page).toHaveURL(/\/requests\/new$/);

  await page.getByLabel("Recipient email or phone").fill(recipientContact);
  await page.getByLabel("Amount").fill("18.25");
  await page.getByLabel(/Note \(optional\)/).fill(note);
  await page.getByRole("button", { name: "Create request" }).click();

  await expect(page).toHaveURL(/\/dashboard\/outgoing\?created=/);
}

function requestCard(page: Parameters<typeof test>[0], note: string) {
  return page.getByTestId("incoming-request-card").filter({ hasText: note }).first();
}

test("recipient can review request details with countdown and pay", async ({
  page,
  signInAs,
}) => {
  await signInAs(demoUsers.sender);
  await createRequest(page, demoUsers.recipient, "Lunch payback");

  await page.getByRole("button", { name: "Log out" }).click();
  await signInAs(demoUsers.recipient);
  await page.getByRole("link", { name: "Incoming" }).click();

  await expect(page).toHaveURL(/\/dashboard\/incoming$/);
  await expect(page.getByText("Lunch payback")).toBeVisible();
  await expect(page.getByText("Pending")).toBeVisible();

  await requestCard(page, "Lunch payback")
    .getByRole("link", { name: "View details" })
    .click();

  await expect(page).toHaveURL(/\/requests\/.+$/);
  await expect(page.getByText("Lunch payback")).toBeVisible();
  await expect(page.getByText(/Expires in|Expired/)).toBeVisible();

  await page.getByRole("button", { name: "Pay request" }).click();
  await expect(page.getByText("Request updated to Paid.")).toBeVisible();
  await expect(page.getByText("Paid")).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await signInAs(demoUsers.sender);

  await expect(page.getByText("Lunch payback")).toBeVisible();
  await expect(page.getByText("Paid")).toBeVisible();
});

test("phone-matched recipient can see and decline an incoming request", async ({
  page,
  signInAs,
}) => {
  await signInAs(demoUsers.sender);
  await createRequest(page, demoUsers.recipientPhoneContact, "Utilities split");

  await page.getByRole("button", { name: "Log out" }).click();
  await signInAs(demoUsers.recipientPhone);
  await page.getByRole("link", { name: "Incoming" }).click();

  await expect(page).toHaveURL(/\/dashboard\/incoming$/);
  await expect(page.getByText("Utilities split")).toBeVisible();
  await expect(page.getByText(demoUsers.recipientPhoneContact)).toBeVisible();

  await requestCard(page, "Utilities split")
    .getByRole("button", { name: "Decline request" })
    .click();
  await expect(page.getByText("Request updated to Declined.")).toBeVisible();
  await expect(page.getByText("Declined")).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await signInAs(demoUsers.sender);

  await expect(page.getByText("Utilities split")).toBeVisible();
  await expect(page.getByText("Declined")).toBeVisible();
});
