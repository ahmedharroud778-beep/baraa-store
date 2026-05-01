import Queue from 'bull';
export declare const scraperService: {
    queueScrapeJob(cartUrl: string, orderId: string): Promise<{
        jobId: Queue.JobId;
        status: string;
    }>;
    getJobStatus(jobId: string): Promise<{
        status: string;
        result?: undefined;
    } | {
        status: Queue.JobStatus | "stuck";
        result: any;
    }>;
};
//# sourceMappingURL=scraperService.d.ts.map