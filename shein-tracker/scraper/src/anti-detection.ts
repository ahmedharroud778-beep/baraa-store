import { BrowserContext } from 'playwright';

export async function setupAntiDetection(context: BrowserContext): Promise<void> {
  // Set realistic browser fingerprints
  await context.addInitScript(() => {
    // Hide webdriver property
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    });

    // Mock Chrome object
    (window as any).chrome = {
      runtime: {}
    };

    // Mock permissions
    const originalQuery = window.navigator.permissions.query;
    window.navigator.permissions.query = (parameters) =>
      originalQuery(parameters).then((permission) => {
        permission.state = 'granted';
        return permission;
      });

    // Mock plugins
    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5]
    });

    // Mock languages
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en']
    });
  });

  // Set extra HTTP headers
  await context.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  });
}

export function getRandomDelay(min: number = 1000, max: number = 3000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function humanLikeTyping(
  page: any,
  selector: string,
  text: string,
  delay: number = 100
): Promise<void> {
  await page.focus(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay });
  }
}
