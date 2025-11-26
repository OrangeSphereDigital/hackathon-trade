"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left font-medium transition-colors hover:bg-muted/50"
      >
        {question}
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="border-t border-border/50 bg-muted/10 p-4 pt-0 text-sm leading-relaxed text-muted-foreground">
          <div className="pt-4">{answer}</div>
        </div>
      )}
    </div>
  );
}

export const FaqSection = () => {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <FaqItem 
            question="Do I need to deposit funds to 21s2mars?" 
            answer="Yes. To enable automated trading, you will deposit funds into your secure 21s2mars wallet. This allows our algorithms to execute trades instantly on your behalf without manual signing for every transaction."
          />
          <FaqItem 
            question="How secure are my funds?" 
            answer="We use industry-standard security protocols including cold storage, multi-signature wallets, and encryption to ensure your assets are always protected."
          />
          <FaqItem 
            question="Can I withdraw my funds anytime?" 
            answer="Absolutely. You have full access to your funds and can withdraw your capital and profits at any time with no lock-up periods."
          />
          <FaqItem 
            question="What strategies can I automate?" 
            answer="You can automate dollar-cost averaging (DCA), stop-loss/take-profit orders, arbitrage opportunities, and custom logic based on price movements."
          />
        </div>
      </div>
    </section>
  );
};
