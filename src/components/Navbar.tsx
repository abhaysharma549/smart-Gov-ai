"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  FilePlus,
  Search,
  Building2,
  BarChart3,
  Home,
  PhoneCall,
  Menu,
  X,
  Lock,
} from "lucide-react";

interface NavbarProps {
  onOpenFileModal: () => void;
  onOpenTracker: (ref?: string) => void;
  onOpenOfficerModal: () => void;
  activeTab: "overview" | "tracker" | "departments" | "analytics";
  setActiveTab: (tab: "overview" | "tracker" | "departments" | "analytics") => void;
}

export default function Navbar({
  onOpenFileModal,
  onOpenTracker,
  onOpenOfficerModal,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white">
      {/* Official Civic Top Strip */}
      <div className="bg-slate-900 px-4 py-1.5 text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-3">
            <span className="font-medium tracking-wide text-slate-200 flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              National Civic Redressal Network
            </span>
            <span className="hidden text-slate-500 md:inline">|</span>
            <span className="hidden text-slate-300 md:inline">
              Autonomous AI Triage • Statutory SLA Framework
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <a
              href="tel:1800112026"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <PhoneCall className="h-3 w-3 text-blue-400" />
              <span>Toll-Free Helpline:</span>
              <strong className="text-white underline">1800-11-2026</strong>
            </a>
            <span className="hidden rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 sm:inline">
              ISO 9001:2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Administrative Header Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Emblem */}
        <div
          onClick={() => setActiveTab("overview")}
          className="flex cursor-pointer items-center gap-2.5 transition-opacity hover:opacity-90"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setActiveTab("overview")}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                SmartGov <span className="text-blue-700">AI</span>
              </span>
              <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                Civic Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Department of Urban Governance & Public Grievance
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main Navigation">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Home className="h-3.5 w-3.5" />
            Portal Home
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("tracker");
              onOpenTracker();
            }}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "tracker"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Track Grievance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("departments")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "departments"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Departments & SLA
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "analytics"
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Public Transparency
          </button>
        </nav>

        {/* Action Controls */}
        <div className="hidden items-center gap-2 sm:flex">
          {/* Officer Workbench Portal */}
          <button
            type="button"
            onClick={onOpenOfficerModal}
            className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Lock className="h-3.5 w-3.5 text-blue-700" />
            Officer Desk
          </button>

          {/* Lodge Complaint CTA */}
          <button
            type="button"
            onClick={onOpenFileModal}
            className="flex items-center gap-1.5 rounded-md bg-blue-700 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800"
          >
            <FilePlus className="h-3.5 w-3.5" />
            File Grievance
          </button>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-md border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50 lg:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left font-medium ${
                activeTab === "overview"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Home className="h-4 w-4" /> Portal Home
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("tracker");
                onOpenTracker();
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left font-medium ${
                activeTab === "tracker"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Search className="h-4 w-4" /> Track Grievance Status
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("departments");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left font-medium ${
                activeTab === "departments"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Building2 className="h-4 w-4" /> Departments & Statutory SLAs
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("analytics");
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-left font-medium ${
                activeTab === "analytics"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Public Transparency Metrics
            </button>

            <div className="mt-2 border-t border-slate-200 pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenFileModal();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800"
              >
                <FilePlus className="h-4 w-4" /> File New Grievance
              </button>

              <button
                type="button"
                onClick={() => {
                  onOpenOfficerModal();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Lock className="h-3.5 w-3.5 text-blue-700" /> Officer Dispatch Desk
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
