import { Page, Locator } from '@playwright/test';

/**
 * Get a locator for a single element by data-testid
 */
export const byTestId = (page: Page, testId: string): Locator => {
  return page.locator(`[data-testid="${testId}"]`);
};

/**
 * Get a locator for multiple elements with a data-testid prefix
 * Useful for elements like cells that share a prefix (e.g., "minesweeper-cell-")
 */
export const byTestIds = (page: Page, testIdPrefix: string): Locator => {
  return page.locator(`[data-testid^="${testIdPrefix}"]`);
};

/**
 * Get a locator for an element by data-testid containing a substring
 */
export const byTestIdContains = (page: Page, substring: string): Locator => {
  return page.locator(`[data-testid*="${substring}"]`);
};

/**
 * Wait for an element by testid to be visible
 */
export const waitForTestId = async (page: Page, testId: string, timeout = 10000): Promise<Locator> => {
  const locator = byTestId(page, testId);
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
};

/**
 * Click an element by testid
 */
export const clickByTestId = async (page: Page, testId: string): Promise<void> => {
  await byTestId(page, testId).click();
};

/**
 * Fill an input by testid
 */
export const fillByTestId = async (page: Page, testId: string, value: string): Promise<void> => {
  await byTestId(page, testId).fill(value);
};

/**
 * Get text content by testid
 */
export const getTextByTestId = async (page: Page, testId: string): Promise<string> => {
  return await byTestId(page, testId).textContent() ?? '';
};
