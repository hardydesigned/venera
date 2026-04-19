import { test, expect } from "@playwright/test";

const TEST_EMAIL = "dietermieter404@gmail.com";
const TEST_PASSWORD = "TestPasswort123!";

test.describe("Authentifizierung", () => {
  test("Registrierung eines neuen Kontos", async ({ page }) => {
    const uniqueEmail = `test+${Date.now()}@example.com`;

    await page.goto("/register");
    await expect(page.getByText("Registrieren").first()).toBeVisible();

    await page.getByLabel("Name").fill("Test Nutzer");
    await page.getByLabel("E-Mail").fill(uniqueEmail);
    await page.getByLabel("Passwort", { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel("Passwort bestätigen").fill(TEST_PASSWORD);

    await page.getByRole("button", { name: "Konto erstellen" }).click();

    await expect(page).toHaveURL(/\/(inbox|$)/, { timeout: 10000 });
  });

  test("Login mit vorhandenem Konto", async ({ page, context }) => {
    // Account anlegen falls noch nicht vorhanden
    await page.goto("/register");
    await page.getByLabel("Name").fill("Dieter Mieter");
    await page.getByLabel("E-Mail").fill(TEST_EMAIL);
    await page.getByLabel("Passwort", { exact: true }).fill(TEST_PASSWORD);
    await page.getByLabel("Passwort bestätigen").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Konto erstellen" }).click();
    await page.waitForTimeout(2000);

    // Auth-State löschen damit wir uns neu einloggen können
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto("/login");
    await expect(page.getByText("Anmelden").first()).toBeVisible({ timeout: 5000 });

    await page.getByLabel("E-Mail").fill(TEST_EMAIL);
    await page.getByLabel("Passwort").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Anmelden" }).click();

    await expect(page).toHaveURL(/\/(inbox|$)/, { timeout: 10000 });
  });

  test("Login mit falschen Daten zeigt Fehlermeldung", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("E-Mail").fill(TEST_EMAIL);
    await page.getByLabel("Passwort").fill("falschesPasswort999");

    await page.getByRole("button", { name: "Anmelden" }).click();

    await expect(page.getByText(/fehlgeschlagen|Fehler/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("Passwörter stimmen nicht überein bei Registrierung", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Name").fill("Test Nutzer");
    await page.getByLabel("E-Mail").fill("test@example.com");
    await page.getByLabel("Passwort", { exact: true }).fill("Passwort123!");
    await page.getByLabel("Passwort bestätigen").fill("AnderesPasSwort!");

    await page.getByRole("button", { name: "Konto erstellen" }).click();

    await expect(page.getByText(/stimmen nicht überein/i)).toBeVisible({ timeout: 3000 });
  });
});
