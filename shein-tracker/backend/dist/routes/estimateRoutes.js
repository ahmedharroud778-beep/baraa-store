"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const estimateController_1 = require("../controllers/estimateController");
const router = (0, express_1.Router)();
router.post('/price', estimateController_1.estimateController.calculatePrice);
exports.default = router;
//# sourceMappingURL=estimateRoutes.js.map