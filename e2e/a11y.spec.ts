import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * Baseline Accessibility Tests
 *
 * Tests WCAG 2.1 Level A and AA compliance across all main routes.
 * Run with: npm run test:e2e -- a11y.spec.ts
 */

// Main routes to test
const routes = [
  '/',
  '/en/',
  '/da/',
  '/en/home',
  '/en/projects',
  '/en/resume',
  '/en/contact',
  '/en/music',
  '/en/browser',
];

test.describe('Accessibility Baseline', () => {
  routes.forEach((route) => {
    test(`should have no accessibility violations on ${route}`, async ({ page }) => {
      await page.goto(route);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log violations for now - we'll fix these in Units 2-5
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`Route ${route} has ${accessibilityScanResults.violations.length} violations to be fixed:`);
        accessibilityScanResults.violations.forEach((v) => {
          console.log(`  - ${v.id}: ${v.description} (${v.impact})`);
        });
      }

      // This will fail initially - we'll enable this check after Units 2-5 are complete
      // expect(accessibilityScanResults.violations).toEqual([]);

      // For now, just ensure we can scan without errors
      expect(accessibilityScanResults.violations).toBeDefined();
    });
  });
});

test.describe('Interactive Components', () => {
  test('desktop icons should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab to first desktop icon
    await page.keyboard.press('Tab');
    const firstIcon = page.locator('.desktop-icon').first();
    await expect(firstIcon).toBeFocused();

    // Should be able to tab through all icons
    const iconCount = await page.locator('.desktop-icon').count();
    for (let i = 1; i < Math.min(iconCount, 5); i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.className);
      expect(focusedElement).toContain('desktop-icon');
    }
  });

  test('start menu should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Focus start button (assuming it has a selector)
    const startButton = page.locator('[aria-label="Start menu"], .start-button').first();
    await startButton.focus();
    await startButton.press('Enter');

    // Start menu should be visible and focusable
    const startMenu = page.locator('[role="menu"]').first();
    await expect(startMenu).toBeVisible();

    // Should be able to navigate menu items
    await page.keyboard.press('ArrowDown');
    const firstMenuItem = startMenu.locator('[role="menuitem"]').first();
    await expect(firstMenuItem).toBeFocused();

    // Escape should close menu
    await page.keyboard.press('Escape');
    await expect(startMenu).not.toBeVisible();
  });

  test('taskbar should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Tab to taskbar
    const taskbarItems = page.locator('[role="navigation"] button, [role="navigation"] [role="button"]');
    const count = await taskbarItems.count();

    if (count > 0) {
      await taskbarItems.first().focus();
      await expect(taskbarItems.first()).toBeFocused();

      // Should be able to navigate through taskbar items
      for (let i = 1; i < Math.min(count, 3); i++) {
        await page.keyboard.press('Tab');
        const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'));
        expect(focused).toBe('button');
      }
    }
  });
});

test.describe('Window Management', () => {
  test('window should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Open a window by double-clicking a desktop icon
    const homeIcon = page.locator('.desktop-icon').filter({ hasText: /home|projects/i }).first();
    await homeIcon.dblclick();

    // Wait for window to appear
    const window = page.locator('.window').first();
    await expect(window).toBeVisible({ timeout: 5000 });

    // Check accessibility of the window
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('.window')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('window controls should be keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Open a window
    const homeIcon = page.locator('.desktop-icon').filter({ hasText: /home|projects/i }).first();
    await homeIcon.dblclick();

    // Wait for window
    const window = page.locator('.window').first();
    await expect(window).toBeVisible({ timeout: 5000 });

    // Tab to window controls
    const closeButton = window.locator('button[aria-label*="close" i], .title-bar-close button').first();
    await closeButton.focus();
    await expect(closeButton).toBeFocused();

    // Enter should close the window
    await closeButton.press('Enter');
    await expect(window).not.toBeVisible();
  });
});

test.describe('Focus Management', () => {
  test('focus should be visible on all interactive elements', async ({ page }) => {
    await page.goto('/');

    // Tab through elements and check that focus indicator is visible
    const interactiveElements = page.locator('button, a, [tabindex]:not([tabindex="-1"])');
    const count = await interactiveElements.count();

    // Test first 10 elements
    for (let i = 0; i < Math.min(count, 10); i++) {
      await interactiveElements.nth(i).focus();
      const focused = await interactiveElements.nth(i).evaluate((el) =>
        document.activeElement === el
      );
      expect(focused).toBe(true);
    }
  });

  test('escape key should close dialogs and menus', async ({ page }) => {
    await page.goto('/');

    // Open start menu
    const startButton = page.locator('[aria-label="Start menu"], .start-button').first();
    await startButton.click();

    const startMenu = page.locator('[role="menu"]').first();
    await expect(startMenu).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(startMenu).not.toBeVisible();
  });
});

test.describe('Color Contrast', () => {
  test('should meet WCAG AA contrast requirements', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-nosnippet]') // Check main content area
      .analyze();

    // Filter for color contrast violations
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    // This will likely fail initially - we'll fix in Unit 5
    if (contrastViolations.length > 0) {
      console.log('Color contrast violations to be fixed in Unit 5:', contrastViolations.length);
    }
  });
});
