"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationLink, setVerificationLink] = useState("");

  const submit = async () => {
    setError(null);
    setSuccess(false);
    setVerificationLink("");
    setLoading(true);
    try {
      const result = await signUp(email, password, name);
      
      // Send verification email
      if (result?.data?.user) {
        const verifyResponse = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: result.data.user.id,
            email: result.data.user.email,
          }),
        });
        
        const verifyData = await verifyResponse.json();
        
        if (verifyResponse.ok) {
          setSuccess(true);
          if (verifyData.verificationUrl) {
            setVerificationLink(verifyData.verificationUrl);
          }
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mx-auto mb-4">
              <i className="ph-light ph-squares-four text-2xl font-bold"></i>
            </div>
            <h1 className="text-2xl font-clash font-semibold text-slate-900 mb-2">Create Account</h1>
            <p className="text-sm text-slate-500">Join Belize Professional today</p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <i className="ph-light ph-check-circle text-4xl text-emerald-600"></i>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Account Created!</h2>
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-4">
                  We've sent a verification email to <strong>{email}</strong>. Please click the link in the email to verify your account within 24 hours.
                </p>
              </div>

              {verificationLink && (
                <div className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-700 mb-2">Development Mode - Verification Link:</p>
                  <a 
                    href={verificationLink} 
                    className="text-brand-600 hover:underline break-all"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {verificationLink}
                  </a>
                </div>
              )}

              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 text-center"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="Jane Doe"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
