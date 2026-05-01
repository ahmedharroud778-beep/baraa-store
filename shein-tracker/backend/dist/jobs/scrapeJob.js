"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const scraperQueue = new bull_1.default('scraper-jobs', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379
    }
});
scraperQueue.process('scrape-cart', async (job) => {
    const { cartUrl, orderId } = job.data;
    try {
        // TODO: Implement actual scraping logic
        // This would call the scraper service to extract cart data
        // For now, return mock data
        const mockCartData = {
            items: [
                { name: 'Sample Item', price: 10, quantity: 1, category: 'shirt' }
            ],
            totalPrice: 10
        };
        // Update order with cart snapshot
        if (orderId !== 'temp-order-id') {
            await prisma.order.update({
                where: { orderId },
                data: {
                    cartSnapshot: mockCartData
                }
            });
        }
        return mockCartData;
    }
    catch (error) {
        console.error('Scraping job failed:', error);
        throw error;
    }
});
exports.default = scraperQueue;
//# sourceMappingURL=scrapeJob.js.map