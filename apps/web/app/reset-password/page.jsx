"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      setStatus("error");
      setMessage("Invalid reset link. No token provided.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters long");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("Password has been reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to reset password. The link may be invalid or expired.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again later.");
    }
  };

  if (!token && status !== "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mx-auto mb-4">
              <i className="ph-light ph-lock-simple text-2xl font-bold"></i>
            </div>
            <h1 className="text-2xl font-clash font-semibold text-slate-900 mb-2">
              Reset Password
            </h1>
            <p className="text-sm text-slate-500">
              Enter your new password below
            </p>
          </div>

          {status === "success" ? (
            <div className="space-y-4">
              <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <i className="ph-light ph-check-circle text-xl mt-0.5"></i>
                  <div>
                    <p className="font-semibold mb-1">Success!</p>
                    <p>{message}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  disabled={!token || status === "error"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={!token || status === "error"}
                />
              </div>

              {message && status === "error" && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !token || status === "error"}
                className="w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Resetting..." : "Reset Password"}
              </button>

              <p className="text-sm text-center text-slate-500">
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
