import React from "react";

export const OnChainProof = () => {
  return (
    <section id="on-chain-proof" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-500">
            On-chain proof
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Why on-chain verification matters.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Most platforms show you numbers you can&apos;t verify. We publish each verified signal to opBNB so anyone can audit what we detected and when.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-500">
              Proof layer
            </div>
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              Every signal, on-chain
            </h3>
            <p className="text-sm text-muted-foreground">
              For each verified opportunity, we log the timestamp, exchange pair, gap, and net-after-fees on opBNB. That means there is a permanent, public record of the signals we claim.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-500">
              Transparency
            </div>
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              No black boxes
            </h3>
            <p className="text-sm text-muted-foreground">
              Instead of saying “trust our model”, we show you the exact opportunities as they were detected. This creates a transparent, auditable trail for traders and funds.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-500">
              Trust
            </div>
            <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold">
              Proof-of-Arbitrage
            </h3>
            <p className="text-sm text-muted-foreground">
              By committing signals on-chain, 21seconds2mars becomes the first <strong>Proof-of-Arbitrage protocol</strong>. That’s our moat — and your edge.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
