"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const estimateRoutes_1 = __importDefault(require("./estimateRoutes"));
const orderRoutes_1 = __importDefault(require("./orderRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const router = (0, express_1.Router)();
router.use('/estimate', estimateRoutes_1.default);
router.use('/orders', orderRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map