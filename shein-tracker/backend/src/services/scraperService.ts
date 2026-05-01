import Queue from 'bull';

const scraperQueue = new Queue('scraper-jobs', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379
  }
});

export const scraperService = {
  async queueScrapeJob(cartUrl: string, orderId: string) {
    const job = await scraperQueue.add('scrape-cart', {
      cartUrl,
      orderId
    });

    return {
      jobId: job.id,
      status: 'queued'
    };
  },

  async getJobStatus(jobId: string) {
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
