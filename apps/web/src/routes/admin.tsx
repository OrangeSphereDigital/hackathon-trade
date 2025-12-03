import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { client } from '@/lib/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Square, Activity, Clock, DollarSign, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
  beforeLoad: async () => {
        const session = await authClient.getSession();
        if (!session.data) {
            redirect({
                to: "/login",
                throw: true,
            });
        }
        if (!session?.data?.user?.role || session.data.user.role !== 'admin') {
            redirect({
                to: "/",
                throw: true,
            });
        }
        return { session };
    },
})

interface LogEntry {
    timestamp: number;
    level: 'info' | 'error' | 'warn';
    message: string;
}

interface BotStatus {
    isRunning: boolean;
    lastCheckedAt: number;
    activeOpportunities: Record<string, any>;
}

function AdminDashboard() {
    const [status, setStatus] = useState<BotStatus>({
        isRunning: false,
        lastCheckedAt: 0,
        activeOpportunities: {}
    })
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [wsConnected, setWsConnected] = useState(false)

    useEffect(() => {
        // Initial fetch
        const fetchStatus = async () => {
            const { data } = await client.admin.arbitrage.status.get()
            if (data) {
                setStatus({
                    isRunning: data.isRunning,
                    lastCheckedAt: data.lastCheckedAt,
                    activeOpportunities: data.activeOpportunities
                })
                setLogs(data.logs || [])
            }
        }
        fetchStatus()

        // WebSocket connection
        // @ts-ignore - Treaty types might be imperfect for WS
        const ws = client.admin.arbitrage.live.subscribe()
        
        ws.on('open', () => {
            setWsConnected(true)
            console.log('WS Connected')
        })

        ws.on('message', (event: any) => {
            const msg = event.data
            if (msg.type === 'status') {
                setStatus(prev => ({ ...prev, ...msg.data }))
            } else if (msg.type === 'log') {
                setLogs(prev => [msg.data, ...prev].slice(0, 100))
            }
        })

        ws.on('close', () => setWsConnected(false))

        return () => {
            ws.close()
        }
    }, [])

    const toggleBot = async () => {
        if (status.isRunning) {
            await client.admin.arbitrage.stop.post()
            toast.info('Bot stopping...')
        } else {
            await client.admin.arbitrage.start.post()
            toast.success('Bot starting...')
        }
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        {wsConnected ? 'Live Connection' : 'Disconnected'}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button 
                        variant={status.isRunning ? "destructive" : "default"}
                        onClick={toggleBot}
                        className="w-32"
                    >
                        {status.isRunning ? (
                            <>
                                <Square className="mr-2 h-4 w-4" /> Stop Bot
                            </>
                        ) : (
                            <>
                                <Play className="mr-2 h-4 w-4" /> Start Bot
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {status.isRunning ? 'Running' : 'Stopped'}
                            <Badge variant={status.isRunning ? 'default' : 'secondary'}>
                                {status.isRunning ? 'Active' : 'Idle'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Check</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {status.lastCheckedAt ? new Date(status.lastCheckedAt).toLocaleTimeString() : 'Never'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Most recent ticker update
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.keys(status.activeOpportunities).length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Potential trades in view
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 h-[500px]">
                {/* Active Opportunities List */}
                <Card className="col-span-1 flex flex-col overflow-hidden">
                    <CardHeader>
                        <CardTitle>Live Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <div className="space-y-4">
                            {Object.entries(status.activeOpportunities).length === 0 && (
                                <div className="text-center text-muted-foreground py-10">
                                    No opportunities detected right now.
                                </div>
                            )}
                            {Object.entries(status.activeOpportunities).map(([symbol, op]: [string, any]) => (
                                <div key={symbol} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div>
                                        <div className="font-semibold">{symbol}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {op.buyExchange} → {op.sellExchange}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${op.profit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {op.profit > 0 ? '+' : ''}{op.profit.toFixed(4)} USDT
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Found {Math.floor((Date.now() - op.foundAt) / 1000)}s ago
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Terminal / Logs */}
                <Card className="col-span-1 flex flex-col overflow-hidden bg-black border-gray-800">
                    <CardHeader className="border-b border-gray-800 bg-gray-900/50">
                        <CardTitle className="flex items-center gap-2 text-gray-200">
                            <Terminal className="h-4 w-4" />
                            System Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto p-0 bg-black font-mono text-xs">
                        <div className="p-4 space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-gray-500 shrink-0">
                                        [{new Date(log.timestamp).toLocaleTimeString()}]
                                    </span>
                                    <span className={`
                                        ${log.level === 'error' ? 'text-red-400' : ''}
                                        ${log.level === 'warn' ? 'text-yellow-400' : ''}
                                        ${log.level === 'info' ? 'text-blue-400' : ''}
                                    `}>
                                        {log.level.toUpperCase()}
                                    </span>
                                    <span className="text-gray-300 break-all">
                                        {log.message}
                                    </span>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <div className="text-gray-600 italic">Waiting for logs...</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
