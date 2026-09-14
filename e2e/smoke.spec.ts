import { test, expect } from "@playwright/test";

test("home exposes player and admin entry points", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Una historia hecha para ti" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Empezar el viaje" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Admin Editor" })).toBeVisible();
});

test("play map loads with levels", async ({ page }) => {
  await page.goto("/play", { waitUntil: "networkidle" });
  await expect(page.getByText("Cargando experiencia…")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Hola,/ })).toBeVisible();
  await expect(page.getByRole("list", { name: "Lista de niveles" })).toBeVisible();
  await expect(page.getByRole("button", { name: /El comienzo/ })).toBeEnabled();
});

test("admin editor shell loads", async ({ page }) => {
  await page.goto("/admin", { waitUntil: "networkidle" });
  await expect(page.getByText("Cargando editor…")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Experiencia" })).toBeVisible();
  await expect(page.getByRole("button", { name: /El comienzo/ }).first()).toBeVisible();
});
