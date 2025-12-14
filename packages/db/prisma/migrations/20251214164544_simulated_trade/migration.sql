-- CreateTable
CREATE TABLE "simulated_trades" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "buyExchange" TEXT NOT NULL,
    "sellExchange" TEXT NOT NULL,
    "buyPrice" DOUBLE PRECISION NOT NULL,
    "sellPrice" DOUBLE PRECISION NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "estimatedProfit" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulated_trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "simulated_trades_opportunityId_key" ON "simulated_trades"("opportunityId");

-- CreateIndex
CREATE INDEX "simulated_trades_symbol_idx" ON "simulated_trades"("symbol");

-- AddForeignKey
ALTER TABLE "simulated_trades" ADD CONSTRAINT "simulated_trades_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "arbitrage_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
