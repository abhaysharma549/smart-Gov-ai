"use client";

import React, { useState } from "react";
import {
  X,
  FilePlus,
  CheckCircle2,
  Sparkles,
  MapPin,
  Camera,
  Building2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { MOCK_CATEGORIES, CategoryItem, TrackedComplaint } from "@/lib/mock-data";

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintSubmitted: (complaint: TrackedComplaint) => void;
}

export default function ComplaintFormModal({
  isOpen,
  onClose,
  onComplaintSubmitted,
}: ComplaintFormModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(
    MOCK_CATEGORIES[0]
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("28.6139");
  const [longitude, setLongitude] = useState("77.2090");
  const [citizenName, setCitizenName] = useState("");
  const [phone, setPhone] = useState("");
  const [hasPhoto, setHasPhoto] = useState(true);
  const [consent, setConsent] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdComplaint, setCreatedComplaint] = useState<TrackedComplaint | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          setAddress("Current GPS Location (Ward Auto-detected)");
        },
        () => {
          setLatitude("28.6139");
          setLongitude("77.2090");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !title.trim() || !description.trim() || !consent) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let randomCode = "";
      for (let i = 0; i < 5; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const refNumber = `SG-${dateStr}-${randomCode}`;

      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (selectedCategory?.slaDays || 3));

      const isHighUrgency =
        title.toLowerCase().includes("burst") ||
        title.toLowerCase().includes("fire") ||
        title.toLowerCase().includes("hazard") ||
        title.toLowerCase().includes("danger") ||
        title.toLowerCase().includes("cave-in");

      const newComplaint: TrackedComplaint = {
        referenceNumber: refNumber,
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory.name,
        department: selectedCategory.departmentName,
        status: "SUBMITTED",
        priority: isHighUrgency ? "CRITICAL" : "HIGH",
        citizenName: citizenName.trim() || "Anonymous Citizen",
        location: address || "Urban District Central Ward",
        latitude: parseFloat(latitude) || 28.6139,
        longitude: parseFloat(longitude) || 77.209,
        createdAt: new Date().toISOString(),
        targetResolutionDate: deadline.toISOString(),
        timeline: [
          {
            status: "SUBMITTED",
            title: "Grievance Lodged via Web Portal",
            description: "Grievance officially recorded with reference number and citizen affirmation.",
            timestamp: new Date().toISOString(),
            actor: citizenName || "Citizen",
          },
          {
            status: "UNDER_REVIEW",
            title: "Autonomous AI Triage Completed",
            description: `Auto-routed to ${selectedCategory.departmentName}. SLA target fixed at ${selectedCategory.slaDays} business days.`,
            timestamp: new Date(Date.now() + 1500).toISOString(),
            actor: "SmartGov AI Core",
          },
        ],
        aiAudit: {
          predictedCategoryConfidence: 0.988,
          duplicateRisk: "NONE",
          sentimentUrgency: isHighUrgency ? "CRITICAL" : "HIGH",
          imageIntegrityStatus: hasPhoto ? "VERIFIED" : "NOT_APPLICABLE",
          suggestedAction: `Assigned to ${selectedCategory.departmentName} emergency response queue.`,
        },
      };

      setCreatedComplaint(newComplaint);
      onComplaintSubmitted(newComplaint);
      setIsSubmitting(false);
      setStep(4);
    }, 1000);
  };

  const copyRefNumber = () => {
    if (createdComplaint) {
      navigator.clipboard.writeText(createdComplaint.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setCitizenName("");
    setPhone("");
    setCreatedComplaint(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      <div className="relative w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700">
              <FilePlus className="h-4 w-4" />
            </div>
            <div>
              <h2 id="modal-headline" className="text-sm font-bold text-slate-900">
                Lodge Civic Grievance
              </h2>
              <p className="text-[11px] text-slate-500">
                Official Form GR-01 • Municipal Grievance Redressal Mechanism
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Step Indicator */}
        {step < 4 && (
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className={`flex items-center gap-1.5 ${step === 1 ? "font-semibold text-blue-700" : step > 1 ? "text-emerald-700" : ""}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${step === 1 ? "bg-blue-700 text-white" : step > 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                  1
                </span>
                Department Category
              </span>
              <span className="text-slate-300">/</span>
              <span className={`flex items-center gap-1.5 ${step === 2 ? "font-semibold text-blue-700" : step > 2 ? "text-emerald-700" : ""}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${step === 2 ? "bg-blue-700 text-white" : step > 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                  2
                </span>
                Grievance Details
              </span>
              <span className="text-slate-300">/</span>
              <span className={`flex items-center gap-1.5 ${step === 3 ? "font-semibold text-blue-700" : ""}`}>
                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${step === 3 ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-600"}`}>
                  3
                </span>
                Location & Evidence
              </span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-5">
          {/* STEP 1: CATEGORY */}
          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Select Relevant Municipal Department
                </h3>
                <p className="text-[11px] text-slate-500">
                  Choose the category that matches the nature of your civic complaint.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {MOCK_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`cursor-pointer rounded-md border p-3 transition-colors ${
                        isSelected
                          ? "border-blue-700 bg-blue-50/40 ring-1 ring-blue-700"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedCategory(cat)}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-xs text-slate-900">
                          {cat.name}
                        </span>
                        <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.2 font-mono text-[9px] font-bold text-slate-700">
                          SLA: {cat.slaDays}d
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                        {cat.description}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-700 font-medium">
                        <Building2 className="h-3 w-3 text-blue-700" />
                        <span>{cat.departmentName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-800"
                >
                  Proceed to Details <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Grievance Title / Summary <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hazardous deep pothole on Main Avenue near Metro Gate 3"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-800">
                    Detailed Description <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {description.length} / 5000 chars
                  </span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details: duration of issue, landmark, risk to traffic or pedestrians, and affected households..."
                  className="mt-1 w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800">
                    Complainant Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800">
                    Contact Mobile Number (For SMS Tracking)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Category
                </button>
                <button
                  type="button"
                  disabled={!title.trim() || !description.trim()}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-800 disabled:opacity-50"
                >
                  Next: Location & Evidence <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION & EVIDENCE */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-800">
                    Incident Address / Physical Landmark <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseLocation}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 hover:underline"
                  >
                    <MapPin className="h-3 w-3" /> Auto-Detect via GPS
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Opposite Community Center Gate 2, Ring Road Block C"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
                />
              </div>

              {/* Coordinates Preview */}
              <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-blue-700" />
                  <span>Lat: {latitude}</span>
                  <span>|</span>
                  <span>Lng: {longitude}</span>
                </div>
                <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-700">
                  GPS Tagged
                </span>
              </div>

              {/* Photographic Evidence Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Photographic Evidence Attachment
                </label>
                <div
                  onClick={() => setHasPhoto(!hasPhoto)}
                  className="mt-1 cursor-pointer rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-center hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1">
                    <Camera className="h-4 w-4 text-blue-700" />
                    <p className="text-xs font-medium text-slate-800">
                      {hasPhoto
                        ? "Photo attached: Evidence_Field_GPS_2026.jpg (1.8 MB)"
                        : "Click to attach photo evidence from camera or files"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      JPG, PNG, PDF up to 10MB • AI scans image for metadata and geo-tampering
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Auto-Routing Diagnostic */}
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Sparkles className="h-3.5 w-3.5 text-blue-700" />
                  Autonomous AI Pre-Screening & Routing Rule
                </div>
                <div className="mt-1.5 space-y-1 text-slate-600 text-[11px]">
                  <p>
                    • Department Target: <strong className="text-slate-900">{selectedCategory?.departmentName}</strong>
                  </p>
                  <p>
                    • SLA Commitment: <strong className="text-slate-900">{selectedCategory?.slaDays} Business Days</strong> (Statutory)
                  </p>
                  <p>
                    • Spatial Duplicate Check: <strong className="text-emerald-700">0 duplicate tickets</strong> in 500m radius
                  </p>
                </div>
              </div>

              {/* Statutory Citizen Declaration */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                />
                <label htmlFor="consent" className="text-[11px] leading-relaxed text-slate-600">
                  I declare that the details provided are correct and pertain to a genuine civic matter under municipal jurisdiction.
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !consent}
                  className="inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-800 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Dispatching to Department...
                    </>
                  ) : (
                    <>
                      Submit Official Grievance <CheckCircle2 className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS ACKNOWLEDGMENT */}
          {step === 4 && createdComplaint && (
            <div className="space-y-3.5 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Grievance Registered Successfully
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  An official ticket has been registered in the municipal grievance redressal system.
                </p>
              </div>

              {/* Reference ID Card */}
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Complaint Reference Number
                </span>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="font-mono text-base font-bold text-slate-900">
                    {createdComplaint.referenceNumber}
                  </span>
                  <button
                    type="button"
                    onClick={copyRefNumber}
                    className="rounded p-1 text-blue-700 hover:bg-blue-50"
                    title="Copy Reference ID"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Retain this number for online tracking and official inquiries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-left text-xs">
                <div className="rounded-md border border-slate-200 p-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    Assigned Authority
                  </span>
                  <p className="mt-0.5 font-medium text-slate-900">
                    {createdComplaint.department}
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 p-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    Target Resolution
                  </span>
                  <p className="mt-0.5 font-medium text-emerald-700">
                    Within {selectedCategory?.slaDays || 3} Business Days
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="w-full rounded-md bg-slate-900 py-2 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Done & Return to Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
