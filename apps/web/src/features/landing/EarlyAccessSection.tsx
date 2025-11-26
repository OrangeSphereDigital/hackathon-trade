import React from "react";

export const EarlyAccessSection = () => {
  return (
    <section className="py-12 md:py-24" id="early-access">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 md:text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-500">
            Early access
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            We’re opening 10 premium Early Access slots.
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground md:mx-auto">
            Designed for serious traders and small desks who want proof-backed arbitrage signals, not hype.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-500">
              What you get
            </div>
            <h3 className="mb-4 text-xl font-semibold">Verified signals & reports</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                Real-time verified arbitrage signals
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                On-chain audit trail for each verified signal
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                Weekly “Top Opportunities” summary
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-500">
              Priority
            </div>
            <h3 className="mb-4 text-xl font-semibold">Closer to the engine</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                Direct feedback loop with the team
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                Access to new features before public
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                Influence over roadmap & integrations
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-500">
              Pricing
            </div>
            <h3 className="mb-4 text-xl font-semibold">Pilot cohort</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                Target: $300–$500/month per seat
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                Limited to the first 10 serious users
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                Structured as a beta / pilot program
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
