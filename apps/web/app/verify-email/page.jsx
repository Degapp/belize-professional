"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    async function verifyEmail() {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully! You can now log in.");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The link may be invalid or expired.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification. Please try again.");
      }
    }

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          <div className="text-center mb-6">
            {status === "verifying" && (
              <>
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <i className="ph-light ph-spinner text-4xl text-brand-600"></i>
                </div>
                <h1 className="text-2xl font-clash font-semibold text-slate-900 mb-2">
                  Verifying Your Email
                </h1>
                <p className="text-sm text-slate-500">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <i className="ph-light ph-check-circle text-4xl text-emerald-600"></i>
                </div>
                <h1 className="text-2xl font-clash font-semibold text-slate-900 mb-2">
                  Email Verified!
                </h1>
                <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4">
                  {message}
                </p>
                <p className="text-sm text-slate-500">
                  Redirecting you to login...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <i className="ph-light ph-x-circle text-4xl text-red-600"></i>
                </div>
                <h1 className="text-2xl font-clash font-semibold text-slate-900 mb-2">
                  Verification Failed
                </h1>
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                  {message}
                </p>
                <div className="space-y-3 mt-6">
                  <Link
                    href="/signup"
                    className="block w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 text-center"
                  >
                    Create New Account
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-xl transition-all text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
