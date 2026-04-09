import { demoUsers, expect, test } from "@/tests/e2e/fixtures";

test("sender can create a request and preview the share summary", async ({
  page,
  signInAs,
}) => {
  await signInAs(demoUsers.sender);

  await page.getByRole("link", { name: "New request" }).click();
  await expect(page).toHaveURL(/\/requests\/new$/);

  await page.getByLabel("Recipient email or phone").fill(demoUsers.recipient);
  await page.getByLabel("Amount").fill("24.50");
  await page.getByLabel(/Note \(optional\)/).fill("Dinner split");
  await page.getByRole("button", { name: "Create request" }).click();

  await expect(page).toHaveURL(/\/dashboard\/outgoing\?created=/);
  await expect(page.getByText("NEXT_REDIRECT")).toHaveCount(0);
  await expect(page.getByText("Request created and ready to share.")).toBeVisible();
  await expect(page.getByText("Dinner split")).toBeVisible();
  await expect(page.getByText("Pending")).toBeVisible();

  const sharePreviewLink = page.getByRole("link", { name: "Preview share page" });
  await expect(sharePreviewLink).toBeVisible();
  await sharePreviewLink.click();

  await expect(page).toHaveURL(/\/r\/.+$/);
  await expect(page.getByText("Shared summary")).toBeVisible();
  await expect(page.getByText("Dinner split")).toBeVisible();
  await expect(
    page.getByText("Only the intended recipient can unlock full details"),
  ).toBeVisible();
});
