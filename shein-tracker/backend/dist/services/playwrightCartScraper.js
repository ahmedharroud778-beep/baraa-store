"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeCartTotalWithPlaywright = scrapeCartTotalWithPlaywright;
const playwright_1 = require("playwright");
function extractPriceFromText(value) {
    const normalized = value.replace(/,/g, '').trim();
    const matches = normalized.match(/[0-9]+(?:\.[0-9]+)?/g);
    if (!matches || matches.length === 0) {
        return null;
    }
    const parsed = Number(matches[matches.length - 1]);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}
async function scrapeCartTotalWithPlaywright(cartUrl) {
    const proxyServer = process.env.PLAYWRIGHT_PROXY_SERVER;
    const proxy = proxyServer
        ? {
            server: proxyServer,
            username: process.env.PLAYWRIGHT_PROXY_USERNAME,
            password: process.env.PLAYWRIGHT_PROXY_PASSWORD,
            bypass: process.env.PLAYWRIGHT_PROXY_BYPASS
        }
        : undefined;
    const browser = await playwright_1.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        proxy
    });
    try {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport: { width: 1440, height: 900 },
            locale: 'en-US'
        });
        const page = await context.newPage();
        await page.goto(cartUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Wait a few seconds for redirects and React to render the cart price
        await page.waitForTimeout(5000);
        const currentUrl = page.url();
        if (currentUrl.includes('www.shein.com') && !currentUrl.includes('cart') && !currentUrl.includes('checkout')) {
            await context.close();
            throw new Error('Redirected to homepage. Bot protection active. Please enter cart total manually.');
        }
        const selectors = [
            '[data-testid="grand-total"]',
            '[data-testid="order-total"]',
            '.cart-total-price',
            '.order-total',
            '.grand-total',
            '.checkout-total',
            '[class*="total"] [class*="price"]'
        ];
        for (const selector of selectors) {
            const locator = page.locator(selector).first();
            if ((await locator.count()) === 0) {
                continue;
            }
            const text = (await locator.textContent()) || '';
            const amount = extractPriceFromText(text);
            if (amount) {
                await context.close();
                return { totalPrice: amount, currency: 'USD' };
            }
        }
        const html = await page.content();
        const patterns = [
            /"grandTotal"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i,
            /"orderTotal"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i,
            /"totalPrice"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i,
            /"amount"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)/i
        ];
        for (const pattern of patterns) {
            const match = html.match(pattern);
            if (!match) {
                continue;
            }
            const amount = Number(match[1]);
            if (Number.isFinite(amount) && amount > 0) {
                await context.close();
                return { totalPrice: amount, currency: 'USD' };
            }
        }
        await context.close();
        throw new Error('Unable to extract cart total from rendered page');
    }
    finally {
        await browser.close();
    }
}
//# sourceMappingURL=playwrightCartScraper.js.map