import { bnbClient } from "@/lib/bnbClient";
import prisma from "@root/db";
import { Contract, parseEther } from "ethers";
import { env } from "@/constants/env";

// Manually mock an arbitrage route
const MOCK_ROUTE = {
    buyExchange: "binance",
    sellExchange: "kucoin",
    buyPrice: 100,
    sellPrice: 105,
    profit: 5,
    totalFee: 0.1
};

const SYMBOL = "TESTUSDT";
const ARBITRAGE_CONTRACT_ADDRESS = env.BNB_TEST_NET_CONTRACT_ADDRESS;
const ARBITRAGE_ABI = [
    "function recordOpportunity(string symbol, string buyExchange, string sellExchange, uint256 buyPrice, uint256 sellPrice, uint256 profit, uint256 totalFee)"
];

async function runTest() {
    console.log("🚀 Starting Manual Arbitrage Test...");

    if (!ARBITRAGE_CONTRACT_ADDRESS) {
        console.error("❌ BNB_TEST_NET_CONTRACT_ADDRESS is missing!");
        process.exit(1);
    }

    // 1. Create DB Record
    console.log("💾 Creating pending record in DB...");
    const record = await prisma.arbitrageOpportunity.create({
        data: {
            symbol: SYMBOL,
            buyExchange: MOCK_ROUTE.buyExchange,
            sellExchange: MOCK_ROUTE.sellExchange,
            buyPrice: MOCK_ROUTE.buyPrice,
            sellPrice: MOCK_ROUTE.sellPrice,
            profit: MOCK_ROUTE.profit,
            totalFee: MOCK_ROUTE.totalFee,
            status: "PENDING"
        }
    });
    console.log(`✅ Created DB Record: ${record.id}`);

    // 2. Write to Chain
    console.log("🔗 Writing to BNB Testnet...");
    try {
        const signer = bnbClient.getSigner();
        const contract = new Contract(ARBITRAGE_CONTRACT_ADDRESS, ARBITRAGE_ABI, signer);

        const tx = await (contract as any).recordOpportunity(
            SYMBOL,
            MOCK_ROUTE.buyExchange,
            MOCK_ROUTE.sellExchange,
            parseEther(MOCK_ROUTE.buyPrice.toString()),
            parseEther(MOCK_ROUTE.sellPrice.toString()),
            parseEther(MOCK_ROUTE.profit.toString()),
            parseEther(MOCK_ROUTE.totalFee.toString())
        );

        console.log(`✅ Tx Sent: ${tx.hash}`);
        
        // 3. Update DB
        console.log("💾 Updating DB with Tx Hash...");
        await prisma.arbitrageOpportunity.update({
            where: { id: record.id },
            data: {
                status: "ON_CHAIN",
                txHash: tx.hash
            }
        });
        console.log("✅ DB Updated!");

    } catch (error) {
        console.error("❌ Chain interaction failed:", error);
        await prisma.arbitrageOpportunity.update({
            where: { id: record.id },
            data: {
                status: "FAILED",
                error: String(error)
            }
        });
    }

    console.log("🎉 Test Completed.");
    process.exit(0);
}

runTest();
