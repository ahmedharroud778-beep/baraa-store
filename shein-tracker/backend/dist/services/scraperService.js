"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scraperService = void 0;
const bull_1 = __importDefault(require("bull"));
const scraperQueue = new bull_1.default('scraper-jobs', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379
    }
});
exports.scraperService = {
    async queueScrapeJob(cartUrl, orderId) {
        const job = await scraperQueue.add('scrape-cart', {
            cartUrl,
            orderId
        });
        return {
            jobId: job.id,
            status: 'queued'
        };
    },
    async getJobStatus(jobId) {
        const job = await scraperQueue.getJob(jobId);
        if (!job) {
            return { status: 'not_found' };
        }
        const state = await job.getState();
        const result = job.returnvalue;
        return {
            status: state,
            result
        };
    }
};
//# sourceMappingURL=scraperService.js.map