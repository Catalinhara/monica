import { test, expect } from "@playwright/test";

test("home exposes player and admin entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Romantic Journey" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Player Experience" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admin Editor" })).toBeVisible();
});
