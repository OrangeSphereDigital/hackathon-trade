import React from "react";

export const WhatWeDo = () => {
  return (
    <section className="py-12 md:py-24" id="what-we-do">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-purple-500">
          What we do
        </div>
        <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
          Turn noisy &quot;arbitrage opportunities&quot; into verifiable truth.
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Crypto prices differ across exchanges. Most &quot;arbitrage signals&quot; online are fake once you include fees and liquidity. 21seconds2mars gives you <strong>verified arbitrage signals</strong> that you can trust — backed by transparent on-chain proof.
        </p>
      </div>
    </section>
  );
};
