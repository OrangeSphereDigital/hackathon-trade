import React from "react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
      <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
        <div 
          className="aspect-1155/678 w-288.75 bg-linear-to-tr from-primary/20 to-purple-500/20 opacity-30" 
          style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}
        ></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Text */}
          <div className="lg:col-span-7 text-left">
            <div className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-purple-500">
              The First On-Chain Verified Arbitrage Signal Engine
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl leading-tight">
              See <span className="bg-linear-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">real crypto price gaps</span>, verified and logged on-chain.
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl max-w-xl">
              21seconds2mars detects real price differences across exchanges, filters out fake signals, and publishes every verified opportunity on-chain — so you only see the truth.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button 
                onClick={() => document.getElementById('early-access')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-linear-to-r from-orange-500 to-orange-400 px-8 font-semibold text-black shadow-lg shadow-orange-500/25 transition-all hover:opacity-90"
              >
                Join Early Access
              </button>
              <button 
                onClick={() => document.getElementById('hackathon')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-12 rounded-full border border-border bg-background/80 px-8 font-medium transition-all hover:bg-accent hover:text-accent-foreground"
              >
                View Hackathon Build
              </button>
            </div>

            <div className="flex flex-wrap gap-8 text-xs text-muted-foreground">
              <div className="flex flex-col gap-1">
                <div className="font-bold uppercase tracking-wider text-[10px]">Focus</div>
                <div className="text-sm text-foreground">Verified arbitrage signals</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-bold uppercase tracking-wider text-[10px]">Differentiator</div>
                <div className="text-sm text-foreground">On-chain proof (opBNB)</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-bold uppercase tracking-wider text-[10px]">Users</div>
                <div className="text-sm text-foreground">Serious traders & small funds</div>
              </div>
            </div>
          </div>

          {/* Right Column: Snapshot Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-border/50 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-800/50 to-gray-950/80 p-6 shadow-2xl backdrop-blur-sm">
              <div className="mb-4 text-sm font-semibold text-foreground">Signal Engine Snapshot</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <div className="mb-1 text-[11px] text-muted-foreground">Status</div>
                  <div className="text-xs font-medium">Live data · MVP in progress</div>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <div className="mb-1 text-[11px] text-muted-foreground">Core</div>
                  <div className="text-xs font-medium">Scanner + ML filter + on-chain logger</div>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <div className="mb-1 text-[11px] text-muted-foreground">Output</div>
                  <div className="text-xs font-medium">Net-after-fees verified signals</div>
                </div>
                <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                  <div className="mb-1 text-[11px] text-muted-foreground">Proof</div>
                  <div className="text-xs font-medium">Every verified signal logged to opBNB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
