"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
exports.validateUrl = validateUrl;
exports.validateOrderId = validateOrderId;
exports.sanitizeInput = sanitizeInput;
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
function validateOrderId(orderId) {
    // Order ID should be at least 3 characters
    return orderId.length >= 3;
}
function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}
//# sourceMappingURL=validation.js.map