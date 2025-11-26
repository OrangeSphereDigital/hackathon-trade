import React from "react";
import { ScanLine, Calculator, Filter, FileText, Zap, TrendingUp } from "lucide-react";

function StepCard({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center rounded-xl border border-border bg-background p-6 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon}
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-bold text-primary-foreground">
          {number}
        </div>
      </div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Scan",
      description: "We monitor multiple centralized and decentralized exchanges in real time for price gaps.",
      icon: <ScanLine className="h-6 w-6 text-primary" />
    },
    {
      number: "2",
      title: "Compute",
      description: "For each candidate gap, we calculate net opportunity after fees and basic slippage assumptions.",
      icon: <Calculator className="h-6 w-6 text-primary" />
    },
    {
      number: "3",
      title: "Filter",
      description: "Our models classify signals as likely tradeable or likely fake, reducing noise significantly.",
      icon: <Filter className="h-6 w-6 text-primary" />
    },
    {
      number: "4",
      title: "Publish",
      description: "Verified signals are written to opBNB with key parameters, creating an immutable record.",
      icon: <FileText className="h-6 w-6 text-primary" />
    },
    {
      number: "5",
      title: "Act",
      description: "You use these signals inside your own trading stack. Smart execution via rules will follow later.",
      icon: <Zap className="h-6 w-6 text-primary" />
    },
    {
      number: "6",
      title: "Learn",
      description: "Over time, we refine our models and thresholds based on which on-chain-logged signals prove most profitable.",
      icon: <TrendingUp className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section id="how-it-works" className="bg-muted/30 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center">
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-500">
            How it works
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">From noisy markets to verifiable signals.</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Our flow is simple by design: scan, verify, publish. You stay in control of execution.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step) => (
            <StepCard 
              key={step.number}
              number={step.number} 
              icon={step.icon} 
              title={step.title} 
              description={step.description} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};
