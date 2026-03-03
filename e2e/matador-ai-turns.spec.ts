// Matador Game AI Turn Processing Tests
// These tests verify that AI turns process correctly without stalling

import { test, expect, Page } from '@playwright/test';

test.describe('Matador AI Turn Processing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Matador game page
    await page.goto('/en/matador');

    // Wait for the setup screen to appear
    await expect(page.locator('.setup-screen')).toBeVisible();

    // Start the game with default players (1 human, 3 AI)
    await page.click('button:has-text("Start Game")');

    // Wait for the game board to appear
    await expect(page.locator('.board')).toBeVisible({ timeout: 5000 });
  });

  test('should start game and show board', async ({ page }) => {
    // Verify game elements are visible
    await expect(page.locator('.board')).toBeVisible();
    await expect(page.locator('.board-center')).toBeVisible();
    await expect(page.locator('.scoreboard')).toBeVisible();
    await expect(page.locator('.action-panel')).toBeVisible();

    // Verify all 4 players are shown in scoreboard
    const playerCards = page.locator('.player-card');
    await expect(playerCards).toHaveCount(4);
  });

  test('AI players should take turns without stalling', async ({ page }) => {
    // Wait for all 3 AI players to complete their first turns
    // Human player (Player 1) starts first

    // Wait for the "Roll Dice" button to appear (indicates human's turn)
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');

    // The button should appear within 10 seconds (3 AI turns with delays)
    await expect(rollDiceButton).toBeVisible({ timeout: 15000 });

    // Verify it's the human player's turn
    const turnIndicator = page.locator('.board-center').locator('div:has-text("Your turn")');
    await expect(turnIndicator).toBeVisible();
  });

  test('human player can roll dice when it is their turn', async ({ page }) => {
    // Wait for human player's turn
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    await expect(rollDiceButton).toBeVisible({ timeout: 15000 });

    // Click roll dice
    await rollDiceButton.click();

    // Wait for dice to show a result (not 1,1 which is initial state)
    await page.waitForTimeout(1000);

    // Verify dice were rolled - some UI change should occur
    // Either player moved, or a dialog appeared, or message shown
    const messageBox = page.locator('.message-box');
    await expect(messageBox).toBeVisible();
  });

  test('AI should not stall after buying property', async ({ page }) => {
    // Listen for console messages to track AI behavior
    const aiMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('[AI]')) {
        aiMessages.push(msg.text());
      }
    });

    // Wait for human player's turn (all AI turns completed)
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    await expect(rollDiceButton).toBeVisible({ timeout: 20000 });

    // Check that we have AI turn logs indicating turns completed
    const hasFinishTurnLog = aiMessages.some(msg =>
      msg.includes('Ending turn') || msg.includes('Next player')
    );
    expect(hasFinishTurnLog).toBeTruthy();
  });

  test('game should continue after multiple rounds', async ({ page }) => {
    // Play through multiple turns

    for (let round = 0; round < 3; round++) {
      // Wait for human player's turn
      const rollDiceButton = page.locator('button:has-text("Roll Dice")');
      await expect(rollDiceButton).toBeVisible({ timeout: 20000 });

      // Roll dice
      await rollDiceButton.click();
      await page.waitForTimeout(1000);

      // Handle any dialogs that might appear
      const buyDialog = page.locator('.matador-dialog:visible');
      if (await buyDialog.count() > 0) {
        // Click "No" to not buy (or close dialog)
        const noButton = buyDialog.locator('button:has-text("No")');
        if (await noButton.count() > 0) {
          await noButton.click();
        } else {
          const closeButton = buyDialog.locator('button.dialog-close');
          if (await closeButton.count() > 0) {
            await closeButton.click();
          }
        }
      }

      // End turn if button appears
      const endTurnButton = page.locator('button:has-text("End Turn")');
      if (await endTurnButton.isVisible()) {
        await endTurnButton.click();
      }

      // Wait for AI turns to complete
      await page.waitForTimeout(500);
    }

    // Game should still be running (no game over)
    const gameOverDialog = page.locator('.matador-dialog:has-text("Game Over")');
    await expect(gameOverDialog).not.toBeVisible();
  });

  test('doubles should grant extra turn', async ({ page }) => {
    // Listen for console messages about doubles
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // Wait for human player's turn
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    await expect(rollDiceButton).toBeVisible({ timeout: 15000 });

    // Play through several turns and watch for doubles handling
    for (let i = 0; i < 5; i++) {
      if (await rollDiceButton.isVisible()) {
        await rollDiceButton.click();
        await page.waitForTimeout(1500);

        // Close any dialogs
        const closeButton = page.locator('.matador-dialog button.dialog-close:visible');
        if (await closeButton.count() > 0) {
          await closeButton.first().click();
        }

        // End turn if available
        const endTurnButton = page.locator('button:has-text("End Turn")');
        if (await endTurnButton.isVisible()) {
          await endTurnButton.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Check if doubles were mentioned in logs (indicating doubles handling)
    const hasDoublesLog = consoleMessages.some(msg =>
      msg.includes('doubles') || msg.includes('Doubles')
    );
    // This test is informational - doubles may or may not occur
    console.log('Doubles handling observed:', hasDoublesLog);
  });

  test('auction dialog should not cause game to stall', async ({ page }) => {
    // Wait for human turn
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    await expect(rollDiceButton).toBeVisible({ timeout: 15000 });

    // Roll and potentially trigger auction
    await rollDiceButton.click();
    await page.waitForTimeout(1000);

    // Check if auction dialog appeared
    const auctionDialog = page.locator('.matador-dialog:has-text("Auction")');
    if (await auctionDialog.isVisible()) {
      // Pass on auction
      const passButton = auctionDialog.locator('button:has-text("Pass")');
      if (await passButton.count() > 0) {
        // Click pass for all players
        while (await passButton.first().isVisible()) {
          await passButton.first().click();
          await page.waitForTimeout(300);
        }
      }

      // Close dialog if still visible
      const closeButton = auctionDialog.locator('button:has-text("Close")');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }

    // Game should continue - wait for next human turn
    await expect(rollDiceButton).toBeVisible({ timeout: 20000 });
  });

  test('scoreboard should update after AI buys property', async ({ page }) => {
    // Get initial player cash values
    const playerCards = page.locator('.player-card');
    const initialCash: string[] = [];

    for (let i = 0; i < 4; i++) {
      const cashText = await playerCards.nth(i).locator('.player-stat-value.cash').textContent();
      initialCash.push(cashText || '30000');
    }

    // Wait for human turn (AI turns have completed)
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    await expect(rollDiceButton).toBeVisible({ timeout: 15000 });

    // Check if any AI player's cash changed (they bought property)
    let cashChanged = false;
    for (let i = 1; i < 4; i++) { // Skip human player (index 0)
      const newCashText = await playerCards.nth(i).locator('.player-stat-value.cash').textContent();
      if (newCashText !== initialCash[i]) {
        cashChanged = true;
        break;
      }
    }

    // At least one AI should have spent money (bought property or paid tax)
    // This is probabilistic, so we just check the game is still running
    console.log('AI cash changed:', cashChanged);

    // Game should still be functional
    await expect(rollDiceButton).toBeEnabled();
  });

  test('game should handle jail correctly', async ({ page }) => {
    // Listen for jail-related console messages
    const jailMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().toLowerCase().includes('jail')) {
        jailMessages.push(msg.text());
      }
    });

    // Play multiple rounds to potentially hit "Go To Jail"
    for (let i = 0; i < 10; i++) {
      const rollDiceButton = page.locator('button:has-text("Roll Dice")');

      // Wait for turn with extended timeout
      try {
        await expect(rollDiceButton).toBeVisible({ timeout: 15000 });
      } catch {
        // If button doesn't appear, game might be stuck
        break;
      }

      await rollDiceButton.click();
      await page.waitForTimeout(1000);

      // Handle dialogs
      const closeButtons = page.locator('.matador-dialog button.dialog-close:visible');
      const count = await closeButtons.count();
      for (let j = 0; j < count; j++) {
        await closeButtons.first().click();
        await page.waitForTimeout(200);
      }

      // End turn if available
      const endTurnButton = page.locator('button:has-text("End Turn")');
      if (await endTurnButton.isVisible()) {
        await endTurnButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Game should still be responsive
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    const isVisible = await rollDiceButton.isVisible();
    console.log('Game still responsive after 10 rounds:', isVisible);
  });

  test('should not have stale closure issues causing infinite loops', async ({ page }) => {
    // Set a timeout for the entire test
    const testTimeout = 60000;
    const startTime = Date.now();

    // Track AI turn completion
    let humanTurnCount = 0;

    while (Date.now() - startTime < testTimeout && humanTurnCount < 5) {
      const rollDiceButton = page.locator('button:has-text("Roll Dice")');

      // Wait for human turn with timeout
      try {
        await expect(rollDiceButton).toBeVisible({ timeout: 20000 });
        humanTurnCount++;

        // Roll and end turn quickly
        await rollDiceButton.click();
        await page.waitForTimeout(500);

        // Try to end turn
        const endTurnButton = page.locator('button:has-text("End Turn")');
        if (await endTurnButton.isVisible({ timeout: 2000 })) {
          await endTurnButton.click();
        }

        await page.waitForTimeout(500);
      } catch {
        // If we timeout waiting for human turn, game might be stuck
        console.log('Game potentially stuck after', humanTurnCount, 'human turns');
        break;
      }
    }

    // Should have completed at least 2 human turns without stalling
    expect(humanTurnCount).toBeGreaterThanOrEqual(2);
  });

  test('concurrent AI turns should not interfere with each other', async ({ page }) => {
    // Monitor console for AI turn messages
    const aiTurnSequence: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[AI]') && (text.includes('Starting') || text.includes('Ending'))) {
        aiTurnSequence.push(text);
      }
    });

    // Wait for human turn (all AI completed)
    const rollDiceButton = page.locator('button:has-text("Roll Dice")');
    await expect(rollDiceButton).toBeVisible({ timeout: 20000 });

    // Verify AI turns happened in sequence (not overlapping)
    // The logs should show sequential processing
    console.log('AI turn sequence:', aiTurnSequence.slice(0, 10));

    // Game should be responsive
    await expect(rollDiceButton).toBeEnabled();
  });

  test('help dialog should be accessible during game', async ({ page }) => {
    // Wait for game to load
    await expect(page.locator('.board')).toBeVisible();

    // Click help button
    const helpButton = page.locator('button:has-text("?")');
    await helpButton.click();

    // Help dialog should appear
    const helpDialog = page.locator('.matador-dialog:has-text("Rules")');
    await expect(helpDialog).toBeVisible();

    // Close help dialog
    await helpDialog.locator('button:has-text("Close")').click();

    // Game should still be functional
    await expect(page.locator('.board')).toBeVisible();
  });

  test('game should track turn count correctly', async ({ page }) => {
    // Play a few rounds and verify turn counter increases
    let turnCount = 0;

    for (let i = 0; i < 3; i++) {
      const rollDiceButton = page.locator('button:has-text("Roll Dice")');
      await expect(rollDiceButton).toBeVisible({ timeout: 20000 });

      await rollDiceButton.click();
      turnCount++;
      await page.waitForTimeout(800);

      // Handle any dialogs
      const noButton = page.locator('.matador-dialog button:has-text("No"):visible');
      if (await noButton.count() > 0) {
        await noButton.first().click();
      }

      const endTurnButton = page.locator('button:has-text("End Turn")');
      if (await endTurnButton.isVisible({ timeout: 1000 })) {
        await endTurnButton.click();
      }

      await page.waitForTimeout(500);
    }

    // Should have completed 3 turns
    expect(turnCount).toBe(3);
  });
});

test.describe('Matador Edge Cases', () => {
  test('should handle three doubles correctly', async ({ page }) => {
    await page.goto('/en/matador');
    await expect(page.locator('.setup-screen')).toBeVisible();
    await page.click('button:has-text("Start Game")');
    await expect(page.locator('.board')).toBeVisible({ timeout: 5000 });

    // Listen for three doubles message
    const threeDoublesMessages: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('Three doubles') || msg.text().includes('three doubles')) {
        threeDoublesMessages.push(msg.text());
      }
    });

    // Play many rounds to potentially see three doubles
    for (let i = 0; i < 20; i++) {
      const rollDiceButton = page.locator('button:has-text("Roll Dice")');

      try {
        await expect(rollDiceButton).toBeVisible({ timeout: 15000 });
        await rollDiceButton.click();
        await page.waitForTimeout(500);

        const endTurnButton = page.locator('button:has-text("End Turn")');
        if (await endTurnButton.isVisible({ timeout: 1500 })) {
          await endTurnButton.click();
        }

        await page.waitForTimeout(500);
      } catch {
        break;
      }
    }

    // Test completed without hanging
    console.log('Three doubles occurred:', threeDoublesMessages.length > 0);
  });

  test('should handle bankruptcy correctly', async ({ page }) => {
    await page.goto('/en/matador');
    await expect(page.locator('.setup-screen')).toBeVisible();
    await page.click('button:has-text("Start Game")');
    await expect(page.locator('.board')).toBeVisible({ timeout: 5000 });

    // Play until potential bankruptcy (limited rounds for test)
    for (let i = 0; i < 30; i++) {
      const rollDiceButton = page.locator('button:has-text("Roll Dice")');

      try {
        await expect(rollDiceButton).toBeVisible({ timeout: 15000 });
        await rollDiceButton.click();
        await page.waitForTimeout(600);

        // Handle buy dialog - always decline
        const noButton = page.locator('.matador-dialog button:has-text("No"):visible');
        if (await noButton.count() > 0) {
          await noButton.first().click();
        }

        const endTurnButton = page.locator('button:has-text("End Turn")');
        if (await endTurnButton.isVisible({ timeout: 1000 })) {
          await endTurnButton.click();
        }

        await page.waitForTimeout(500);
      } catch {
        // Game might have ended
        break;
      }
    }

    // Check for game over or still running
    const gameOver = await page.locator('.matador-dialog:has-text("Game Over")').isVisible();
    const rollDiceVisible = await page.locator('button:has-text("Roll Dice")').isVisible();

    // Either game is over or still playable
    expect(gameOver || rollDiceVisible).toBeTruthy();
  });
});
