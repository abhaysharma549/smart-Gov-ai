"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  Building2,
  User,
  Sparkles,
  Star,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { TrackedComplaint } from "@/lib/mock-data";

interface ComplaintTrackerProps {
  complaints: TrackedComplaint[];
  selectedRef?: string;
  onSelectRef?: (ref: string) => void;
}

export default function ComplaintTracker({
  complaints,
  selectedRef,
  onSelectRef,
}: ComplaintTrackerProps) {
  const [searchInput, setSearchInput] = useState(selectedRef || "SG-20261031-WTR44");
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeComplaint =
    complaints.find(
      (c) =>
        c.referenceNumber.toLowerCase() ===
        (selectedRef || searchInput).trim().toLowerCase()
    ) || complaints[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSelectRef) {
      onSelectRef(searchInput.trim());
    }
  };

  const copyRefNumber = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Resolved & Verified
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
            <Clock className="h-3.5 w-3.5" /> Repair In Progress
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-medium text-blue-700">
            <User className="h-3.5 w-3.5" /> Assigned to Ward Engineer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
            <Sparkles className="h-3.5 w-3.5 text-blue-700" /> AI Review & Routing
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Search Header Banner */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
            <span>Official Tracking Console</span>
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Track Grievance Redressal Status
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your official Reference Number to check dispatch status, field officer assignment, and statutory SLA milestones.
          </p>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Reference ID (e.g. SG-20261031-WTR44)..."
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 font-mono text-xs uppercase text-slate-800 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-700 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-800 transition-colors"
          >
            Track Status <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Quick Reference Pills */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-700">Sample Grievances:</span>
          {complaints.map((c) => (
            <button
              key={c.referenceNumber}
              type="button"
              onClick={() => {
                setSearchInput(c.referenceNumber);
                if (onSelectRef) onSelectRef(c.referenceNumber);
              }}
              className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                c.referenceNumber === activeComplaint?.referenceNumber
                  ? "border-blue-700 bg-blue-50 text-blue-700 font-semibold"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.referenceNumber} ({c.status})
            </button>
          ))}
        </div>
      </div>

      {/* Main Complaint Detail View */}
      {activeComplaint ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left Column: Complaint Overview & Milestone Timeline (2 cols) */}
          <div className="space-y-5 lg:col-span-2">
            {/* Overview Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {activeComplaint.referenceNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyRefNumber(activeComplaint.referenceNumber)}
                      className="text-slate-400 hover:text-slate-700"
                      title="Copy Reference ID"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">
                    {activeComplaint.title}
                  </h3>
                </div>
                {getStatusBadge(activeComplaint.status)}
              </div>

              {/* Citizen Statement */}
              <div className="mt-3.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Citizen Grievance Description
                </span>
                <p className="mt-1 text-xs leading-relaxed text-slate-700">
                  {activeComplaint.description}
                </p>
              </div>

              {/* Resolution Record Banner */}
              {activeComplaint.status === "RESOLVED" &&
                activeComplaint.resolutionSummary && (
                  <div className="mt-3.5 rounded-md border border-emerald-200 bg-emerald-50/70 p-3">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Official Resolution & Quality Verification Record
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                      {activeComplaint.resolutionSummary}
                    </p>
                  </div>
                )}

              {/* Metadata Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-100 pt-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Category
                  </span>
                  <p className="font-medium text-slate-900">
                    {activeComplaint.category}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Priority Level
                  </span>
                  <p
                    className={`font-semibold ${
                      activeComplaint.priority === "CRITICAL"
                        ? "text-red-700"
                        : "text-amber-700"
                    }`}
                  >
                    {activeComplaint.priority}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Lodged On
                  </span>
                  <p className="font-medium text-slate-900">
                    {new Date(activeComplaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Target SLA Date
                  </span>
                  <p className="font-medium text-blue-700">
                    {new Date(activeComplaint.targetResolutionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Redressal Milestone Timeline */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-700" />
                Redressal Audit Trail & Milestones
              </h4>

              <div className="relative mt-5 pl-5 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
                {activeComplaint.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    {/* Bullet marker */}
                    <div className="absolute -left-5 top-1 h-3 w-3 rounded-full border-2 border-white bg-blue-700 ring-2 ring-blue-100" />
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900">
                          {step.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {new Date(step.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {step.description}
                      </p>
                      <span className="mt-0.5 inline-block text-[10px] font-medium text-slate-600">
                        Action By: {step.actor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Assigned Authority, AI Diagnostic, Feedback (1 col) */}
          <div className="space-y-5">
            {/* Handling Authority & Assigned Officer */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <Building2 className="h-3.5 w-3.5 text-blue-700" />
                Designated Municipal Department
              </div>
              <p className="mt-1 font-bold text-xs text-slate-900">
                {activeComplaint.department}
              </p>

              {activeComplaint.assignedOfficer ? (
                <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-700 text-white font-bold text-xs">
                      {activeComplaint.assignedOfficer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {activeComplaint.assignedOfficer.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {activeComplaint.assignedOfficer.designation}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2 text-[11px]">
                    <span className="font-mono text-slate-500 text-[10px]">
                      Badge: {activeComplaint.assignedOfficer.badgeId}
                    </span>
                    <a
                      href={`tel:${activeComplaint.assignedOfficer.phone}`}
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {activeComplaint.assignedOfficer.phone}
                    </a>
                  </div>
                </div>
              ) : (
                <p className="mt-2.5 text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                  Automated officer assignment in progress by zone dispatch desk.
                </p>
              )}
            </div>

            {/* SmartGov AI Diagnostic Audit */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                AI Triage Diagnostic Report
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Routing Accuracy:</span>
                  <span className="font-semibold text-slate-900">
                    {(activeComplaint.aiAudit.predictedCategoryConfidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Duplicate Risk:</span>
                  <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-medium text-emerald-700">
                    {activeComplaint.aiAudit.duplicateRisk}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Image Integrity:</span>
                  <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[9px] font-medium text-blue-700">
                    {activeComplaint.aiAudit.imageIntegrityStatus}
                  </span>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-600">
                  <strong className="text-slate-800">Action: </strong>
                  {activeComplaint.aiAudit.suggestedAction}
                </div>
              </div>
            </div>

            {/* Citizen Satisfaction Feedback */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
              <h5 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                Citizen Satisfaction Feedback
              </h5>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Your rating directly impacts departmental SLA compliance evaluations.
              </p>

              {feedbackSubmitted ? (
                <div className="mt-2.5 rounded-md bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-medium text-emerald-700">
                  Feedback recorded. Thank you for participating in civic oversight.
                </div>
              ) : (
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => {
                        setFeedbackRating(star);
                        setFeedbackSubmitted(true);
                      }}
                      className="p-1 text-slate-300 hover:text-amber-500 transition-colors"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          feedbackRating && feedbackRating >= star
                            ? "fill-amber-400 text-amber-500"
                            : "hover:fill-amber-100"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          No complaint record found matching the reference ID. Verify the number or select one of the demo samples above.
        </div>
      )}
    </div>
  );
}
