import { injectSpeedInsights } from '@vercel/speed-insights';
import { buildPath, type Language, type Page } from './i18n-routing';

let speedInsights: ReturnType<typeof injectSpeedInsights> | null = null;

/**
 * Initialize Speed Insights and return the setRoute function
 * Should be called once at app startup
 */
export function initSpeedInsights() {
  if (!speedInsights) {
    speedInsights = injectSpeedInsights();
  }
  return speedInsights;
}

/**
 * Update the current route in Speed Insights
 * @param language - The current language
 * @param page - The current page
 * @param subPath - Optional sub-path (e.g., resume section)
 */
export function updateSpeedInsightsRoute(language: Language, page: Page, subPath?: string) {
  if (speedInsights?.setRoute) {
    const route = buildPath(language, page, subPath);
    speedInsights.setRoute(route);
  }
}
