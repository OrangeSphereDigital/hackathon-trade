import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Home,
});

import { Navbar } from "@/features/landing/Navbar";
import { Hero } from "@/features/landing/Hero";
import { WhatWeDo } from "@/features/landing/WhatWeDo";
import { OnChainProof } from "@/features/landing/OnChainProof";
import { FeaturesSection } from "@/features/landing/FeaturesSection";
import { HowItWorks } from "@/features/landing/HowItWorks";
import { EarlyAccessSection } from "@/features/landing/EarlyAccessSection";
import { HackathonSection } from "@/features/landing/HackathonSection";
import { TeamSection } from "@/features/landing/TeamSection";
import { CtaBanner } from "@/features/landing/CtaBanner";
import { Footer } from "@/features/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <WhatWeDo />
        <OnChainProof />
        <FeaturesSection />
        <HowItWorks />
        <EarlyAccessSection />
        <HackathonSection />
        <TeamSection />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
