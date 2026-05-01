"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', adminController_1.adminController.login);
router.get('/settings', adminController_1.adminController.getSettings);
router.put('/settings', auth_1.authMiddleware, adminController_1.adminController.updateSettings);
router.get('/orders', auth_1.authMiddleware, adminController_1.adminController.getAllOrders);
router.put('/orders/:id/status', auth_1.authMiddleware, adminController_1.adminController.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map