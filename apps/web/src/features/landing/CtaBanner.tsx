import React from "react";

export const CtaBanner = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-purple-600 p-8 text-left text-white md:p-16">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="mb-2 text-3xl font-bold md:text-4xl">Get on the Early Access list.</h2>
              <p className="text-lg opacity-90 md:text-xl">
                We’re handpicking a small group of traders and teams who want verifiable arbitrage signals with on-chain proof and direct access to the builders.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="h-14 rounded-full bg-white px-8 text-lg font-bold text-primary shadow-xl transition-colors hover:bg-gray-100">
                Join Early Access
              </button>
              <a href="mailto:founders@21seconds2mars.com" className="flex h-14 items-center justify-center rounded-full border border-white/30 bg-black/20 px-8 text-lg font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/30">
                Talk to the founders
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
