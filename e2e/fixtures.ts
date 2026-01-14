import { test as base, expect, Page } from "@playwright/test";

// Extend the base test with custom fixtures
export const test = base.extend<{
  testPage: Page;
}>({
  testPage: async ({ page }, use) => {
    await use(page);
  },
});

export { expect };

// Helper functions for common actions
export async function addPlayer(page: Page, name: string) {
  await page.goto("/players/new");
  const input = page.getByLabel("Spelarnamn");
  await input.fill(name);
  // Wait for React state to update and button to become enabled
  const submitButton = page.getByRole("button", { name: "Lägg till Spelare" });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();
  await page.waitForURL("/");
}

export async function selectPlayer(
  page: Page,
  selectTrigger: string,
  playerName: string
) {
  await page.getByRole("combobox").filter({ hasText: selectTrigger }).click();
  await page.getByRole("option", { name: new RegExp(playerName) }).click();
}

export async function registerBo1Match(
  page: Page,
  player1Name: string,
  player2Name: string,
  score1: number,
  score2: number
) {
  await page.goto("/matches/new");

  // Select player 1
  await page.locator('[id="radix-\\:r3\\:-trigger"]').first().click();
  await page.getByRole("option", { name: new RegExp(player1Name) }).click();

  // Select player 2
  await page.locator('[id="radix-\\:r5\\:-trigger"]').click();
  await page.getByRole("option", { name: new RegExp(player2Name) }).click();

  // Enter scores
  const scoreInputs = page.locator('input[type="number"]');
  await scoreInputs.first().fill(score1.toString());
  await scoreInputs.nth(1).fill(score2.toString());

  // Submit
  await page.getByRole("button", { name: "Registrera Match" }).click();
  await page.waitForURL("/");
}

// Generate unique player names for tests
export function generatePlayerName(prefix: string = "Player") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
