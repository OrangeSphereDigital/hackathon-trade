import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { env } from "../constants/env";

export class BnbClient {
    private provider: JsonRpcProvider;
    private signer: Wallet;

    constructor(rpcUrl?: string, privateKey?: string) {
        const url = rpcUrl || env.BNB_RPC_URL;
        const pk = privateKey || env.BNB_PRIVATE_KEY;

        if (!url) throw new Error("BNB_RPC_URL is not set");
        if (!pk) throw new Error("BNB_PRIVATE_KEY is not set");

        this.provider = new JsonRpcProvider(url);
        this.signer = new Wallet(pk, this.provider);
    }

    public getProvider(): JsonRpcProvider {
        return this.provider;
    }

    public getSigner(): Wallet {
        return this.signer;
    }

    public getContract<T = Contract>(address: string, abi: any): T {
        return new Contract(address, abi, this.signer) as unknown as T;
    }
}

// Export a singleton instance for convenience
export const bnbClient = new BnbClient();
