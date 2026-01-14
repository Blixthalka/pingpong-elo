import { test, expect, generatePlayerName, addPlayer } from "./fixtures";

test.describe("Match Registration", () => {
  test.describe("Bo1 Matches", () => {
    test("should register a valid Bo1 match", async ({ page }) => {
      // Create two players
      const player1 = generatePlayerName("MatchP1");
      const player2 = generatePlayerName("MatchP2");

      await addPlayer(page, player1);
      await addPlayer(page, player2);

      // Go to match registration
      await page.goto("/matches/new");

      // Select players
      const selectTriggers = page.getByRole("combobox");
      await selectTriggers.first().click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      await selectTriggers.nth(1).click();
      await page.getByRole("option", { name: new RegExp(player2) }).click();

      // Enter valid scores (11-5)
      const scoreInputs = page.locator('input[type="number"]');
      await scoreInputs.first().fill("11");
      await scoreInputs.nth(1).fill("5");

      // Verify match complete indicator
      await expect(page.getByText(/vinner matchen!/)).toBeVisible();

      // Submit match
      await page.getByRole("button", { name: "Registrera Match" }).click();
      await page.waitForURL("/");

      // Verify match appears in recent matches
      await expect(page.getByText(`${player1}`)).toBeVisible();
      await expect(page.getByText(`${player2}`)).toBeVisible();
      await expect(page.getByText("11 - 5")).toBeVisible();
    });

    test("should show winner indicator for deuce scores", async ({ page }) => {
      const player1 = generatePlayerName("DeuceP1");
      const player2 = generatePlayerName("DeuceP2");

      await addPlayer(page, player1);
      await addPlayer(page, player2);

      await page.goto("/matches/new");

      // Select players
      const selectTriggers = page.getByRole("combobox");
      await selectTriggers.first().click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      await selectTriggers.nth(1).click();
      await page.getByRole("option", { name: new RegExp(player2) }).click();

      // Enter deuce score (12-10)
      const scoreInputs = page.locator('input[type="number"]');
      await scoreInputs.first().fill("12");
      await scoreInputs.nth(1).fill("10");

      // Should show winner indicator
      await expect(page.getByText(/vinner matchen!/)).toBeVisible();
    });

    test("should not allow invalid score (less than 11 points)", async ({
      page,
    }) => {
      const player1 = generatePlayerName("InvalidP1");
      const player2 = generatePlayerName("InvalidP2");

      await addPlayer(page, player1);
      await addPlayer(page, player2);

      await page.goto("/matches/new");

      // Select players
      const selectTriggers = page.getByRole("combobox");
      await selectTriggers.first().click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      await selectTriggers.nth(1).click();
      await page.getByRole("option", { name: new RegExp(player2) }).click();

      // Enter invalid scores (8-5)
      const scoreInputs = page.locator('input[type="number"]');
      await scoreInputs.first().fill("8");
      await scoreInputs.nth(1).fill("5");

      // Submit button should be disabled
      await expect(
        page.getByRole("button", { name: "Registrera Match" })
      ).toBeDisabled();
    });

    test("should not allow invalid score (less than 2 point difference)", async ({
      page,
    }) => {
      const player1 = generatePlayerName("DiffP1");
      const player2 = generatePlayerName("DiffP2");

      await addPlayer(page, player1);
      await addPlayer(page, player2);

      await page.goto("/matches/new");

      // Select players
      const selectTriggers = page.getByRole("combobox");
      await selectTriggers.first().click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      await selectTriggers.nth(1).click();
      await page.getByRole("option", { name: new RegExp(player2) }).click();

      // Enter invalid scores (11-10 - only 1 point difference)
      const scoreInputs = page.locator('input[type="number"]');
      await scoreInputs.first().fill("11");
      await scoreInputs.nth(1).fill("10");

      // Submit button should be disabled
      await expect(
        page.getByRole("button", { name: "Registrera Match" })
      ).toBeDisabled();
    });
  });

  test.describe("Bo3 Matches", () => {
    test("should register a valid Bo3 match", async ({ page }) => {
      const player1 = generatePlayerName("Bo3P1");
      const player2 = generatePlayerName("Bo3P2");

      await addPlayer(page, player1);
      await addPlayer(page, player2);

      await page.goto("/matches/new");

      // Select players
      const selectTriggers = page.getByRole("combobox");
      await selectTriggers.first().click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      await selectTriggers.nth(1).click();
      await page.getByRole("option", { name: new RegExp(player2) }).click();

      // Change to Bo3 format
      await selectTriggers.nth(2).click();
      await page.getByRole("option", { name: "Bäst av 3 set" }).click();

      // Enter sets won (2-1)
      const scoreInputs = page.locator('input[type="number"]');
      await scoreInputs.first().fill("2");
      await scoreInputs.nth(1).fill("1");

      // Should show winner indicator
      await expect(page.getByText(/vinner matchen!/)).toBeVisible();

      // Submit
      await page.getByRole("button", { name: "Registrera Match" }).click();
      await page.waitForURL("/");

      // Verify match appears with Bo3 label
      await expect(page.getByText("Bo3")).toBeVisible();
    });
  });

  test.describe("Bo5 Matches", () => {
    test("should register a valid Bo5 match", async ({ page }) => {
      const player1 = generatePlayerName("Bo5P1");
      const player2 = generatePlayerName("Bo5P2");

      await addPlayer(page, player1);
      await addPlayer(page, player2);

      await page.goto("/matches/new");

      // Select players
      const selectTriggers = page.getByRole("combobox");
      await selectTriggers.first().click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      await selectTriggers.nth(1).click();
      await page.getByRole("option", { name: new RegExp(player2) }).click();

      // Change to Bo5 format
      await selectTriggers.nth(2).click();
      await page.getByRole("option", { name: "Bäst av 5 set" }).click();

      // Enter sets won (3-2)
      const scoreInputs = page.locator('input[type="number"]');
      await scoreInputs.first().fill("3");
      await scoreInputs.nth(1).fill("2");

      // Should show winner indicator
      await expect(page.getByText(/vinner matchen!/)).toBeVisible();

      // Submit
      await page.getByRole("button", { name: "Registrera Match" }).click();
      await page.waitForURL("/");

      // Verify match appears with Bo5 label
      await expect(page.getByText("Bo5")).toBeVisible();
    });
  });

  test.describe("Match Validation", () => {
    test("should not allow same player on both sides", async ({ page }) => {
      const player1 = generatePlayerName("SameP");

      await addPlayer(page, player1);

      await page.goto("/matches/new");

      // Select same player for both
      const selectTriggers = page.getByRole("combobox");
      await selectTriggers.first().click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      await selectTriggers.nth(1).click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      // Enter valid scores
      const scoreInputs = page.locator('input[type="number"]');
      await scoreInputs.first().fill("11");
      await scoreInputs.nth(1).fill("5");

      // Try to submit
      await page.getByRole("button", { name: "Registrera Match" }).click();

      // Should show error
      await expect(page.getByText(/olika|Spelarna måste vara olika/i)).toBeVisible();
    });

    test("should reset scores when changing match format", async ({ page }) => {
      const player1 = generatePlayerName("ResetP1");
      const player2 = generatePlayerName("ResetP2");

      await addPlayer(page, player1);
      await addPlayer(page, player2);

      await page.goto("/matches/new");

      // Select players
      const selectTriggers = page.getByRole("combobox");
      await selectTriggers.first().click();
      await page.getByRole("option", { name: new RegExp(player1) }).click();

      await selectTriggers.nth(1).click();
      await page.getByRole("option", { name: new RegExp(player2) }).click();

      // Enter scores for Bo1
      const scoreInputs = page.locator('input[type="number"]');
      await scoreInputs.first().fill("11");
      await scoreInputs.nth(1).fill("5");

      // Change to Bo3
      await selectTriggers.nth(2).click();
      await page.getByRole("option", { name: "Bäst av 3 set" }).click();

      // Scores should be reset
      await expect(scoreInputs.first()).toHaveValue("");
      await expect(scoreInputs.nth(1)).toHaveValue("");
    });
  });

  test.describe("ELO Updates", () => {
    test("should update ELO ratings after match", async ({ page }) => {
      const player1 = generatePlayerName("ELOP1");
      const player2 = generatePlayerName("ELOP2");

      await addPlayer(page, player1);
      await addPlayer(page, player2);

      // Both should start at 1000 ELO
      await page.goto("/");
      await expect(
        page.getByRole("row", { name: new RegExp(player1) })
      ).toContainText("1000");
      await expect(
        page.getByRole("row", { name: new RegExp(player2) })
      ).toContainText("1000");

      // Register a match
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

      // Winner should have gained ELO (> 1000)
      const player1Row = page.getByRole("row", { name: new RegExp(player1) });
      await expect(player1Row).not.toContainText(/\s1000\s/);

      // Loser should have lost ELO (< 1000)
      const player2Row = page.getByRole("row", { name: new RegExp(player2) });
      await expect(player2Row).not.toContainText(/\s1000\s/);
    });

    test("should show ELO changes in recent matches", async ({ page }) => {
      const player1 = generatePlayerName("EloChangeP1");
      const player2 = generatePlayerName("EloChangeP2");

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
      await scoreInputs.nth(1).fill("5");

      await page.getByRole("button", { name: "Registrera Match" }).click();
      await page.waitForURL("/");

      // Check recent matches section shows ELO changes
      const recentMatches = page.locator("text=Senaste Matcher").locator("..");
      await expect(recentMatches.getByText(/\+\d+ ELO/)).toBeVisible();
      await expect(recentMatches.getByText(/-\d+ ELO/)).toBeVisible();
    });
  });
});
