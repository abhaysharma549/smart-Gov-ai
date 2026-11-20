"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Info,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotInput, setForgotInput] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim()) {
      setErrorMessage("Please enter your Email or University Registration Number.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier: identifier.trim(),
        password,
      });

      if (!res || res.error) {
        setErrorMessage("Invalid credentials. Please verify your Email/Registration Number and password.");
        setIsLoading(false);
        return;
      }

      // Successful sign in: redirect to dashboard
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error("Login submission error:", err);
      setErrorMessage("Unable to connect to authentication server. Please try again.");
      setIsLoading(false);
    }
  };

  // Quick helper to populate demo credentials for testing & presentation
  const populateAccount = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between font-sans antialiased text-slate-800">
      {/* Official Civic Top Strip */}
      <div className="bg-[#0D1929] px-4 py-2 text-xs text-white border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[11px] sm:text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span className="font-semibold tracking-wide text-slate-200">
              SMARTGOV AI • SECURE CENTRAL AUTHENTICATION GATEWAY
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline text-slate-400">
              Role-Based Access Control (3-Admin Authorized Architecture)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              SYSTEM LEVEL-3
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Header Lockup */}
            <div className="bg-[#0D1929] px-6 py-6 text-white text-center border-b border-slate-800">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                SMARTGOV AI PORTAL
              </h1>
              <p className="mt-1 text-xs text-slate-300">
                Sign in with your University Registration Number or Official Email
              </p>
            </div>

            {/* Form Section */}
            <div className="p-6 sm:p-7 space-y-5">
              {/* Error Alert */}
              {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Authentication Failed</span>
                    <span className="text-[11px] text-red-700">{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Email / Registration Number Input */}
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Email / Registration Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. ADM-001 or 22BCS10045"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors font-medium"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Admins: enter Admin ID (e.g. ADM-001) or email. Students: enter Registration No.
                  </p>
                </div>

                {/* Password Input with Show/Hide */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(true)}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-9 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition-colors font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-slate-600">
                      Remember this workstation
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-60 transition-colors shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Link to Signup */}
              <div className="pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  New resident, student, or citizen?{" "}
                  <Link
                    href="/auth/register"
                    className="font-bold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    Create Account
                  </Link>
                </p>
              </div>

              {/* ======================================================== */}
              {/* Quick Demo Selector for Teacher Evaluation & Presentation */}
              {/* ======================================================== */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[11px] mb-2 uppercase tracking-wide">
                  <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                  <span>Quick Demo Credential Selector</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2.5">
                  Click any account below to instantly auto-fill credentials:
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => populateAccount("ADM-001", "Admin@123")}
                    className="text-left rounded border border-amber-300/80 bg-amber-50/70 p-2 hover:bg-amber-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">Admin 1</span>
                      <span className="font-mono text-[9px] bg-amber-200/80 text-amber-900 px-1 rounded">ADM-001</span>
                    </div>
                    <span className="text-slate-600 block truncate">Abhay Sharma</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => populateAccount("ADM-002", "Admin@123")}
                    className="text-left rounded border border-amber-300/80 bg-amber-50/70 p-2 hover:bg-amber-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">Admin 2</span>
                      <span className="font-mono text-[9px] bg-amber-200/80 text-amber-900 px-1 rounded">ADM-002</span>
                    </div>
                    <span className="text-slate-600 block truncate">Vatsal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => populateAccount("ADM-003", "Admin@123")}
                    className="text-left rounded border border-amber-300/80 bg-amber-50/70 p-2 hover:bg-amber-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900">Admin 3</span>
                      <span className="font-mono text-[9px] bg-amber-200/80 text-amber-900 px-1 rounded">ADM-003</span>
                    </div>
                    <span className="text-slate-600 block truncate">Sehaj</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => populateAccount("22BCS10045", "User@123")}
                    className="text-left rounded border border-blue-200 bg-blue-50/60 p-2 hover:bg-blue-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900">Student / User</span>
                      <span className="font-mono text-[9px] bg-blue-200/70 text-blue-900 px-1 rounded">User</span>
                    </div>
                    <span className="text-slate-600 block truncate">Aarav Mehta</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* System Footer Note */}
          <div className="mt-4 text-center text-[11px] text-slate-500">
            <p>
              SmartGov AI Civic & Campus Portal • Secured with 256-Bit TLS & bcrypt encryption
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <span>Password Recovery Assistance</span>
            </div>

            {forgotSubmitted ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Recovery instructions dispatched!</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If <strong className="text-slate-800">{forgotInput}</strong> is registered, password reset instructions have been forwarded to your registered contact channel.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSubmitted(false);
                    setForgotInput("");
                  }}
                  className="w-full mt-2 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your University Registration Number or Email Address. System administrators will generate a verified recovery token.
                </p>
                <div>
                  <input
                    type="text"
                    value={forgotInput}
                    onChange={(e) => setForgotInput(e.target.value)}
                    placeholder="Enter Registration No. or Email"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 rounded-lg border border-slate-300 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (forgotInput.trim()) setForgotSubmitted(true);
                    }}
                    disabled={!forgotInput.trim()}
                    className="flex-1 rounded-lg bg-blue-700 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

