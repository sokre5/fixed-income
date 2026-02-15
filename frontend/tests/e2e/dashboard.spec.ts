import { expect, test } from "@playwright/test";

test("manual insight dashboard renders", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Fixed-Income Intelligence Journal")).toBeVisible();
  await expect(page.getByText("Manual Insight Input")).toBeVisible();
  await expect(page.getByText("Summary of Information")).toBeVisible();
});
