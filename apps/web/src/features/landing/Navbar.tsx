"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import UserMenu from "@/components/user-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { appConfig } from "@/config/app";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = Object.values(appConfig.links);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative flex h-16 items-center justify-between">
          {/* Left: Logo + Tagline */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-12 items-center justify-center rounded-full bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/50 text-xl md:text-2xl">
                21
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-lg md:text-xl font-bold tracking-tight">{appConfig.name}</span>
                <span className="hidden text-[10px] text-muted-foreground md:block">{appConfig.description}</span>
              </div>
            </Link>
          </div>

          {/* Center: Hackathon Pill - Absolutely positioned to be dead center */}
          {appConfig.hackathon.active && (
            <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
              <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-500 animate-pulse">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span>{appConfig.hackathon.label}</span>
              </div>
            </div>
          )}

          {/* Right: Links */}
          <div className="hidden items-center gap-6 md:flex">
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
            <div className="flex items-center gap-2">
              <UserMenu />
              <ModeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="p-2 text-muted-foreground hover:text-foreground "
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <ModeToggle />
            <UserMenu />
          </div>
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
