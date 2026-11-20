"use client";

import React, { useState } from "react";
import {
  X,
  Users,
  CheckCircle2,
  Filter,
  BadgeCheck,
} from "lucide-react";
import { TrackedComplaint } from "@/lib/mock-data";

interface OfficerWorkbenchModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaints: TrackedComplaint[];
  onUpdateComplaint: (updated: TrackedComplaint) => void;
}

export default function OfficerWorkbenchModal({
  isOpen,
  onClose,
  complaints,
  onUpdateComplaint,
}: OfficerWorkbenchModalProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<TrackedComplaint>(
    complaints[0]
  );
  const [filterDepartment, setFilterDepartment] = useState<string>("ALL");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const filteredComplaints = complaints.filter((c) => {
    if (filterDepartment === "ALL") return true;
    return c.department.toLowerCase().includes(filterDepartment.toLowerCase());
  });

  const handleStatusChange = (newStatus: "ASSIGNED" | "IN_PROGRESS" | "RESOLVED") => {
    setIsUpdating(true);
    setTimeout(() => {
      const updated: TrackedComplaint = {
        ...selectedComplaint,
        status: newStatus,
        resolutionSummary:
          newStatus === "RESOLVED"
            ? resolutionNote || "Field repair completed and verified by municipal ward engineer."
            : selectedComplaint.resolutionSummary,
        timeline: [
          ...selectedComplaint.timeline,
          {
            status: newStatus,
            title:
              newStatus === "RESOLVED"
                ? "Grievance Resolved & Quality Signed-Off"
                : newStatus === "IN_PROGRESS"
                ? "Field Maintenance Crew Dispatched"
                : "Assigned to Ward Engineer",
            description:
              newStatus === "RESOLVED"
                ? resolutionNote || "On-site repair completed with photo verification."
                : `Status updated by Field Operations Officer.`,
            timestamp: new Date().toISOString(),
            actor: "Officer S. K. Verma (Zone 4 Lead)",
          },
        ],
      };

      onUpdateComplaint(updated);
      setSelectedComplaint(updated);
      setIsUpdating(false);
      setResolutionNote("");
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="officer-desk-title"
    >
      <div className="relative flex h-[85vh] w-full max-w-5xl flex-col rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-900 px-5 py-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-700 text-white">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="officer-desk-title" className="text-xs font-bold tracking-tight">
                  Municipal Field Operations Dispatch Desk
                </h3>
                <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[9px] font-semibold text-slate-300">
                  Officer: S. K. Verma (Zone 4 Lead)
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Departmental Triage, Field Crew Allocation & Resolution Sign-Off
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close officer workbench"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Split View */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Queue List */}
          <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/70">
            {/* Filter Pills */}
            <div className="p-3 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
                <Filter className="h-3 w-3" /> Filter by Department:
              </div>
              <div className="flex flex-wrap gap-1">
                {["ALL", "Water", "Roads", "Sanitation"].map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setFilterDepartment(dept)}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      filterDepartment === dept
                        ? "bg-blue-700 text-white"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {filteredComplaints.map((c) => {
                const isSelected = c.referenceNumber === selectedComplaint?.referenceNumber;
                return (
                  <div
                    key={c.referenceNumber}
                    onClick={() => setSelectedComplaint(c)}
                    className={`cursor-pointer p-3 transition-colors ${
                      isSelected
                        ? "bg-blue-50/60 border-l-4 border-l-blue-700"
                        : "hover:bg-slate-100/60 bg-white"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedComplaint(c)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-blue-700">
                        {c.referenceNumber}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-medium border ${
                          c.priority === "CRITICAL"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {c.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-900 line-clamp-1">
                      {c.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{c.category}</span>
                      <span className="font-medium text-slate-700">
                        {c.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Ticket Detail & Actions */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white">
            {selectedComplaint ? (
              <>
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {selectedComplaint.referenceNumber} • {selectedComplaint.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                      {selectedComplaint.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Reported by: <strong className="text-slate-800">{selectedComplaint.citizenName}</strong> • {selectedComplaint.location}
                    </p>
                  </div>
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700">
                    {selectedComplaint.status.replace("_", " ")}
                  </span>
                </div>

                {/* Citizen Statement */}
                <div className="rounded-md border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-800">
                  <span className="font-semibold uppercase tracking-wider text-slate-400 text-[10px] block mb-1">
                    Citizen Complaint Statement:
                  </span>
                  {selectedComplaint.description}
                </div>

                {/* AI Diagnostics Box */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-md border border-slate-200 p-2.5 text-xs bg-white">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      AI Category Match
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {(selectedComplaint.aiAudit.predictedCategoryConfidence * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-2.5 text-xs bg-white">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Duplicate Scan
                    </span>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      {selectedComplaint.aiAudit.duplicateRisk}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 p-2.5 text-xs bg-white">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      Evidence Photo
                    </span>
                    <p className="text-xs font-bold text-blue-700 mt-0.5">
                      {selectedComplaint.aiAudit.imageIntegrityStatus}
                    </p>
                  </div>
                </div>

                {/* Officer Field Actions */}
                <div className="rounded-md border border-slate-200 bg-white p-3.5 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-blue-700" />
                    Field Operations Workflow Actions
                  </h4>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isUpdating || selectedComplaint.status === "ASSIGNED"}
                      onClick={() => handleStatusChange("ASSIGNED")}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Assign Field Crew
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating || selectedComplaint.status === "IN_PROGRESS"}
                      onClick={() => handleStatusChange("IN_PROGRESS")}
                      className="rounded-md bg-blue-700 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-800 disabled:opacity-50"
                    >
                      Dispatch Crew (In Progress)
                    </button>
                  </div>

                  {/* Resolution Input */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-800">
                      Resolution Summary & Supervisory Sign-Off Notes
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      placeholder="Specify work done, parts replaced, and supervisory sign-off remarks..."
                      className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        disabled={isUpdating || selectedComplaint.status === "RESOLVED"}
                        onClick={() => handleStatusChange("RESOLVED")}
                        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sign-Off & Mark Resolved
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Select a complaint from the left queue to view details and execute field actions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
