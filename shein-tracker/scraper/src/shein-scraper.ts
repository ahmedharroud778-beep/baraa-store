import { chromium, Browser, Page, BrowserContext } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
}

export interface CartData {
  items: CartItem[];
  totalPrice: number;
  currency: string;
}

export class SheinScraper {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  async initialize(): Promise<void> {
    chromium.use(stealth());

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });

    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York'
    });
  }

  async scrapeCart(cartUrl: string): Promise<CartData> {
    if (!this.browser || !this.context) {
      await this.initialize();
    }

    const page = await this.context!.newPage();

    try {
      // Navigate to cart URL
      await page.goto(cartUrl, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for cart items to load
      await page.waitForSelector('.cart-item, .product-item, [data-testid="cart-item"]', {
        timeout: 10000
      }).catch(() => {
        // If selector not found, try alternative selectors
      });

      // Extract cart data
      const cartData = await this.extractCartData(page);

      return cartData;
    } finally {
      await page.close();
    }
  }

  private async extractCartData(page: Page): Promise<CartData> {
    // Try multiple selectors for cart items
    const itemSelectors = [
      '.cart-item',
      '.product-item',
      '[data-testid="cart-item"]',
      '.j-cart-item',
      '.cart-list-item'
    ];

    let items: CartItem[] = [];

    for (const selector of itemSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          items = await Promise.all(
            elements.map(async (element) => {
              const name = await element.$eval('.product-name, .item-name, .goods-name', (el) =>
                el.textContent?.trim() || ''
              ).catch(() => 'Unknown Item');

              const priceText = await element.$eval('.price, .item-price, .goods-price', (el) =>
                el.textContent?.trim() || '0'
              ).catch(() => '0');

              const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

              const quantityText = await element.$eval('.quantity, .item-quantity', (el) =>
                el.textContent?.trim() || '1'
              ).catch(() => '1');

              const quantity = parseInt(quantityText) || 1;

              const category = this.guessCategory(name);

              return { name, price, quantity, category };
            })
          );
          break;
        }
      } catch (error) {
        // Try next selector
      }
    }

    // If no items found, return empty cart
    if (items.length === 0) {
      return {
        items: [],
        totalPrice: 0,
        currency: 'USD'
      };
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      items,
      totalPrice,
      currency: 'USD'
    };
  }

  private guessCategory(itemName: string): string {
    const name = itemName.toLowerCase();

    if (name.includes('pants') || name.includes('jeans') || name.includes('trousers')) {
      return 'pants';
    }
    if (name.includes('shirt') || name.includes('t-shirt') || name.includes('top')) {
      return 'shirt';
    }
    if (name.includes('dress')) {
      return 'dress';
    }
    if (name.includes('shoes') || name.includes('sneakers') || name.includes('boots')) {
      return 'shoes';
    }
    if (name.includes('jacket') || name.includes('coat') || name.includes('blazer')) {
      return 'jacket';
    }
    if (name.includes('bag') || name.includes('purse') || name.includes('wallet')) {
      return 'accessories';
    }

    return 'other';
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default SheinScraper;
