"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Early Access", id: "early-access" },
    { label: "How it works", id: "how-it-works" },
    { label: "Hackathon build", id: "hackathon" },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Tagline */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 font-bold text-black shadow-lg shadow-orange-500/50">
                21
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg font-bold tracking-tight">21seconds2mars</span>
                <span className="hidden text-[10px] text-muted-foreground md:block">On-chain verified arbitrage signals</span>
              </div>
            </Link>
          </div>

          {/* Right: Pill + Links */}
          <div className="hidden items-center gap-6 md:flex">
             {/* Hackathon Pill */}
             <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background/50 px-3 py-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                <span>Building for BNB Chain Hackathon · Abu Dhabi</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to="/"
                  hash={item.id}
                  className="transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="p-2 text-muted-foreground hover:text-foreground md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="space-y-4 border-b border-border bg-background px-4 py-4 md:hidden">
          {/* Mobile Hackathon Pill */}
          <div className="flex items-center gap-2 rounded-full border border-border/40 bg-background/50 px-3 py-1 text-xs text-muted-foreground w-fit">
                <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                <span>Building for BNB Chain Hackathon</span>
            </div>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to="/"
              hash={item.id}
              className="block w-full py-2 text-left text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
