-- CreateTable
CREATE TABLE "arbitrage_opportunities" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "buyExchange" TEXT NOT NULL,
    "sellExchange" TEXT NOT NULL,
    "buyPrice" DOUBLE PRECISION NOT NULL,
    "sellPrice" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "totalFee" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "txHash" TEXT,
    "blockNumber" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arbitrage_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "arbitrage_opportunities_status_idx" ON "arbitrage_opportunities"("status");
