"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
async function ensureDefaultAdmin() {
    const existingAdmin = await prisma.admin.findUnique({
        where: { email: DEFAULT_ADMIN_EMAIL }
    });
    if (existingAdmin) {
        return;
    }
    const hashedPassword = await bcrypt_1.default.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await prisma.admin.create({
        data: {
            email: DEFAULT_ADMIN_EMAIL,
            password: hashedPassword
        }
    });
    console.log(`Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
}
async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('Database connected successfully');
        await ensureDefaultAdmin();
        app_1.default.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
setInterval(() => {
    // Keep event loop alive
}, 1000 * 60 * 60);
// Graceful shutdown
process.on('SIGTERM', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map