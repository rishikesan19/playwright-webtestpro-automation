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

/** Product pictures are rendered by the origin on every request, e.g. `/get_product_picture/12`. */
export const PRODUCT_PICTURE_URL = '**/get_product_picture/**';

// 1x1 transparent PNG, so <img> elements still render with a valid image.
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

/**
 * Under load the origin takes 15-45s per product picture. Those requests occupy the browser's
 * connections to the host, so the site's own AJAX calls (e.g. `/add_to_cart/<id>`) queue behind
 * them and time out. No test asserts on product images, so they are answered locally with a
 * placeholder; this also removes most of the load the suite puts on the shared public site.
 */
export async function stubProductImages(context: BrowserContext): Promise<void> {
  await context.route(PRODUCT_PICTURE_URL, (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_PNG }),
  );
}
