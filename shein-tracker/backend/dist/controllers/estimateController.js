"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateController = void 0;
const calculationService_1 = require("../services/calculationService");
exports.estimateController = {
    async calculatePrice(req, res) {
        try {
            const { cartUrl, mode, city, cartTotal, totalWeight } = req.body;
            if (!cartUrl && !cartTotal) {
                return res.status(400).json({ error: 'cartUrl or cartTotal is required' });
            }
            if (mode !== 'price' && mode !== 'weight') {
                return res.status(400).json({ error: 'mode must be either "price" or "weight"' });
            }
            // Queue scraping job or use manual total
            const estimate = await calculationService_1.calculationService.calculateEstimate(cartUrl || '', mode, city, cartTotal, totalWeight);
            res.json({
                success: true,
                data: estimate
            });
        }
        catch (error) {
            console.error('Error calculating estimate:', error);
            const message = error instanceof Error ? error.message : 'Failed to calculate estimate';
            res.status(500).json({ error: message });
        }
    }
};
//# sourceMappingURL=estimateController.js.map