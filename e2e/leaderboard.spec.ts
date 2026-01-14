import { test, expect, generatePlayerName, addPlayer } from "./fixtures";

test.describe("Dashboard and Leaderboard", () => {
  test("should display the dashboard with hero section", async ({ page }) => {
    await page.goto("/");

    // Verify hero section
    await expect(page.getByText("Ping Pong")).toBeVisible();
    await expect(page.getByText("ELO")).toBeVisible();
    await expect(
      page.getByText("Topplista för Pingis World Ranking")
    ).toBeVisible();
  });

  test("should display navigation buttons", async ({ page }) => {
    await page.goto("/");

    // Verify navigation buttons
    await expect(
      page.getByRole("button", { name: /Registrera Match/ })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Lägg till Spelare/ })
    ).toBeVisible();
  });

  test("should navigate to match registration from dashboard", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Registrera Match/ }).click();

    await page.waitForURL("/matches/new");
    await expect(
      page.getByRole("heading", { name: "Registrera Match" })
    ).toBeVisible();
  });

  test("should navigate to add player from dashboard", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Lägg till Spelare/ }).click();

    await page.waitForURL("/players/new");
    await expect(
      page.getByRole("heading", { name: "Lägg till Ny Spelare" })
    ).toBeVisible();
  });

  test("should display leaderboard table with correct columns", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify table headers
    await expect(page.getByRole("columnheader", { name: "Rank" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Spelare" })
    ).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "ELO" })).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Vinster" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Förluster" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Win%" })
    ).toBeVisible();
  });

  test("should sort players by ELO in descending order", async ({ page }) => {
    // Create two players
    const player1 = generatePlayerName("SortP1");
    const player2 = generatePlayerName("SortP2");

    await addPlayer(page, player1);
    await addPlayer(page, player2);

    // Register a match so they have different ELOs
    await page.goto("/matches/new");

    const selectTriggers = page.getByRole("combobox");
    await selectTriggers.first().click();
    await page.getByRole("option", { name: new RegExp(player1) }).click();

    await selectTriggers.nth(1).click();
    await page.getByRole("option", { name: new RegExp(player2) }).click();

    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.first().fill("11");
    await scoreInputs.nth(1).fill("5");

    await page.getByRole("button", { name: "Registrera Match" }).click();
    await page.waitForURL("/");

    // Get all player rows - winner should appear before loser
    const rows = page.locator("tbody tr");
    const firstRowText = await rows.first().textContent();
    const lastRowText = await rows.last().textContent();

    // The winner (player1) should have higher ELO
    expect(firstRowText).toContain(player1);
  });

  test("should display recent matches section", async ({ page }) => {
    await page.goto("/");

    // Verify recent matches section exists
    await expect(page.getByText("Senaste Matcher")).toBeVisible();
  });

  test("should show empty state when no matches", async ({ page }) => {
    // This test assumes a fresh database or we filter for specific players
    await page.goto("/");

    // If there are no matches, should show empty message
    // Note: This might not always pass if there are existing matches
    const recentMatchesSection = page.locator("text=Senaste Matcher").locator("..");
    const noMatchesText = recentMatchesSection.getByText("Inga matcher än");

    // Either no matches text is visible or there are match cards
    const hasMatches = await recentMatchesSection.locator(".bg-table-row").count() > 0;
    if (!hasMatches) {
      await expect(noMatchesText).toBeVisible();
    }
  });

  test("should display match details in recent matches", async ({ page }) => {
    const player1 = generatePlayerName("RecentP1");
    const player2 = generatePlayerName("RecentP2");

    await addPlayer(page, player1);
    await addPlayer(page, player2);

    // Register a match
    await page.goto("/matches/new");

    const selectTriggers = page.getByRole("combobox");
    await selectTriggers.first().click();
    await page.getByRole("option", { name: new RegExp(player1) }).click();

    await selectTriggers.nth(1).click();
    await page.getByRole("option", { name: new RegExp(player2) }).click();

    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.first().fill("11");
    await scoreInputs.nth(1).fill("9");

    await page.getByRole("button", { name: "Registrera Match" }).click();
    await page.waitForURL("/");

    // Verify match details in recent matches
    const recentMatchesSection = page.locator("text=Senaste Matcher").locator("..");
    await expect(recentMatchesSection.getByText(player1)).toBeVisible();
    await expect(recentMatchesSection.getByText(player2)).toBeVisible();
    await expect(recentMatchesSection.getByText("11 - 9")).toBeVisible();
    await expect(recentMatchesSection.getByText("Bo1")).toBeVisible();
    await expect(recentMatchesSection.getByText(/Vinnare:/)).toBeVisible();
  });
});

test.describe("Player Details Page", () => {
  test("should display player statistics", async ({ page }) => {
    const playerName = generatePlayerName("StatsP");

    await addPlayer(page, playerName);

    // Navigate to player details
    await page.goto("/");
    await page.getByRole("link", { name: playerName }).click();

    // Verify stats are displayed
    await expect(page.getByText("ELO").first()).toBeVisible();
    await expect(page.getByText("Vinster")).toBeVisible();
    await expect(page.getByText("Förluster")).toBeVisible();
    await expect(page.getByText("Win%")).toBeVisible();

    // New player should have initial stats
    await expect(page.locator("text=1000").first()).toBeVisible();
    await expect(page.locator(".text-positive").filter({ hasText: "0" })).toBeVisible();
    await expect(page.locator(".text-negative").filter({ hasText: "0" })).toBeVisible();
  });

  test("should display match history section", async ({ page }) => {
    const playerName = generatePlayerName("HistoryP");

    await addPlayer(page, playerName);

    await page.goto("/");
    await page.getByRole("link", { name: playerName }).click();

    // Verify match history section exists
    await expect(page.getByText("Matchhistorik")).toBeVisible();

    // New player should have no matches
    await expect(page.getByText("Inga matcher än")).toBeVisible();
  });

  test("should show match history after playing matches", async ({ page }) => {
    const player1 = generatePlayerName("HistP1");
    const player2 = generatePlayerName("HistP2");

    await addPlayer(page, player1);
    await addPlayer(page, player2);

    // Register a match
    await page.goto("/matches/new");

    const selectTriggers = page.getByRole("combobox");
    await selectTriggers.first().click();
    await page.getByRole("option", { name: new RegExp(player1) }).click();

    await selectTriggers.nth(1).click();
    await page.getByRole("option", { name: new RegExp(player2) }).click();

    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.first().fill("11");
    await scoreInputs.nth(1).fill("7");

    await page.getByRole("button", { name: "Registrera Match" }).click();
    await page.waitForURL("/");

    // Go to player1's details
    await page.getByRole("link", { name: player1 }).first().click();

    // Should show match in history
    await expect(page.getByText(`vs ${player2}`)).toBeVisible();
    await expect(page.getByText("11 - 7")).toBeVisible();
    await expect(page.getByText("Vinst")).toBeVisible();
    await expect(page.getByText(/\+\d+ ELO/)).toBeVisible();
  });

  test("should update player stats after match", async ({ page }) => {
    const player1 = generatePlayerName("UpdateP1");
    const player2 = generatePlayerName("UpdateP2");

    await addPlayer(page, player1);
    await addPlayer(page, player2);

    // Register a match where player1 wins
    await page.goto("/matches/new");

    const selectTriggers = page.getByRole("combobox");
    await selectTriggers.first().click();
    await page.getByRole("option", { name: new RegExp(player1) }).click();

    await selectTriggers.nth(1).click();
    await page.getByRole("option", { name: new RegExp(player2) }).click();

    const scoreInputs = page.locator('input[type="number"]');
    await scoreInputs.first().fill("11");
    await scoreInputs.nth(1).fill("3");

    await page.getByRole("button", { name: "Registrera Match" }).click();
    await page.waitForURL("/");

    // Check player1's stats (winner)
    await page.getByRole("link", { name: player1 }).first().click();

    // Should have 1 win, 0 losses
    await expect(page.locator(".text-positive").filter({ hasText: "1" })).toBeVisible();

    // Go back and check player2's stats (loser)
    await page.goto("/");
    await page.getByRole("link", { name: player2 }).first().click();

    // Should have 0 wins, 1 loss
    await expect(page.locator(".text-negative").filter({ hasText: "1" })).toBeVisible();
  });
});
