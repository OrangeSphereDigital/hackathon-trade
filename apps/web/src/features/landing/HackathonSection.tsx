import React from "react";

export const HackathonSection = () => {
  return (
    <section className="py-12 md:py-24" id="hackathon">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 md:text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-500">
            BNB Chain Hackathon
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Built in the open, on BNB Chain.
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground md:mx-auto">
            We are developing and showcasing our verification engine as part of the BNB Chain Local Hackathon in Abu Dhabi — leveraging opBNB for on-chain proof.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">Why BNB & opBNB</h3>
            <p className="text-sm text-muted-foreground">
              Low fees, fast confirmations, and EVM-compatibility make opBNB the ideal place to write frequent signal logs that traders and partners can verify.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">What we&apos;ll demo</h3>
            <ul className="list-none space-y-2 text-sm text-muted-foreground">
              <li className="relative pl-4 before:absolute before:left-0 before:text-orange-500 before:content-['•']">Real-time gap detection</li>
              <li className="relative pl-4 before:absolute before:left-0 before:text-orange-500 before:content-['•']">Net-after-fees signal output</li>
              <li className="relative pl-4 before:absolute before:left-0 before:text-orange-500 before:content-['•']">opBNB event logs of verified signals</li>
              <li className="relative pl-4 before:absolute before:left-0 before:text-orange-500 before:content-['•']">Simple dashboard to explore them</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">What comes next</h3>
            <p className="text-sm text-muted-foreground">
              Post-hackathon, {"we'll"} onboard early access users, expand exchange coverage, and evolve toward a full institutional signal & execution stack.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
