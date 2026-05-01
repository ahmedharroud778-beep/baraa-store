-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "cartUrl" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "city" TEXT,
    "status" TEXT NOT NULL DEFAULT 'not_confirmed',
    "originalPrice" DOUBLE PRECISION,
    "convertedPrice" DOUBLE PRECISION,
    "weightFee" DOUBLE PRECISION,
    "deliveryFee" DOUBLE PRECISION,
    "totalEstimated" DOUBLE PRECISION,
    "cartSnapshot" JSONB,
    "contactMethod" TEXT,
    "contactInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "libyanRate" DOUBLE PRECISION NOT NULL,
    "perKgFee" DOUBLE PRECISION NOT NULL,
    "sheinEmail" TEXT,
    "sheinPassword" TEXT,
    "itemWeights" JSONB NOT NULL,
    "cityFees" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
