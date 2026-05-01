"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
router.post('/', orderController_1.orderController.createOrder);
router.get('/:id', orderController_1.orderController.getOrder);
router.get('/order-id/:orderId', orderController_1.orderController.getOrderByOrderId);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map