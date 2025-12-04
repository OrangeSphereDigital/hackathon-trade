import { Contract, parseEther, formatEther } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const ARBITRAGE_ABI = [
    "function recordOpportunity(string symbol, string buyExchange, string sellExchange, uint256 buyPrice, uint256 sellPrice, uint256 profit, uint256 totalFee)",
    "event OpportunityRecorded(string symbol, string buyExchange, string sellExchange, uint256 buyPrice, uint256 sellPrice, uint256 profit, uint256 totalFee)"
];

// Helper to load .env
// IMPORTANT: we prefer apps/server/.env over the root .env, because that's
// where your BNB_* variables live when you run `bun dev`.
function loadEnv() {
    const serverEnvPath = path.resolve(process.cwd(), "apps/server/.env");
    const rootEnvPath = path.resolve(process.cwd(), ".env");

    if (fs.existsSync(serverEnvPath)) {
        console.log(`Loading .env from: ${serverEnvPath}`);
        dotenv.config({ path: serverEnvPath });
        return;
    }

    // Fallback: root .env (may be empty in your setup)
    if (fs.existsSync(rootEnvPath)) {
        console.log(`Loading .env from: ${rootEnvPath}`);
        dotenv.config({ path: rootEnvPath });
        return;
    }

    console.warn("⚠️ Could not find .env file at apps/server/.env or ./.env.");
}

async function main() {
    // 1. Load Environment Variables BEFORE importing modules that depend on them
    loadEnv();

    // 2. Dynamically import modules that rely on process.env
    // This ensures they read the variables we just loaded
    const { bnbClient } = await import("../lib/bnbClient");
    const { env } = await import("../constants/env");

    console.log("Starting BNB Publish Test...");

    const rpcUrl = env.BNB_RPC_URL ?? "https://data-seed-prebsc-1-s3.bnbchain.org:8545";
    const address = env.BNB_TEST_NET_CONTRACT_ADDRESS ?? "0x4675Ab21b56142B0eaEF7719c4D352A005c12B5A"
    const privateKey = env.BNB_PRIVATE_KEY

    // Debug check
    if (!rpcUrl) {
        console.error("Error: BNB_RPC_URL is still missing after loading .env");
        console.error("Current process.env.BNB_RPC_URL:", process.env.BNB_RPC_URL);
    }

    const contractAddress = address;
    if (!contractAddress) {
        console.error("Error: BNB_TEST_NET_CONTRACT_ADDRESS is not set in apps/server/.env");
        console.error("Please set this variable in apps/server/.env");
        process.exit(1);
    }

    if (!privateKey) {
        console.error("Error: BNB_PRIVATE_KEY is not set in .env");
        process.exit(1);
    }

    if (!rpcUrl) {
        console.error("Error: BNB_RPC_URL is not set in .env");
        process.exit(1);
    }

    console.log(`Target Contract: ${contractAddress}`);

    try {
        const signer = bnbClient.getSigner();
        const signerAddress = await signer.getAddress();
        console.log(`Signer Address: ${signerAddress}`);

        const contract = new Contract(contractAddress, ARBITRAGE_ABI, signer);

        // Dummy data for testing
        const symbol = "BTCUSDT";
        const buyExchange = "binance";
        const sellExchange = "kucoin";
        const buyPrice = 50000.00;
        const sellPrice = 50100.00;
        const profit = 100.00;
        const totalFee = 1.50;

        console.log("Publishing test opportunity:", {
            symbol,
            buyExchange,
            sellExchange,
            buyPrice,
            sellPrice,
            profit,
            totalFee
        });

        // Convert to Wei (18 decimals) as expected by the contract
        // Note: If your contract expects different decimals, adjust accordingly.
        const buyPriceWei = parseEther(buyPrice.toFixed(18));
        const sellPriceWei = parseEther(sellPrice.toFixed(18));
        const profitWei = parseEther(profit.toFixed(18));
        const totalFeeWei = parseEther(totalFee.toFixed(18));

        const tx = await (contract as any).recordOpportunity(
            symbol,
            buyExchange,
            sellExchange,
            buyPriceWei,
            sellPriceWei,
            profitWei,
            totalFeeWei
        );

        console.log(`Transaction sent! Hash: ${tx.hash}`);
        console.log("Waiting for confirmation...");

        const receipt = await tx.wait();
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        console.log(`View on Explorer: https://testnet.bscscan.com/tx/${tx.hash}`);

        // --- VERIFICATION SECTION ---
        console.log("\n--- 🔍 Verifying On-Chain Data ---");

        // Filter specifically for our event in the logs
        const eventTopic = contract.interface.getEvent("OpportunityRecorded")?.topicHash;
        const log = receipt.logs.find((x: any) => x.topics[0] === eventTopic);

        if (log) {
            const parsedLog = contract.interface.parseLog({
                topics: [...log.topics],
                data: log.data
            });

            if (parsedLog) {
                console.log("✅ Event 'OpportunityRecorded' found in transaction logs:");
                console.log({
                    symbol: parsedLog.args.symbol,
                    buyExchange: parsedLog.args.buyExchange,
                    sellExchange: parsedLog.args.sellExchange,
                    buyPrice: formatEther(parsedLog.args.buyPrice),
                    sellPrice: formatEther(parsedLog.args.sellPrice),
                    profit: formatEther(parsedLog.args.profit),
                    totalFee: formatEther(parsedLog.args.totalFee)
                });
            }
        } else {
            console.warn("⚠️ Event not found in receipt logs (Contract might not emit it, or ABI mismatch).");
        }

    } catch (error: any) {
        console.error("Error publishing to BNB chain:", error);
        if (error.code === "BAD_DATA") {
            console.error("Suggestion: Check if the contract ABI matches the deployed contract.");
        } else if (error.code === "INSUFFICIENT_FUNDS") {
            console.error("Suggestion: Ensure your wallet has enough TBNB for gas fees.");
        }
    }
}
 
main();
