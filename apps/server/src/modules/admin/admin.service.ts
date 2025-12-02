import { bnbClient } from "@/lib/bnbClient";

export class AdminService {
    async getBnbData(page = 1, limit = 10) {
        const provider = bnbClient.getProvider();
        const blockNumber = await provider.getBlockNumber();
        
        // Placeholder: Log page to avoid unused variable warning
        console.log(`Fetching BNB data page ${page}`);
        // This is a placeholder logic. Replace with actual contract calls or data fetching.
        const blocks = [];
        for (let i = 0; i < Math.min(limit, 5); i++) {
            const block = await provider.getBlock(blockNumber - i);
            if (block) {
                blocks.push({
                    number: block.number,
                    hash: block.hash,
                    timestamp: block.timestamp,
                    transactions: block.transactions.length
                });
            }
        }

        return {
            currentBlock: blockNumber,
            data: blocks
        };
    }

    async getBnbDataById(id: string) {
        const provider = bnbClient.getProvider();
        
        // Example: Fetch transaction by Hash (ID)
        try {
            const tx = await provider.getTransaction(id);
            if (!tx) return null;

            return {
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value.toString(),
                blockNumber: tx.blockNumber
            };
        } catch (error) {
            // If ID is not a tx hash, maybe it's a block hash or number?
            // Keeping it simple for now.
            throw new Error("Invalid ID or Transaction not found");
        }
    }
}

export const adminService = new AdminService();
