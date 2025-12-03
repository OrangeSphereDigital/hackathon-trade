import type { ArbitrageRoute } from "./arbitrage.utils";

export interface LogEntry {
    timestamp: number;
    level: 'info' | 'error' | 'warn';
    message: string;
}

export interface BotStatus {
    isRunning: boolean;
    lastCheckedAt: number;
    activeOpportunities: Record<string, ArbitrageRoute & { foundAt: number }>;
    balance?: {
        bnb: string;
    };
}

type StatusListener = (status: BotStatus) => void;
type LogListener = (log: LogEntry) => void;

class ArbitrageStatusService {
    private _status: BotStatus = {
        isRunning: false,
        lastCheckedAt: 0,
        activeOpportunities: {},
    };

    private logs: LogEntry[] = [];
    private readonly MAX_LOGS = 100;
    
    private statusListeners: Set<StatusListener> = new Set();
    private logListeners: Set<LogListener> = new Set();

    constructor() {}

    get currentStatus() {
        return { ...this._status };
    }

    setStatus(update: Partial<BotStatus>) {
        this._status = { ...this._status, ...update };
        this.notifyStatusListeners();
    }

    addLog(level: 'info' | 'error' | 'warn', message: string) {
        const entry: LogEntry = { timestamp: Date.now(), level, message };
        this.logs.unshift(entry);
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.pop();
        }
        this.notifyLogListeners(entry);
    }

    getRecentLogs() {
        return this.logs;
    }

    updateOpportunity(symbol: string, route: ArbitrageRoute) {
        const now = Date.now();
        const currentOps = { ...this._status.activeOpportunities };
        
        // Add new one
        currentOps[symbol] = { ...route, foundAt: now };

        // Cleanup old ones (> 5 seconds)
        for (const key in currentOps) {
            const op = currentOps[key];
            if (op && now - op.foundAt > 5000) {
                delete currentOps[key];
            }
        }

        this.setStatus({ 
            activeOpportunities: currentOps,
            lastCheckedAt: now 
        });
    }

    updateLastCheck() {
        this.setStatus({ lastCheckedAt: Date.now() });
    }

    subscribeStatus(listener: StatusListener) {
        this.statusListeners.add(listener);
        // Call immediately with current status
        listener(this.currentStatus);
        return () => this.statusListeners.delete(listener);
    }

    subscribeLogs(listener: LogListener) {
        this.logListeners.add(listener);
        return () => this.logListeners.delete(listener);
    }

    private notifyStatusListeners() {
        this.statusListeners.forEach(l => l(this.currentStatus));
    }

    private notifyLogListeners(entry: LogEntry) {
        this.logListeners.forEach(l => l(entry));
    }
}

export const arbitrageStatus = new ArbitrageStatusService();
