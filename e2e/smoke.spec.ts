import { test, expect } from "@playwright/test";

test("home redirects to monica experience", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/monica\/?$/);
});

test("monica map loads with levels", async ({ page }) => {
  await page.goto("/monica", { waitUntil: "networkidle" });
  await expect(page.getByText("Cargando experiencia…")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Hola, Mónica/ })).toBeVisible();
  await expect(page.getByRole("list", { name: "Lista de niveles" })).toBeVisible();
  await expect(page.getByRole("button", { name: /El comienzo/ })).toBeEnabled();
  await expect(page.getByRole("link", { name: /editor/i })).toHaveCount(0);
});

test("legacy play path redirects to monica", async ({ page }) => {
  await page.goto("/play", { waitUntil: "networkidle" });
  await expect(page).toHaveURL(/\/monica\/?$/);
});

test("admin editor shell loads", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "networkidle" });
  await expect(page.getByText("Cargando editor…")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Experiencia" })).toBeVisible();
  await expect(page.getByRole("button", { name: /El comienzo/ }).first()).toBeVisible();
});

test("admin assets panel is reachable", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Assets" }).first().click();
  await expect(page.getByRole("heading", { name: "Asset Manager" })).toBeVisible();
  await expect(page.getByText(/Arrastra fotos/)).toBeVisible();
});
