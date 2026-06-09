"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setResetLink("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Password reset link has been sent to your email.");
        // In development, show the reset link
        if (data.resetUrl) {
          setResetLink(data.resetUrl);
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to send reset link. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mx-auto mb-4">
              <i className="ph-light ph-lock-key text-2xl font-bold"></i>
            </div>
            <h1 className="text-2xl font-clash font-semibold text-slate-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-sm text-slate-500">
              Enter your email and we'll send you a link to reset your password
            </p>
          </div>

          {status === "success" ? (
            <div className="space-y-4">
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <i className="ph-light ph-check-circle text-xl mt-0.5"></i>
                  <div>
                    <p className="font-semibold mb-1">Email Sent!</p>
                    <p>{message}</p>
                  </div>
                </div>
              </div>

              {resetLink && (
                <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-700 mb-2">Development Mode - Reset Link:</p>
                  <a 
                    href={resetLink} 
                    className="text-brand-600 hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetLink}
                  </a>
                </div>
              )}

              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 text-center"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              {message && status === "error" && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-sm text-center text-slate-500">
                Remember your password?{" "}
                <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
