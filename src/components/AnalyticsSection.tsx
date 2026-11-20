"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Building2,
  ArrowUpRight,
} from "lucide-react";

export default function AnalyticsSection() {
  const stats = [
    {
      title: "Total Civic Grievances",
      value: "14,892",
      change: "+12.4% vs previous cycle",
      icon: TrendingUp,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      title: "Resolution Success Rate",
      value: "95.6%",
      change: "Within statutory deadline",
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      title: "Average Resolution Turnaround",
      value: "1.8 Days",
      change: "Charter ceiling: 3.0 days",
      icon: Clock,
      color: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      title: "AI Routing Accuracy",
      value: "99.1%",
      change: "Zero administrative misroutes",
      icon: Sparkles,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
    },
  ];

  const departmentPerformance = [
    {
      name: "Municipal Water Supply & Sanitation Board",
      resolved: 3840,
      pending: 42,
      slaAdherence: 98,
      leadTime: "1.2 days",
    },
    {
      name: "Public Works Department (PWD - Civil Infrastructure)",
      resolved: 4210,
      pending: 120,
      slaAdherence: 94,
      leadTime: "2.4 days",
    },
    {
      name: "City Sanitation & Solid Waste Authority",
      resolved: 5120,
      pending: 18,
      slaAdherence: 99,
      leadTime: "0.8 days",
    },
    {
      name: "Electricity Distribution & Lighting Corporation",
      resolved: 1720,
      pending: 12,
      slaAdherence: 97,
      leadTime: "0.9 days",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Top Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            <span>Public Open Data Framework</span>
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Municipal Redressal Transparency & Performance Metrics
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            All municipal grievance statistics are published in real-time under the Public Accountability Charter to ensure complete visibility into turnaround times and service delivery standards.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {s.title}
                </span>
                <div className={`rounded p-1.5 ${s.bg} ${s.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                {s.value}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <ArrowUpRight className="h-3 w-3" />
                {s.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Department SLA Scorecard */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-blue-700" />
              Departmental Statutory SLA Compliance Scorecard
            </h3>
            <p className="text-[11px] text-slate-500">
              Continuous monitoring against municipal charter resolution benchmarks
            </p>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            Audit Synchronization: Real-Time
          </span>
        </div>

        <div className="mt-4 space-y-4">
          {departmentPerformance.map((dept, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">
                  {dept.name}
                </span>
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span>
                    Resolved: <strong className="text-slate-800">{dept.resolved}</strong>
                  </span>
                  <span>
                    Active: <strong className="text-amber-700">{dept.pending}</strong>
                  </span>
                  <span>
                    Avg. Turnaround: <strong className="text-slate-800">{dept.leadTime}</strong>
                  </span>
                  <span className="font-semibold text-emerald-700">
                    {dept.slaAdherence}% SLA
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-700 transition-all duration-300"
                  style={{ width: `${dept.slaAdherence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
