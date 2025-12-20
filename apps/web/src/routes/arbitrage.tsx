import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { ArbitrageList } from "@/features/arbitrage/List";
import Header from "@/components/header";

export const Route = createFileRoute("/arbitrage")({
    component: ArbitragePage,
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

function ArbitragePage() {
    return (
        <section>
            <Header />
            <div className="container m-auto px-4 py-8">
                <ArbitrageList />
            </div>
        </section>
    );
}