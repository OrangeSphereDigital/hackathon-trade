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
import { Footer } from "@/features/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-orange-500 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <WhatWeDo />
        <OnChainProof />
        <FeaturesSection />
        <HowItWorks />
        <HackathonSection />
        <TeamSection />
        <EarlyAccessSection />
      </main>
      <Footer />
    </div>
  );
}
