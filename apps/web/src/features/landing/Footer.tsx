import React from "react";
import { Link } from "@tanstack/react-router";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/20 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="text-sm text-muted-foreground">
            &copy; 2025 21seconds2mars. <span className="text-foreground/70">The first on-chain verified arbitrage signal engine.</span>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link to="/" hash="what-we-do" className="hover:text-foreground transition-colors">What we do</Link>
            <Link to="/" hash="features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/" hash="early-access" className="hover:text-foreground transition-colors">Early access</Link>
            <Link to="/" hash="team" className="hover:text-foreground transition-colors">Team</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
