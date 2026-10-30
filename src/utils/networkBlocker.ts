import type { BrowserContext } from '@playwright/test';

/**
 * Third-party ad / consent-management hosts loaded by automationexercise.com.
 * The Google "Funding Choices" consent overlay and ad vignettes sit above the page and intercept
 * clicks, which makes tests fail at random. Aborting these requests removes the overlay without
 * the test ever accepting a consent banner, and none of them are part of the application under test.
 */
export const THIRD_PARTY_AD_HOSTS: RegExp =
  /^https?:\/\/([^/]+\.)?(googlesyndication\.com|fundingchoicesmessages\.google\.com|doubleclick\.net|googletagservices\.com|googletagmanager\.com|google-analytics\.com|adservice\.google\.[a-z.]+|googleadservices\.com)\//;

export async function blockThirdPartyAds(context: BrowserContext): Promise<void> {
  await context.route(THIRD_PARTY_AD_HOSTS, (route) => route.abort('blockedbyclient'));
}
