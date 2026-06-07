'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setSuccess(true);
      if (data.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mx-auto mb-6">
              <i className="ph-light ph-squares-four text-3xl font-bold"></i>
            </div>
            <h1 className="text-3xl font-clash font-bold text-slate-900 mb-3">Reset Password</h1>
            <p className="text-slate-500">Enter your email to receive a reset link</p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
                <div className="flex items-start gap-3">
                  <i className="ph-light ph-check-circle text-2xl flex-shrink-0 mt-0.5"></i>
                  <div>
                    <p className="font-semibold mb-1">Email sent!</p>
                    <p className="text-sm">Check your inbox for a password reset link. It may take a few minutes to arrive.</p>
                  </div>
                </div>
              </div>
              
              {devResetUrl && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
                  <p className="font-semibold mb-2 text-sm">Development Mode - Reset Link:</p>
                  <a 
                    href={devResetUrl} 
                    className="text-xs font-mono break-all hover:underline"
                  >
                    {devResetUrl}
                  </a>
                </div>
              )}
              
              <Link 
                href="/login"
                className="block text-center px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-xl transition-all"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i className="ph-light ph-envelope text-slate-400 text-lg"></i>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center pt-4">
                <Link 
                  href="/login"
                  className="text-sm text-slate-500 hover:text-brand-600 transition-colors inline-flex items-center gap-2"
                >
                  <i className="ph-light ph-arrow-left"></i>
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-600 hover:text-brand-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
