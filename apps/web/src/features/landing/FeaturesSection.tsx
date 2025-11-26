import React from "react";
import { ScanLine, Calculator, Filter, BarChart3, FileCheck, Rocket } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      tag: "Scan",
      title: "Live price gap scanner",
      description: "Real-time monitoring of multiple exchanges to detect meaningful price differences as they appear.",
      icon: <ScanLine className="h-5 w-5 text-orange-500" />
    },
    {
      tag: "Compute",
      title: "Net-after-fees calculation",
      description: "We factor in taker fees, spreads, and basic slippage assumptions to estimate the true net opportunity, not the illusion.",
      icon: <Calculator className="h-5 w-5 text-blue-500" />
    },
    {
      tag: "Filter",
      title: "Real vs fake signal filtering",
      description: "A lightweight ML layer helps classify which gaps are likely tradeable versus those that are noise or non-actionable.",
      icon: <Filter className="h-5 w-5 text-purple-500" />
    },
    {
      tag: "Score",
      title: "Confidence scoring",
      description: "Each signal is assigned a confidence score based on spread size, liquidity, and historical hit rates, so you can prioritize attention.",
      icon: <BarChart3 className="h-5 w-5 text-green-500" />
    },
    {
      tag: "Publish",
      title: "On-chain logging",
      description: "Verified signals are committed to an opBNB smart contract, providing a public audit trail of our output for traders, partners, and investors.",
      icon: <FileCheck className="h-5 w-5 text-yellow-500" />
    },
    {
      tag: "Future",
      title: "Smart execution (coming soon)",
      description: "Rule-based triggers will later allow you to define conditions where the engine can execute on your behalf — built on top of the same proof-first infrastructure.",
      icon: <Rocket className="h-5 w-5 text-red-500" />
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-500">
            Core features
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            The signal engine, in simple pieces.
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            We focus on one thing: delivering arbitrage signals that are actually tradeable — not just visually attractive spreads.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-500">
                {feature.tag}
              </div>
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                {/* feature.icon */} {/* Icon placement next to title or above? Content.md doesn't specify icons, but styles had tags. */}
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
