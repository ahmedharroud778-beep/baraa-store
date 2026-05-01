"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
exports.adminController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            const admin = await prisma.admin.findUnique({
                where: { email }
            });
            if (!admin) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const isValidPassword = await bcrypt_1.default.compare(password, admin.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ adminId: admin.id, email: admin.email }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '7d' });
            res.json({
                success: true,
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        email: admin.email
                    }
                }
            });
        }
        catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'Failed to login' });
        }
    },
    async getSettings(req, res) {
        try {
            const settings = await prisma.settings.findFirst();
            if (!settings) {
                // Create default settings
                const defaultSettings = await prisma.settings.create({
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
                return res.json({
                    success: true,
                    data: defaultSettings
                });
            }
            res.json({
                success: true,
                data: settings
            });
        }
        catch (error) {
            console.error('Error fetching settings:', error);
            res.status(500).json({ error: 'Failed to fetch settings' });
        }
    },
    async updateSettings(req, res) {
        try {
            const { libyanRate, perKgFee, itemWeights, cityFees } = req.body;
            const settings = await prisma.settings.findFirst();
            if (!settings) {
                const newSettings = await prisma.settings.create({
                    data: {
                        libyanRate: libyanRate || 4.9,
                        perKgFee: perKgFee || 15,
                        itemWeights: itemWeights || {},
                        cityFees: cityFees || {}
                    }
                });
                return res.json({
                    success: true,
                    data: newSettings
                });
            }
            const updatedSettings = await prisma.settings.update({
                where: { id: settings.id },
                data: {
                    libyanRate: libyanRate !== undefined ? libyanRate : settings.libyanRate,
                    perKgFee: perKgFee !== undefined ? perKgFee : settings.perKgFee,
                    itemWeights: itemWeights || settings.itemWeights,
                    cityFees: cityFees || settings.cityFees
                }
            });
            res.json({
                success: true,
                data: updatedSettings
            });
        }
        catch (error) {
            console.error('Error updating settings:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    },
    async getAllOrders(req, res) {
        try {
            const { status, limit = 50, offset = 0 } = req.query;
            const where = {};
            if (status) {
                where.status = status;
            }
            const orders = await prisma.order.findMany({
                where,
                take: Number(limit),
                skip: Number(offset),
                orderBy: { createdAt: 'desc' }
            });
            const total = await prisma.order.count({ where });
            res.json({
                success: true,
                data: {
                    orders,
                    total,
                    limit: Number(limit),
                    offset: Number(offset)
                }
            });
        }
        catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    },
    async updateOrderStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }
            const validStatuses = ['not_confirmed', 'shipping_to_libya', 'in_libya', 'delivered'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            const order = await prisma.order.update({
                where: { id: String(id) },
                data: { status }
            });
            res.json({
                success: true,
                data: order
            });
        }
        catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ error: 'Failed to update order status' });
        }
    }
};
//# sourceMappingURL=adminController.js.map