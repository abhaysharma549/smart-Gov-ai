"use client";

import React from "react";
import {
  Building2,
  ArrowRight,
  Truck,
  Droplets,
  Zap,
  Trash2,
  ShieldAlert,
  Trees,
} from "lucide-react";
import { MOCK_CATEGORIES } from "@/lib/mock-data";

interface DepartmentsSectionProps {
  onSelectCategory: (categoryId: string) => void;
}

export default function DepartmentsSection({
  onSelectCategory,
}: DepartmentsSectionProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Truck":
        return <Truck className="h-4 w-4 text-blue-700" />;
      case "Droplets":
        return <Droplets className="h-4 w-4 text-blue-700" />;
      case "Zap":
        return <Zap className="h-4 w-4 text-amber-600" />;
      case "Trash2":
        return <Trash2 className="h-4 w-4 text-emerald-600" />;
      case "ShieldAlert":
        return <ShieldAlert className="h-4 w-4 text-red-600" />;
      default:
        return <Trees className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            <span>Statutory Service Commitments</span>
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Departments & Service Level Agreements (SLAs)
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Under the Municipal Public Service Guarantee Act, every grievance category is bound by a maximum resolution timeframe. Breaches trigger automated escalation to the Commissioner.
          </p>
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-2xs transition-colors hover:border-slate-300"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 border border-slate-200">
                  {getIcon(cat.icon)}
                </div>
                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                  Statutory SLA: {cat.slaDays} Days
                </span>
              </div>

              <h3 className="mt-2.5 text-xs font-bold text-slate-900">
                {cat.name}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
                {cat.description}
              </p>

              <div className="mt-3 rounded-md border border-slate-100 bg-slate-50 p-2 text-xs text-slate-700">
                <p className="flex items-center gap-1 font-semibold text-[11px] text-slate-900">
                  <Building2 className="h-3 w-3 text-blue-700" />
                  {cat.departmentName}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Dispatched via GIS ward-boundary spatial polygons
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-700 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-800 transition-colors"
              >
                File Grievance in this Category <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
