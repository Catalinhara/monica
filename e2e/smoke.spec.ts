import { test, expect } from "@playwright/test";

test("home exposes player and admin entry points", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Una historia hecha para ti" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Empezar el viaje" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admin Editor" })).toBeVisible();
});
