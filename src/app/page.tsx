"use client";

import React, { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ComplaintFormModal from "@/components/ComplaintFormModal";
import ComplaintTracker from "@/components/ComplaintTracker";
import OfficerWorkbenchModal from "@/components/OfficerWorkbenchModal";
import DepartmentsSection from "@/components/DepartmentsSection";
import AnalyticsSection from "@/components/AnalyticsSection";
import { AUTHORIZED_ADMINS } from "@/lib/auth-constants";
import {
  INITIAL_TRACKED_COMPLAINTS,
  TrackedComplaint,
  MOCK_ACTIVITY_LOGS,
  ActivityLogItem,
} from "@/lib/mock-data";
import {
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  FilePlus,
  Search,
  Building2,
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  XCircle,
  Bell,
  ArrowRight,
  Menu,
  X,
  History,
  RefreshCw,
  UserCheck,
  LogOut,
  GraduationCap,
  Shield,
  Send,
  HelpCircle,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [complaints, setComplaints] = useState<TrackedComplaint[]>(
    INITIAL_TRACKED_COMPLAINTS
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(
    MOCK_ACTIVITY_LOGS
  );
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "all-complaints" | "tracker" | "departments" | "analytics" | "activity-log"
  >("dashboard");
  const [selectedRef, setSelectedRef] = useState<string>("SG-20261031-WTR44");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOfficerOpen, setIsOfficerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active admin index for switching between the 3 authorized admin accounts
  const [adminIndex, setAdminIndex] = useState(0);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Route protection: redirect unauthenticated visitors to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-700 border-t-transparent mb-3" />
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Verifying Authenticated Session...
        </span>
        <span className="text-[11px] text-slate-400 mt-1">SmartGov AI Administrative Gateway</span>
      </div>
    );
  }

  // Derive user and role from session
  const isSessionAdmin = session?.user?.role === "ADMIN";
  const currentAdmin = AUTHORIZED_ADMINS[adminIndex] || AUTHORIZED_ADMINS[0];

  const activeUser = {
    name: isSessionAdmin
      ? session?.user?.name || currentAdmin.name
      : session?.user?.name || "Student Citizen",
    registrationNumber: isSessionAdmin
      ? session?.user?.registrationNumber || currentAdmin.registrationNumber
      : session?.user?.registrationNumber || "22BCS10045",
    designation: isSessionAdmin
      ? session?.user?.designation || currentAdmin.designation
      : "Verified Citizen / Student Resident",
    role: isSessionAdmin ? "ADMIN" : "CITIZEN",
    email: session?.user?.email || (isSessionAdmin ? currentAdmin.email : "student@university.edu"),
  };

  const handleComplaintSubmitted = (newComplaint: TrackedComplaint) => {
    setComplaints([newComplaint, ...complaints]);
    setSelectedRef(newComplaint.referenceNumber);
    // Add to audit activity log
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      action: "New Grievance Registered",
      details: `${newComplaint.title} auto-routed to ${newComplaint.department}.`,
      actor: `${activeUser.name} (${activeUser.registrationNumber})`,
      actorRole: activeUser.role === "ADMIN" ? "Project Owner" : "Verified Citizen",
      referenceNumber: `Ref: ${newComplaint.referenceNumber}`,
      timestamp: "Just now",
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  const handleUpdateComplaint = (updated: TrackedComplaint) => {
    setComplaints(
      complaints.map((c) =>
        c.referenceNumber === updated.referenceNumber ? updated : c
      )
    );
    // Add to audit activity log
    const newLog: ActivityLogItem = {
      id: `act-${Date.now()}`,
      action: `Status Updated to ${updated.status}`,
      details: `Complaint ${updated.referenceNumber} status modified by field dispatch officer.`,
      actor: "Officer S. K. Verma",
      actorRole: "Field Operations Lead",
      referenceNumber: `Ref: ${updated.referenceNumber}`,
      timestamp: "Just now",
    };
    setActivityLogs([newLog, ...activityLogs]);
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return (
        c.referenceNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.citizenName.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 flex font-sans antialiased">
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR (DARK NAVY THEME MATCHING DESIGN SYSTEM) */}
      {/* ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0D1929] border-r border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Brand Lockup */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-white uppercase block">
                SMARTGOV AI
              </span>
              <span className="text-[9px] font-semibold tracking-wider text-amber-400 block uppercase">
                {isSessionAdmin ? "ADMIN CONTROL PANEL" : "CITIZEN PORTAL"}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white lg:hidden p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User / Admin Profile Card */}
        <div className="m-3 rounded-lg border border-slate-800 bg-[#13233A] p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className={`text-[9px] font-bold tracking-wider uppercase ${isSessionAdmin ? "text-amber-400" : "text-blue-300"}`}>
              {isSessionAdmin ? "PROJECT OWNER / ADMIN" : "REGISTERED RESIDENT"}
            </span>
            <span className={`rounded px-1.5 py-0.2 font-mono font-bold text-[9px] ${isSessionAdmin ? "bg-amber-500 text-slate-950" : "bg-blue-600 text-white"}`}>
              {activeUser.registrationNumber}
            </span>
          </div>
          <h4 className="mt-1.5 font-bold text-white text-xs">{activeUser.name}</h4>
          <p className="text-[10px] text-slate-400 truncate">{activeUser.designation}</p>

          {/* Admin Switcher: strictly limited to the 3 authorized admin accounts */}
          {isSessionAdmin && (
            <button
              type="button"
              onClick={() => {
                setAdminIndex((prev) => (prev + 1) % AUTHORIZED_ADMINS.length);
              }}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded border border-slate-700 bg-slate-800/90 py-1 px-2 text-[10px] font-medium text-slate-300 hover:bg-slate-700 transition-colors"
              title="Toggle between the 3 authorized admins (Abhay, Vatsal, Sehaj)"
            >
              <RefreshCw className="h-3 w-3 text-amber-400" />
              <span>Switch Admin ({AUTHORIZED_ADMINS[(adminIndex + 1) % AUTHORIZED_ADMINS.length].name.split(" ")[0]})</span>
            </button>
          )}

          {!isSessionAdmin && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Verified Student Resident</span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-[#1E3048] text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("all-complaints");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors ${
              activeTab === "all-complaints"
                ? "bg-[#1E3048] text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>{isSessionAdmin ? "All Grievances" : "My Grievances"}</span>
            <span className="ml-auto rounded-full bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-400">
              {complaints.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsFormOpen(true);
              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
          >
            <FilePlus className="h-4 w-4 text-emerald-400" />
            <span>Lodge Grievance</span>
            <span className="ml-auto rounded bg-emerald-500/20 text-emerald-400 px-1 py-0.2 text-[9px] font-bold">
              NEW
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("tracker");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors ${
              activeTab === "tracker"
                ? "bg-[#1E3048] text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Track Grievance</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("departments");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors ${
              activeTab === "departments"
                ? "bg-[#1E3048] text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Departments & SLA</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("analytics");
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors ${
              activeTab === "analytics"
                ? "bg-[#1E3048] text-amber-400 border border-amber-500/40 font-semibold"
                : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Public Transparency</span>
          </button>

          {/* Officer workbench only for admin / officer desk */}
          {isSessionAdmin && (
            <button
              type="button"
              onClick={() => {
                setIsOfficerOpen(true);
                setSidebarOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
            >
              <Users className="h-4 w-4 text-blue-400" />
              <span>Officer Dispatch Desk</span>
              <span className="ml-auto rounded bg-blue-500/20 text-blue-300 px-1 py-0.2 text-[9px] font-bold">
                LIVE
              </span>
            </button>
          )}

          {isSessionAdmin && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("activity-log");
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium transition-colors ${
                activeTab === "activity-log"
                  ? "bg-[#1E3048] text-amber-400 border border-amber-500/40 font-semibold"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <History className="h-4 w-4" />
              <span>Admin Activity Log</span>
            </button>
          )}

          {/* Logout in sidebar */}
          <div className="pt-2 mt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-400" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500">
          <div className="flex items-center justify-between">
            <span>Release v2.4</span>
            <span className="text-emerald-400 font-mono">● Online</span>
          </div>
          <p className="mt-0.5 text-slate-600">
            {isSessionAdmin ? "Municipal Operations Cell" : "Student Residency Wing"}
          </p>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN VIEW AREA (TOPBAR + CONTENT)                     */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Role Header Console Pill */}
            {isSessionAdmin ? (
              <div className="inline-flex items-center gap-1.5 rounded bg-amber-100/90 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900 tracking-wide">
                <span>ADMINISTRATIVE CONSOLE • MUNICIPAL GRIEVANCE CELL</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-900 tracking-wide">
                <span>CITIZEN PORTAL • CAMPUS & CIVIC REDRESSAL</span>
              </div>
            )}
          </div>

          {/* Right Header Badges & User Pill */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            {/* Live date */}
            <div className="hidden sm:flex items-center gap-1.5 text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Mon, Nov 16, 2026</span>
            </div>

            {/* Activity log button */}
            {isSessionAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("activity-log")}
                className="hidden sm:inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 transition-colors text-xs font-medium"
              >
                <History className="h-3.5 w-3.5 text-slate-400" />
                <span>Activity Log</span>
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveTab("all-complaints")}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                  1
                </span>
              </button>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-white font-bold text-xs ${isSessionAdmin ? "bg-slate-900" : "bg-blue-700"}`}>
                {activeUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden md:block leading-tight text-left">
                <span className="text-xs font-bold text-slate-900 block truncate max-w-[140px]">
                  {activeUser.name}
                </span>
                <span className={`text-[10px] font-medium block ${isSessionAdmin ? "text-amber-700" : "text-blue-700"}`}>
                  {activeUser.registrationNumber} • {isSessionAdmin ? "Admin" : "Citizen"}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors text-xs font-medium"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-1 p-4 sm:p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB: DASHBOARD (ADMIN DASHBOARD VS CITIZEN DASHBOARD)    */}
          {/* ======================================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Dark Welcome Banner */}
              <div className="rounded-xl bg-[#0F1E36] p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isSessionAdmin
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                      : "bg-blue-500/20 border-blue-500/30 text-blue-300"
                  }`}>
                    {isSessionAdmin ? (
                      <>
                        <UserCheck className="h-3 w-3 text-amber-400" />
                        PROJECT OWNER ACTIVE SESSION
                      </>
                    ) : (
                      <>
                        <GraduationCap className="h-3 w-3 text-blue-400" />
                        VERIFIED CITIZEN / RESIDENT PORTAL
                      </>
                    )}
                  </div>
                  <h1 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Welcome back, {activeUser.name}!
                  </h1>
                  <p className="mt-1 text-xs text-slate-300">
                    {activeUser.designation} • ID: <strong className="text-white">{activeUser.registrationNumber}</strong> • {isSessionAdmin ? "Centralized Municipal Operations" : "Statutory SLA Civic Redressal"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSessionAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveTab("activity-log")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <History className="h-3.5 w-3.5" />
                        <span>View Activity Log</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("all-complaints")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-xs"
                      >
                        <ClipboardList className="h-3.5 w-3.5" />
                        <span>Review All Grievances</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-xs"
                      >
                        <FilePlus className="h-3.5 w-3.5" />
                        <span>Lodge New Grievance</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("tracker")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <Search className="h-3.5 w-3.5" />
                        <span>Track My Grievance</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 9 Core KPIs Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  {isSessionAdmin
                    ? "CAMPUS / MUNICIPAL METRICS OVERVIEW (9 CORE KPIS)"
                    : "MY CIVIC GRIEVANCE SUMMARY & SLA OVERVIEW"}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* KPI 1 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {isSessionAdmin ? "TOTAL GRIEVANCES" : "TOTAL FILED"}
                      </span>
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {isSessionAdmin ? "14,892" : complaints.length}
                    </p>
                    <span className="mt-1 text-[10px] text-slate-400 block">
                      {isSessionAdmin ? "Registered citizens" : "Submitted by you"}
                    </span>
                  </div>

                  {/* KPI 2 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        DEPARTMENTS
                      </span>
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">6</p>
                    <span className="mt-1 text-[10px] text-slate-400 block">
                      Across 12 zones
                    </span>
                  </div>

                  {/* KPI 3 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        RESOLVED
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-emerald-700">
                      {isSessionAdmin ? "14,238" : complaints.filter((c) => c.status === "RESOLVED").length}
                    </p>
                    <span className="mt-1 text-[10px] text-emerald-600 block">
                      Ready & verified
                    </span>
                  </div>

                  {/* KPI 4 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        RUNNING
                      </span>
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-amber-700">
                      {isSessionAdmin ? "184" : complaints.filter((c) => c.status === "IN_PROGRESS").length}
                    </p>
                    <span className="mt-1 text-[10px] text-amber-600 block">
                      Active crew cycles
                    </span>
                  </div>

                  {/* KPI 5 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                        FAULTY / OVERDUE
                      </span>
                      <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
                    <span className="mt-1 text-[10px] text-slate-400 block">
                      Zero SLA breach
                    </span>
                  </div>

                  {/* KPI 6 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        TOTAL BOOKED
                      </span>
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">8</p>
                    <span className="mt-1 text-[10px] text-slate-400 block">
                      Cumulative logs
                    </span>
                  </div>
                </div>

                {/* Second row of 3 metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  {/* Row 2 - 1 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        PENDING / UPCOMING
                      </span>
                      <Clock className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-amber-700">3</p>
                    <span className="mt-1 text-[10px] text-slate-400 block">
                      Reserved slots & triage
                    </span>
                  </div>

                  {/* Row 2 - 2 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        COMPLETED
                      </span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-emerald-700">2</p>
                    <span className="mt-1 text-[10px] text-emerald-600 block">
                      Fulfilled & verified
                    </span>
                  </div>

                  {/* Row 2 - 3 */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                        CANCELLED / MERGED
                      </span>
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-red-700">3</p>
                    <span className="mt-1 text-[10px] text-slate-400 block">
                      Released to waitlist / duplicate
                    </span>
                  </div>
                </div>
              </div>

              {/* Two-Column Lower Layout matching screenshot */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left (62%): Latest Grievances Table */}
                <div className="lg:col-span-8 rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 bg-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <h4 className="text-xs font-bold text-slate-900">
                        {isSessionAdmin ? "Latest Citizen Grievances" : "My Active Grievances"}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("all-complaints")}
                      className="text-xs font-medium text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <span>View All Grievances</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-4 py-2.5">Reference ID</th>
                          <th className="px-4 py-2.5">Citizen</th>
                          <th className="px-4 py-2.5">Category / Issue</th>
                          <th className="px-4 py-2.5">Lodged On</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {complaints.slice(0, 5).map((c) => (
                          <tr
                            key={c.referenceNumber}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono font-bold text-blue-700 text-[11px]">
                              {c.referenceNumber}
                            </td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              {c.citizenName}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              <span className="font-medium text-slate-800 block line-clamp-1">
                                {c.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {c.department}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                  c.status === "RESOLVED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : c.status === "IN_PROGRESS"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  c.status === "RESOLVED"
                                    ? "bg-emerald-500"
                                    : c.status === "IN_PROGRESS"
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                                }`} />
                                {c.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRef(c.referenceNumber);
                                  setActiveTab("tracker");
                                }}
                                className="text-[11px] font-semibold text-blue-700 hover:underline"
                              >
                                Track &rarr;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right (38%): Three-Owner Activity Log or Citizen SLA Guide */}
                <div className="lg:col-span-4 rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5 bg-white">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-slate-500" />
                      <h4 className="text-xs font-bold text-slate-900">
                        {isSessionAdmin ? "Three-Owner Activity Log" : "Recent Redressal Updates"}
                      </h4>
                    </div>
                    {isSessionAdmin && (
                      <button
                        type="button"
                        onClick={() => setActiveTab("activity-log")}
                        className="text-xs font-medium text-slate-600 hover:underline rounded border border-slate-200 px-2 py-0.5 bg-slate-50"
                      >
                        Full Audit Trail
                      </button>
                    )}
                  </div>

                  <div className="p-4 space-y-3.5">
                    {activityLogs.slice(0, 4).map((log) => (
                      <div
                        key={log.id}
                        className="rounded-md border border-slate-100 bg-slate-50/60 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-bold text-slate-800 text-xs">
                            {log.action}
                          </span>
                          <span className="font-mono">{log.timestamp}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                          {log.details}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/60">
                          <span className="font-semibold text-amber-700">
                            By: {log.actor}
                          </span>
                          {log.referenceNumber && (
                            <span className="font-mono text-slate-500">
                              {log.referenceNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: ALL COMPLAINTS / FULL INVENTORY TABLE               */}
          {/* ======================================================== */}
          {activeTab === "all-complaints" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {isSessionAdmin
                        ? "All Municipal Grievances Registry"
                        : "My Grievances Registry"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Master registry of citizen complaints, SLA deadlines, and resolution records.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-800 shadow-xs"
                  >
                    <FilePlus className="h-4 w-4" />
                    Lodge New Grievance
                  </button>
                </div>

                {/* Filter and search bar */}
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Filter by Ref ID, citizen name, issue..."
                      className="w-full rounded border border-slate-300 px-2.5 py-1 text-xs focus:outline-none focus:border-blue-700"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    {["ALL", "SUBMITTED", "IN_PROGRESS", "RESOLVED"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setFilterStatus(st)}
                        className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          filterStatus === st
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Table */}
              <div className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-2.5">Reference ID</th>
                        <th className="px-4 py-2.5">Citizen</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5">Title & Location</th>
                        <th className="px-4 py-2.5">Priority</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredComplaints.map((c) => (
                        <tr
                          key={c.referenceNumber}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono font-bold text-blue-700">
                            {c.referenceNumber}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {c.citizenName}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {c.category}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            <span className="font-medium text-slate-900 block line-clamp-1">
                              {c.title}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {c.location}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-semibold border ${
                                c.priority === "CRITICAL"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {c.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                                c.status === "RESOLVED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : c.status === "IN_PROGRESS"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {c.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRef(c.referenceNumber);
                                setActiveTab("tracker");
                              }}
                              className="text-xs font-semibold text-blue-700 hover:underline"
                            >
                              Inspect &rarr;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: TRACKER CONSOLE                                     */}
          {/* ======================================================== */}
          {activeTab === "tracker" && (
            <div className="space-y-4">
              <ComplaintTracker
                complaints={complaints}
                selectedRef={selectedRef}
                onSelectRef={(ref) => setSelectedRef(ref)}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: DEPARTMENTS & SLA DIRECTORY                         */}
          {/* ======================================================== */}
          {activeTab === "departments" && (
            <div className="space-y-4">
              <DepartmentsSection
                onSelectCategory={() => {
                  setIsFormOpen(true);
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: PUBLIC TRANSPARENCY & ANALYTICS                     */}
          {/* ======================================================== */}
          {activeTab === "analytics" && (
            <div className="space-y-4">
              <AnalyticsSection />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: AUDIT ACTIVITY LOG FULL LIST                        */}
          {/* ======================================================== */}
          {activeTab === "activity-log" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      System Administrative Audit Trail
                    </h2>
                    <p className="text-xs text-slate-500">
                      Immutable record of officer dispatches, AI triage decisions, and citizen submissions.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    Audit Level: Level-3 Compliance
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-md border border-slate-200 bg-slate-50/70 p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {log.action}
                          </span>
                          <span className="text-[10px] text-amber-700 font-semibold rounded bg-amber-100 px-1.5 py-0.2">
                            {log.actor}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600 text-[11px]">
                          {log.details}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono text-slate-500">
                        {log.referenceNumber && (
                          <span className="text-blue-700 font-semibold">
                            {log.referenceNumber}
                          </span>
                        )}
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Citizen Complaint Filing Modal */}
      <ComplaintFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onComplaintSubmitted={handleComplaintSubmitted}
      />

      {/* Municipal Officer Workbench Modal */}
      <OfficerWorkbenchModal
        isOpen={isOfficerOpen}
        onClose={() => setIsOfficerOpen(false)}
        complaints={complaints}
        onUpdateComplaint={handleUpdateComplaint}
      />
    </div>
  );
}
