import { test, expect, generatePlayerName } from "./fixtures";

test.describe("Player Management", () => {
  test("should add a new player successfully", async ({ page }) => {
    const playerName = generatePlayerName("TestPlayer");

    await page.goto("/players/new");

    // Verify page title
    await expect(
      page.getByRole("heading", { name: "Lägg till Ny Spelare" })
    ).toBeVisible();

    // Fill in player name
    await page.getByLabel("Spelarnamn").fill(playerName);

    // Wait for button to be enabled and submit form
    const submitButton = page.getByRole("button", { name: "Lägg till Spelare" });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Should redirect to dashboard
    await page.waitForURL("/");

    // Verify player appears in leaderboard with 1000 ELO
    await expect(page.getByRole("link", { name: playerName })).toBeVisible();
    await expect(
      page.getByRole("row", { name: new RegExp(playerName) })
    ).toContainText("1000");
  });

  test("should show error for empty player name", async ({ page }) => {
    await page.goto("/players/new");

    // Try to submit with empty name
    await page.getByRole("button", { name: "Lägg till Spelare" }).click();

    // Button should be disabled when name is empty
    await expect(
      page.getByRole("button", { name: "Lägg till Spelare" })
    ).toBeDisabled();
  });

  test("should show error for duplicate player name", async ({ page }) => {
    const playerName = generatePlayerName("DuplicateTest");

    // Create first player
    await page.goto("/players/new");
    await page.getByLabel("Spelarnamn").fill(playerName);
    const submitButton = page.getByRole("button", { name: "Lägg till Spelare" });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await page.waitForURL("/");

    // Try to create second player with same name
    await page.goto("/players/new");
    await page.getByLabel("Spelarnamn").fill(playerName);
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();

    // Should show error message
    await expect(page.getByText(/finns redan|existerar/i)).toBeVisible();
  });

  test("should navigate to player details from leaderboard", async ({
    page,
  }) => {
    const playerName = generatePlayerName("DetailsTest");

    // Create a player first
    await page.goto("/players/new");
    await page.getByLabel("Spelarnamn").fill(playerName);
    const submitButton = page.getByRole("button", { name: "Lägg till Spelare" });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await page.waitForURL("/");

    // Click on player name in leaderboard
    await page.getByRole("link", { name: playerName }).click();

    // Should be on player details page
    await expect(page.url()).toContain("/players/");
    await expect(
      page.getByRole("heading", { name: playerName })
    ).toBeVisible();

    // Verify stats are shown
    await expect(page.getByText("ELO")).toBeVisible();
    await expect(page.getByText("Vinster")).toBeVisible();
    await expect(page.getByText("Förluster")).toBeVisible();
    await expect(page.getByText("Win%")).toBeVisible();

    // New player should have 1000 ELO, 0 wins, 0 losses
    await expect(page.locator("text=1000").first()).toBeVisible();
  });

  test("should navigate back to dashboard from player page", async ({
    page,
  }) => {
    const playerName = generatePlayerName("NavTest");

    // Create a player
    await page.goto("/players/new");
    await page.getByLabel("Spelarnamn").fill(playerName);
    const submitButton = page.getByRole("button", { name: "Lägg till Spelare" });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
    await submitButton.click();
    await page.waitForURL("/");

    // Go to player details
    await page.getByRole("link", { name: playerName }).click();
    await expect(page.url()).toContain("/players/");

    // Click back link
    await page.getByRole("link", { name: "Tillbaka till Översikt" }).click();

    // Should be back on dashboard
    await expect(page.url()).toBe(page.url().split("/players")[0] + "/");
  });

  test("should cancel adding player and return to dashboard", async ({
    page,
  }) => {
    await page.goto("/players/new");

    // Click cancel button
    await page.getByRole("button", { name: "Avbryt" }).click();

    // Should be back on dashboard
    await page.waitForURL("/");
  });
});
