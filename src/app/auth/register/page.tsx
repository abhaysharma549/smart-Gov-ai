"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Info,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    registrationNumber: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrorMessage("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Client-side validations
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your Full Name.");
      return;
    }
    if (!formData.registrationNumber.trim()) {
      setErrorMessage("Please enter your University Registration Number.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccessMessage(
        "Account created successfully with Citizen/Student role! Redirecting to login..."
      );

      // Auto redirect to login with prefilled registration number
      setTimeout(() => {
        router.push("/auth/login?registered=true");
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      setErrorMessage("Unable to connect to server. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between font-sans antialiased text-slate-800">
      {/* Official Civic Top Strip */}
      <div className="bg-[#0D1929] px-4 py-2 text-xs text-white border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-semibold tracking-wide text-slate-200">
              SMARTGOV AI • CITIZEN & STUDENT REGISTRATION PORTAL
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">
              Department of Urban Governance & Grievance Redressal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              ROLE: VERIFIED CITIZEN
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          {/* Card Wrapper */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header Lockup */}
            <div className="bg-[#0D1929] px-6 py-5 text-white text-center border-b border-slate-800">
              <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                CREATE CITIZEN ACCOUNT
              </h1>
              <p className="mt-1 text-xs text-slate-300">
                Register with your University Registration Number & verified credentials
              </p>
            </div>

            {/* Role Notice Alert */}
            <div className="bg-amber-50 border-b border-amber-200/80 px-6 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Standard User Access:</strong> Every new registration is assigned the role <span className="font-mono font-bold bg-amber-200/70 px-1 py-0.2 rounded text-amber-950">CITIZEN</span>. Administrative roles (Admin 1, 2, 3) are strictly managed via system architecture.
              </p>
            </div>

            {/* Form Section */}
            <div className="p-6 sm:p-7 space-y-4">
              {/* Error Alert */}
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Registration Error</span>
                    <span className="text-[11px] text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* Success Alert */}
              {successMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Account Created!</span>
                    <span className="text-[11px] text-emerald-700">{successMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* 2-column grid for name and reg number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Aarav Mehta"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* University Registration Number */}
                  <div>
                    <label
                      htmlFor="registrationNumber"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Registration Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <GraduationCap className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        required
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        placeholder="e.g. 22BCS10045"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-column grid for email and mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Email Address */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="e.g. student@university.edu"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 9812345678"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-8 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-column grid for password and confirm password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="At least 6 chars"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-8 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-8 pr-9 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60 transition-colors shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Link to Login */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Already registered?{" "}
                  <Link
                    href="/auth/login"
                    className="font-bold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    Sign In to Portal
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 text-center text-[11px] text-slate-500">
            <p>
              Protected by statutory civic privacy policies • Duplicate checks strictly enforced
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

