import React from "react";
import { ContactForm } from "./ContactForm";

export const TeamSection = () => {
  return (
    <section className="py-12 md:py-24" id="team">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 md:text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-500">
            Team
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Built on real trading experience, not theory.
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground md:mx-auto">
            21seconds2mars is shaped by a decade of hands-on crypto trading and a practical understanding of what actually works in arbitrage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {/* Card 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">Michael · Founder</h3>
            <p className="text-sm text-muted-foreground">
              Crypto trader for 10+ years. The engine is built around the real-world problems he hit while running arbitrage strategies across exchanges.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">Shakil · Co-Founder</h3>
            <p className="text-sm text-muted-foreground">
              Go-to-market and product architecture. Responsible for positioning, user experience, and the execution roadmap that turns the engine into a usable product.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-2 text-xl font-semibold">Ataul · Co-Founder</h3>
            <p className="text-sm text-muted-foreground">
              Technical lead. Owns backend engineering, data pipelines, and the integrations that keep the signal engine reliable and scalable.
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto rounded-xl border border-border bg-card/50 p-8 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold">Talk to the Founders</h3>
            <p className="text-muted-foreground text-sm mt-2">
              We are building this for you. Tell us what you need.
            </p>
          </div>
          <ContactForm type="founders" />
        </div>
      </div>
    </section>
  );
};

