"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculationService = void 0;
const client_1 = require("@prisma/client");
const playwrightCartScraper_1 = require("./playwrightCartScraper");
const prisma = new client_1.PrismaClient();
async function extractCartData(cartUrl) {
    let parsedUrl;
    try {
        parsedUrl = new URL(cartUrl);
    }
    catch {
        throw new Error('Invalid cart URL');
    }
    // Helpful fallback for manual links like ?total=123.45
    const queryPrice = parsedUrl.searchParams.get('total') ||
        parsedUrl.searchParams.get('amount') ||
        parsedUrl.searchParams.get('price');
    if (queryPrice) {
        const parsed = Number(queryPrice);
        if (Number.isFinite(parsed) && parsed > 0) {
            return { totalPrice: parsed, currency: 'USD' };
        }
    }
    try {
        return await (0, playwrightCartScraper_1.scrapeCartTotalWithPlaywright)(cartUrl);
    }
    catch (playwrightError) {
        const response = await fetch(cartUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch cart page (${response.status})`);
        }
        const html = await response.text();
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
            const price = Number(match[1]);
            if (Number.isFinite(price) && price > 0) {
                return { totalPrice: price, currency: 'USD' };
            }
        }
        const reason = playwrightError instanceof Error ? playwrightError.message : 'unknown Playwright error';
        throw new Error(`Unable to extract cart total from URL (${reason})`);
    }
}
exports.calculationService = {
    async calculateEstimate(cartUrl, mode, city, providedCartTotal, providedTotalWeight) {
        // Get settings
        let settings = await prisma.settings.findFirst();
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    libyanRate: 4.9,
                    perKgFee: 15,
                    itemWeights: {
                        pants: 0.7,
                        shirt: 0.3,
                        dress: 0.5,
                        shoes: 1.0,
                        jacket: 1.2,
                        accessories: 0.2
                    },
                    cityFees: {
                        tripoli: 15,
                        benghazi: 20,
                        misrata: 18,
                        sebha: 25
                    }
                }
            });
        }
        const cartData = providedCartTotal
            ? { totalPrice: providedCartTotal, currency: 'USD' }
            : await extractCartData(cartUrl);
        const cityFees = settings.cityFees;
        const deliveryFee = city ? cityFees[city] || 0 : 0;
        const convertedPrice = cartData.totalPrice * settings.libyanRate;
        const weightFee = mode === 'weight' && providedTotalWeight ? providedTotalWeight * settings.perKgFee : 0;
        const estimatedTotal = convertedPrice + deliveryFee + weightFee;
        return {
            orderId: 'temp-order-id',
            scrapeJobId: 'direct',
            mode,
            city,
            estimatedTotal,
            breakdown: {
                originalPrice: cartData.totalPrice,
                convertedPrice,
                weightFee,
                deliveryFee
            },
            status: 'calculated'
        };
    },
    calculatePriceMode(originalPrice, libyanRate, city, cityFees) {
        const convertedPrice = originalPrice * libyanRate;
        const deliveryFee = cityFees[city] || 0;
        const total = convertedPrice + deliveryFee;
        return {
            originalPrice,
            convertedPrice,
            deliveryFee,
            total
        };
    },
    calculateWeightMode(items, itemWeights, perKgFee, libyanRate, city, cityFees) {
        let totalWeight = 0;
        let originalPrice = 0;
        items.forEach((item) => {
            const weight = itemWeights[item.category] || 0.5;
            totalWeight += weight * item.quantity;
            originalPrice += item.price * item.quantity;
        });
        const weightFee = totalWeight * perKgFee;
        const convertedPrice = originalPrice * libyanRate;
        const deliveryFee = cityFees[city] || 0;
        const total = convertedPrice + weightFee + deliveryFee;
        return {
            originalPrice,
            convertedPrice,
            weightFee,
            deliveryFee,
            total,
            totalWeight
        };
    }
};
//# sourceMappingURL=calculationService.js.map