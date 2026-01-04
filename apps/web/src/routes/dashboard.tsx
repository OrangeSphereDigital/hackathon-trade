import { authClient } from "@/lib/auth-client";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { LiveTicker } from "@/features/live-tick-and-arbitrage";
import { SimulatedTradesCard } from "@/features/simulated/SimulatedTradesCard";
import { ArbitrageList } from "@/features/arbitrage/List";
import { DashboardLayout } from "@/layout/DashboardLayout";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight pt-2 pb-4">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {session.data?.user.name}
            </p>
          </div>
        </div>

        <div id="monitor">
          <LiveTicker />
        </div>

        <div id="arbitrage">
          <h2 className="text-2xl font-bold tracking-tight pb-4">
            Arbitrage List
          </h2>
          <ArbitrageList />
        </div>

        <div id="simulation">
          <h2 className="text-2xl font-bold tracking-tight pt-2 pb-4">
            Simulated Trades
          </h2>
          <SimulatedTradesCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
