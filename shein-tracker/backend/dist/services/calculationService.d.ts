export declare const calculationService: {
    calculateEstimate(cartUrl: string, mode: "price" | "weight", city?: string, providedCartTotal?: number, providedTotalWeight?: number): Promise<{
        orderId: string;
        scrapeJobId: string;
        mode: "price" | "weight";
        city: string | undefined;
        estimatedTotal: number;
        breakdown: {
            originalPrice: number;
            convertedPrice: number;
            weightFee: number;
            deliveryFee: number;
        };
        status: string;
    }>;
    calculatePriceMode(originalPrice: number, libyanRate: number, city: string, cityFees: any): {
        originalPrice: number;
        convertedPrice: number;
        deliveryFee: any;
        total: any;
    };
    calculateWeightMode(items: any[], itemWeights: any, perKgFee: number, libyanRate: number, city: string, cityFees: any): {
        originalPrice: number;
        convertedPrice: number;
        weightFee: number;
        deliveryFee: any;
        total: any;
        totalWeight: number;
    };
};
//# sourceMappingURL=calculationService.d.ts.map