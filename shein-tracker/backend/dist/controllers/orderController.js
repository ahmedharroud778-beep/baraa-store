"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.orderController = {
    async createOrder(req, res) {
        try {
            const { orderId, cartUrl, mode, city, contactMethod, contactInfo, originalPrice, convertedPrice, weightFee, deliveryFee, totalEstimated } = req.body;
            if (!orderId || !mode) {
                return res.status(400).json({ error: 'orderId and mode are required' });
            }
            const order = await prisma.order.create({
                data: {
                    orderId,
                    cartUrl: cartUrl || '',
                    mode,
                    city,
                    contactMethod,
                    contactInfo,
                    originalPrice,
                    convertedPrice,
                    weightFee,
                    deliveryFee,
                    totalEstimated,
                    status: 'not_confirmed'
                }
            });
            res.status(201).json({
                success: true,
                data: order
            });
        }
        catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Failed to create order' });
        }
    },
    async getOrder(req, res) {
        try {
            const { id } = req.params;
            const order = await prisma.order.findUnique({
                where: { id: String(id) }
            });
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json({
                success: true,
                data: order
            });
        }
        catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    },
    async getOrderByOrderId(req, res) {
        try {
            const { orderId } = req.params;
            const order = await prisma.order.findUnique({
                where: { orderId: String(orderId) }
            });
            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.json({
                success: true,
                data: order
            });
        }
        catch (error) {
            console.error('Error fetching order:', error);
            res.status(500).json({ error: 'Failed to fetch order' });
        }
    }
};
//# sourceMappingURL=orderController.js.map