export type ArbitrageItem = {
    id: string;
    symbol: string;
    buyExchange: string;
    sellExchange: string;
    buyPrice: number;
    sellPrice: number;
    profit: number;
    status: string;
    txHash: string | null;
    createdAt: string;
    error: string | null;
};