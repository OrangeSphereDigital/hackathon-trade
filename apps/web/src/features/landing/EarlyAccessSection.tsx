import React, { useState } from "react";
import { ContactModal } from "./ContactModal";
import { Button } from "@/components/ui/button";

export const EarlyAccessSection = () => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'early-access' | 'founders' }>({
    isOpen: false,
    type: 'early-access'
  });

  const openModal = (type: 'early-access' | 'founders') => {
    setModalState({ isOpen: true, type });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

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

        <div className="grid gap-6 md:grid-cols-3 mb-16">
          {/* Card 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 text-xs font-bold uppercase tracking-widest text-purple-500">
              What you get
            </div>
            <h3 className="mb-4 text-xl font-semibold">Verified signals & reports</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Real-time verified arbitrage signals
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                On-chain audit trail for each verified signal
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
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
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Direct feedback loop with the team
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Access to new features before public
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
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
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Target: $300–$500/month per seat
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Limited to the first 10 serious users
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                Structured as a beta / pilot program
              </li>
            </ul>
          </div>
        </div>

        {/* Gradient CTA Card */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-purple-400 via-purple-500 to-indigo-600 p-8 md:p-12 shadow-2xl">
          <div className="relative z-10 max-w-3xl">
            <h3 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Get on the Early Access list.
            </h3>
            <p className="mb-8 text-lg text-purple-100/90 md:text-xl">
              We’re handpicking a small group of traders and teams who want verifiable arbitrage signals with on-chain proof and direct access to the builders.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button 
                size="lg" 
                onClick={() => openModal('early-access')}
                className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg border-0 font-semibold text-base px-8"
              >
                Join Early Access
              </Button>
              <Button 
                size="lg" 
                onClick={() => openModal('founders')}
                className="bg-purple-700/30 text-white hover:bg-purple-700/50 border-0 font-semibold text-base px-8 backdrop-blur-sm"
              >
                Talk to the founders
              </Button>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-400/30 blur-3xl" />
        </div>

        <ContactModal 
          isOpen={modalState.isOpen} 
          onClose={closeModal} 
          type={modalState.type} 
        />
      </div>
    </section>
  );
};


