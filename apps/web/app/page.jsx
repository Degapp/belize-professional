'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');
    const [signupRole, setSignupRole] = useState('');
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');

    useEffect(() => {
        // Check if user is already logged in
        const userSession = localStorage.getItem('user_session');
        if (userSession) {
            window.location.href = '/dashboard';
            return;
        }

        async function fetchData() {
            try {
                const res = await fetch('/api/professionals');
                if (res.ok) {
                    const data = await res.json();
                    setProfessionals(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        const checkHash = () => {
            const hash = window.location.hash;
            if (hash === '#login') {
                setShowLoginModal(true);
                setShowSignupModal(false);
                setShowDemoModal(false);
            } else if (hash === '#signup') {
                setShowSignupModal(true);
                setShowLoginModal(false);
                setShowDemoModal(false);
            } else if (hash === '#interactive-preview') {
                setShowDemoModal(true);
                setShowLoginModal(false);
                setShowSignupModal(false);
            }
        };
        
        // Check on mount
        checkHash();
        
        // Listen for hash changes
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword })
            });
            const data = await res.json();
            if (res.ok) {
                // Store user session
                localStorage.setItem('user_session', JSON.stringify(data.user));
                setAuthSuccess('Login successful! Redirecting to dashboard...');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                setAuthError(data.error || 'Login failed');
            }
        } catch (error) {
            setAuthError('Network error. Please try again.');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');
        
        // Validate password confirmation
        if (signupPassword !== signupPasswordConfirm) {
            setAuthError('Passwords do not match');
            return;
        }
        
        // Validate profession selection
        if (!signupRole) {
            setAuthError('Please select your profession');
            return;
        }
        
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    full_name: signupName, 
                    email: signupEmail, 
                    password: signupPassword,
                    role: signupRole
                })
            });
            const data = await res.json();
            if (res.ok) {
                setAuthSuccess('Account created! You can now log in.');
                setTimeout(() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                    window.location.hash = '#login';
                    // Clear form
                    setSignupName('');
                    setSignupEmail('');
                    setSignupPassword('');
                    setSignupPasswordConfirm('');
                    setSignupRole('');
                }, 1500);
            } else {
                setAuthError(data.error || 'Signup failed');
            }
        } catch (error) {
            setAuthError('Network error. Please try again.');
        }
    };

    const closeModal = () => {
        setShowLoginModal(false);
        setShowSignupModal(false);
        setShowDemoModal(false);
        window.location.hash = '';
        setAuthError('');
        setAuthSuccess('');
    };

    // Add Escape key listener
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        
        if (showLoginModal || showSignupModal || showDemoModal) {
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [showLoginModal, showSignupModal, showDemoModal]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
      <>
        {/* Demo Modal */}
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModal} className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors bg-white rounded-full p-2 shadow-md">
                <i className="ph-light ph-x text-2xl"></i>
              </button>
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mx-auto mb-6">
                    <i className="ph-light ph-play-circle text-4xl"></i>
                  </div>
                  <h2 className="text-3xl font-clash font-semibold text-slate-900 mb-3">Interactive Platform Demo</h2>
                  <p className="text-base text-slate-500 max-w-2xl mx-auto">Explore how Belize Professional streamlines your practice with intelligent scheduling, invoicing, and client management.</p>
                </div>

                {/* Demo Video Placeholder */}
                <div className="mb-8 rounded-xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center border border-slate-200">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white mx-auto shadow-lg hover:bg-brand-700 transition-all cursor-pointer">
                      <i className="ph-light ph-play-circle text-5xl"></i>
                    </div>
                    <p className="text-slate-600 font-medium">Watch Platform Demo Video</p>
                    <p className="text-sm text-slate-500">See how professionals manage clients, appointments & invoices</p>
                  </div>
                </div>

                {/* Key Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                      <i className="ph-light ph-calendar-check text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Smart Scheduling</h3>
                    <p className="text-sm text-slate-600">Sync with Google Calendar, automate WhatsApp reminders, and schedule Zoom calls.</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 mb-4">
                      <i className="ph-light ph-file-text text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Professional Invoicing</h3>
                    <p className="text-sm text-slate-600">Custom branded invoices with your logo, time tracking, and online payment integration.</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-white rounded-xl border border-amber-100">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                      <i className="ph-light ph-shield-check text-2xl"></i>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">Secure KYC Records</h3>
                    <p className="text-sm text-slate-600">Centralized client database with document storage and compliance tracking.</p>
                  </div>
                </div>

                {/* Interactive Demo Steps */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Try It Yourself</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Create a New Client</h4>
                        <p className="text-sm text-slate-600">Add client details, upload KYC documents, and assign to your practice.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Schedule an Appointment</h4>
                        <p className="text-sm text-slate-600">Book meetings that auto-sync with Google Calendar and send WhatsApp confirmations.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">Generate an Invoice</h4>
                        <p className="text-sm text-slate-600">Track billable hours, create invoices with your logo, and send for online payment.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center pt-6 border-t border-slate-100">
                  <p className="text-slate-600 mb-4">Ready to streamline your professional practice?</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => {
                        setShowDemoModal(false);
                        setShowSignupModal(true);
                        window.location.hash = '#signup';
                      }}
                      className="px-8 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                    >
                      Start Free Trial
                    </button>
                    <button 
                      onClick={closeModal}
                      className="px-8 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-xl transition-all"
                    >
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <i className="ph-light ph-x text-2xl"></i>
              </button>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mx-auto mb-4">
                  <i className="ph-light ph-squares-four text-2xl font-bold"></i>
                </div>
                <h2 className="text-2xl font-clash font-semibold text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-sm text-slate-500">Log in to your Belize Professional account</p>
              </div>
              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                  {authSuccess}
                </div>
              )}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                >
                  Log In
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowSignupModal(true);
                      window.location.hash = '#signup';
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Signup Modal */}
        {showSignupModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                <i className="ph-light ph-x text-2xl"></i>
              </button>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mx-auto mb-4">
                  <i className="ph-light ph-squares-four text-2xl font-bold"></i>
                </div>
                <h2 className="text-2xl font-clash font-semibold text-slate-900 mb-2">Create Account</h2>
                <p className="text-sm text-slate-500">Join Belize Professional today</p>
              </div>
              {authError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                  {authSuccess}
                </div>
              )}
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input 
                    type="password" 
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                  <input 
                    type="password" 
                    value={signupPasswordConfirm}
                    onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Professional Type</label>
                  <div className="relative">
                    <select 
                      value={signupRole} 
                      onChange={(e) => setSignupRole(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="">Select your profession...</option>
                      <option value="attorney">Attorney</option>
                      <option value="doctor">Doctor</option>
                      <option value="accountant">Accountant</option>
                      <option value="client">Client</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                >
                  Create Account
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <button 
                    onClick={() => {
                      setShowSignupModal(false);
                      setShowLoginModal(true);
                      window.location.hash = '#login';
                      setAuthError('');
                      setAuthSuccess('');
                    }}
                    className="text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased overflow-x-hidden selection:bg-brand-100 selection:text-brand-900">
          {/*
    AESTHETIC DNA:
    Trend Core: Stripe meets Minimal Luxury ("Luxury Corporate SaaS")
    Spice: Dynamic Interactive State Switchers via Peer CSS, Ultra-fine grids
    Palette: Pure White (#FFFFFF), Ivory Glow (#FBFBFA), Royal Indigo (#4F46E5), Sage Teal (#0F766E), Amber Bronze (#B45309), Charcoal Navy (#0F172A)
    Type: Clash Display + Satoshi (Fontshare pairing)
    Page Type: Landing Page
*/}

  {/* Ambient Light Blobs */}
  <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-100/30 rounded-full glow-blob -z-10"></div>
  <div className="absolute top-[40vh] left-[-10vw] w-[40vw] h-[40vw] bg-teal-50/40 rounded-full glow-blob -z-10"></div>
  <div className="absolute top-[120vh] right-[5vw] w-[45vw] h-[45vw] bg-amber-50/30 rounded-full glow-blob -z-10"></div>

  {/* Announcement Banner */}
  <div className="bg-brand-900 text-brand-50 text-xs py-3 px-4 font-medium tracking-wide text-center relative z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span className="bg-brand-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">NEW</span>
      <span>Belize's Premier Professional Network. Connect with Top Attorneys, Doctors & Accountants. Phone: 501-6352720 | Cayo, Belize</span>
      <a href="#demo" className="underline hover:text-white transition-colors ml-1 inline-flex items-center gap-1">
        Explore interactive invoicing <i className="ph-light ph-arrow-right"></i>
      </a>
    </div>
  </div>

  {/* Header / Navbar */}
  <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
      
      {/* Brand Logo */}
      <a href="#" className="flex items-center gap-3 active:scale-[0.98] transition-transform">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <i className="ph-light ph-squares-four text-2xl font-bold"></i>
        </div>
        <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
      </a>

      {/* Desktop Nav Links */}
      <nav className="hidden lg:flex items-center gap-8">
        <a href="/" className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">Home</a>
        <a href="/features" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
        <Link href="/professionals" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">
          Professionals
        </Link>
        <Link href="/invoicing" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">
          Explore Interactive Invoicing
        </Link>
        <a href="/accounting" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Accounting</a>
        <a href="/support" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Support</a>
        <a href="/about" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About Us</a>
      </nav>

      {/* Header CTAs */}
      <div className="flex items-center gap-4">
        <a href="#login" className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2.5 px-4 rounded-xl hover:bg-slate-50">Log In</a>
        <a href="#signup" className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl active:scale-[0.98]">
          Start Free Trial
        </a>
      </div>
    </div>
  </header>

  {/* Hero Section */}
  <section id="home" className="pt-8 pb-20 lg:pt-16 lg:pb-32 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 grid-lines rounded-[3rem] py-12 lg:py-16">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Text Column */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          
          {/* Micro Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200/80 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
            <i className="ph-light ph-sparkle text-indigo-500 text-base"></i>
            <span>Tailored for Attorneys, Doctors & Accountants</span>
          </div>

          {/* Headline */}
          <h1 className="font-clash text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-slate-950">
            Belize's Premier Platform for <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">Elite Professionals</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Belize Professional connects high-net-worth clients with Belize's finest attorneys, doctors, and accountants. Unified scheduling, secure KYC records, WhatsApp automation, and intelligent GST accounting—built for excellence.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="#signup" className="px-8 py-4 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl text-base transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
              Get Started for Free <i className="ph-light ph-arrow-right"></i>
            </a>
            <a href="#interactive-preview" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl text-base transition-all shadow-luxury flex items-center justify-center gap-2">
              <i className="ph-light ph-play"></i> Watch Sandbox Demo
            </a>
          </div>

          {/* Feature tags (Micro trust elements) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 pt-4 border-t border-slate-200/50 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center gap-2 text-sm text-slate-600 justify-center lg:justify-start">
              <i className="ph-light ph-check-circle text-brand-600 text-lg"></i>
              <span>Google Calendar Integration</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 justify-center lg:justify-start">
              <i className="ph-light ph-check-circle text-brand-600 text-lg"></i>
              <span>Automated WhatsApp reminders</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 justify-center lg:justify-start col-span-2 sm:col-span-1">
              <i className="ph-light ph-check-circle text-brand-600 text-lg"></i>
              <span>Separated 12.5% GST</span>
            </div>
          </div>

        </div>

        {/* Dynamic Visual Column (Bento Visual) */}
        <div className="lg:col-span-6 relative">
          {/* Main Hero Mockup Container */}
          <div className="relative bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-2xl shadow-indigo-500/10">
            
            {/* Window Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                <div className="w-3 h-3 rounded-full bg-slate-200"></div>
              </div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-satoshi bg-brand-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Belize Professional Active Workspace</span>
              </div>
            </div>

            {/* Bento Elements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Left Widget: Calendar & Booking */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-200 font-semibold tracking-wide uppercase">Integrated Calendar</span>
                  <i className="ph-light ph-calendar-check text-xl text-indigo-400"></i>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">Upcoming Client Slots</h4>
                  {/* Consultation Block */}
                  <div className="bg-white/10 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-semibold text-white">Consul. #1040 — Dr. Julian R.</p>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold uppercase">ZOOM CONFIRMED</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-300">
                      <span>Today, 2:30 PM (45m)</span>
                      <span className="flex items-center gap-1"><i className="ph-light ph-whatsapp-logo text-emerald-400"></i> Sent SMS Reminder</span>
                    </div>
                  </div>
                  {/* Next block */}
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 opacity-70">
                    <p className="text-xs font-semibold text-white">GST Summary — Legal Audit</p>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>Tomorrow, 10:00 AM</span>
                      <span>Google Sync Active</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Widget: Case / KYC File */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">KYC & Client Profile</span>
                  <i className="ph-light ph-user-circle-gear text-xl text-indigo-500"></i>
                </div>
                {/* Profile snapshot */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img className="w-10 h-10 rounded-full object-cover shadow-sm" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop" alt="Client Avatar" />
                    <div>
                      <h5 className="text-xs font-semibold text-slate-900">Seraphina Thorne</h5>
                      <span className="text-[10px] text-slate-400">Account ID: #2099-C</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200/60 rounded-xl space-y-1">
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Attor. Litig. dossier</span>
                    <p className="text-[11px] text-slate-600 leading-snug font-medium">Trademark Dispute & Tax Auditing for Corporate GST validation.</p>
                  </div>
                </div>
              </div>

              {/* Bottom Wide Widget: Quick Invoice Billing */}
              <div className="md:col-span-2 bg-gradient-to-tr from-indigo-500/10 to-teal-500/10 rounded-2xl p-5 border border-indigo-100 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-950 flex items-center gap-1.5">
                      <i className="ph-light ph-file-text text-lg text-indigo-600"></i> Modernized Dynamic Billing Panel
                    </h4>
                    <p className="text-xs text-slate-500">Separated billing engine tracking work log hours & localized tax.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] bg-indigo-600 text-white font-bold tracking-wider px-2 py-1 rounded-lg">1-TOUCH SEND</span>
                  </div>
                </div>

                {/* Live Dynamic Equation */}
                <div className="bg-white/80 p-4 rounded-xl border border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Logged Session</span>
                    <span className="text-sm font-semibold text-slate-800">5 Hours 45 Min</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Hourly Rate</span>
                    <span className="text-sm font-semibold text-slate-800">$250.00 / hr</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-teal-600 block font-bold uppercase tracking-wider">GST Tax (12.5%)</span>
                    <span className="text-sm font-bold text-teal-700">$179.68</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-600 block font-bold uppercase tracking-wider">Grand Total</span>
                    <span className="text-sm font-extrabold text-indigo-950">$1,617.18</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Abstract Floater Accent */}
          <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl -z-10"></div>
        </div>

      </div>

    </div>
  </section>

  {/* CSS-Only Interactive Sandbox (Professional Roles) */}
  <section id="interactive-preview" className="py-20 lg:py-28 bg-white border-y border-slate-200/60 relative">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      
      {/* Hidden Radio Elements to maintain Javascript-free toggling states */}
      <input type="radio" id="role-doctor" name="role-selector" className="peer/doctor hidden" defaultChecked />
      <input type="radio" id="role-attorney" name="role-selector" className="peer/attorney hidden" />
      <input type="radio" id="role-accountant" name="role-selector" className="peer/accountant hidden" />

      {/* Section Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <h2 className="font-clash text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Tailored to your specific profession
        </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Switch tabs below to see how Belize Professional configures scheduling, client KYC records, billing, and tax workflows depending on your craft.
          </p>

        {/* Sibling Radio Navigation Pills */}
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/50 mt-6 select-none">
          <label htmlFor="role-doctor" className="cursor-pointer px-5 py-3 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2
            peer-checked/doctor:bg-white peer-checked/doctor:text-indigo-600 peer-checked/doctor:shadow-sm text-slate-500 hover:text-slate-900
            [input:checked#role-doctor~div&]:bg-white [input:checked#role-doctor~div&]:text-indigo-600 [input:checked#role-doctor~div&]:shadow-sm">
            <i className="ph-light ph-stethoscope"></i>
            <span>Medical Practitioners</span>
          </label>
          <label htmlFor="role-attorney" className="cursor-pointer px-5 py-3 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2
            peer-checked/attorney:bg-white peer-checked/attorney:text-indigo-600 peer-checked/attorney:shadow-sm text-slate-500 hover:text-slate-900
            [input:checked#role-attorney~div&]:bg-white [input:checked#role-attorney~div&]:text-indigo-600">
            <i className="ph-light ph-scales"></i>
            <span>Attorneys & Counsel</span>
          </label>
          <label htmlFor="role-accountant" className="cursor-pointer px-5 py-3 rounded-xl text-sm font-semibold transition-all inline-flex items-center gap-2
            peer-checked/accountant:bg-white peer-checked/accountant:text-indigo-600 peer-checked/accountant:shadow-sm text-slate-500 hover:text-slate-900">
            <i className="ph-light ph-calculator"></i>
            <span>Accountants & CPAs</span>
          </label>
        </div>
      </div>

      {/* Live Dynamic View Content based on checked peer (Doctor view) */}
      <div className="hidden peer-checked/doctor:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image and Mock preview block */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-luxury">
              <img className="w-full h-[400px] object-cover filter brightness-[0.98]" src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop" alt="Medical professional using dashboard" />
              {/* Float overlay badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 text-white backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-[10px] text-teal-400 font-bold tracking-wider uppercase">VANCE FINANCIAL — FIRM DASHBOARD</span>
                <p className="text-sm font-medium leading-relaxed">"The auto-isolated 12.5% GST monthly summaries save us immense work. We simply export the filtered Excel reports and hand them over cleanly to our clients."</p>
              </div>
            </div>
          </div>
          {/* Features list */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Healthcare Module</span>
            <h3 className="font-clash text-3xl font-semibold text-slate-900">Patient EHR & Clinical Logs Combined</h3>
            <p className="text-slate-600 leading-relaxed">
              Log patient details, symptoms, case notes, and treatment histories immediately into our compliant encrypted client database. Secure digital records protect personal health data under strict authorization standards.
            </p>
            <div className="space-y-4 pt-4 border-t border-slate-200/60">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <i className="ph-light ph-phone-call text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Schedule WhatsApp / Zoom Clinics</h4>
                  <p className="text-sm text-slate-500">Auto-inject secure appointment reminders via SMS/WhatsApp with meeting URLs for zero-fuss medical telehealth consultations.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                  <i className="ph-light ph-shield-check text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Customized Clinical Receipts & Invoicing</h4>
                  <p className="text-sm text-slate-500">Present a clean receipt format containing your medical center logo, physician info, dynamic consult line items, and 12.5% GST separation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Dynamic View Content based on checked peer (Attorney view) */}
      <div className="hidden peer-checked/attorney:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image and Mock preview block */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-luxury">
              <img className="w-full h-[400px] object-cover filter brightness-[0.98]" src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop" alt="Legal professional using dashboard" />
              {/* Float overlay badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 text-white backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-[10px] text-amber-500 font-bold tracking-wider uppercase">CLARA BENNETT, ESQ. — TRIAL MANAGER</span>
                <p className="text-sm font-medium leading-relaxed">"Hourly legal counsel bookkeeping is famously complex. Now, with a single touch, I log litigation duration, send automated WhatsApp retainers, and isolate our country's 12.5% GST flawlessly."</p>
              </div>
            </div>
          </div>
          {/* Features list */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs text-amber-600 font-bold uppercase tracking-wider">Legal Advisory Module</span>
            <h3 className="font-clash text-3xl font-semibold text-slate-900">Unified Counsel Dossiers & Client KYC</h3>
            <p className="text-slate-600 leading-relaxed">
              Track legal filings, witness notes, previous consult transcripts, and litigation deadlines in our secure central framework. Store comprehensive professional directories mapping client histories in detailed court chronological order.
            </p>
            <div className="space-y-4 pt-4 border-t border-slate-200/60">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                  <i className="ph-light ph-hourglass text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Billable-Hour Multipliers</h4>
                  <p className="text-sm text-slate-500">Log legal counsel time against specific client folders. Seamless system converts hourly blocks into premium customized invoices on-the-spot.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <i className="ph-light ph-bank text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Direct Trust Bank Details</h4>
                  <p className="text-sm text-slate-500">Provide clients with dynamic online banking, ACH details, and credit settlement fields to rapidly settle retainers or litigation settlements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Dynamic View Content based on checked peer (Accountant view) */}
      <div className="hidden peer-checked/accountant:block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image and Mock preview block */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-luxury">
              <img className="w-full h-[400px] object-cover filter brightness-[0.98]" src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop" alt="Accounting specialist using dashboard" />
              {/* Float overlay badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 text-white backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2">
                <span className="text-[10px] text-teal-400 font-bold tracking-wider uppercase">VANCE FINANCIAL — FIRM DASHBOARD</span>
                <p className="text-sm font-medium leading-relaxed">"The auto-isolated 12.5% GST monthly summaries save us immense work. We simply export the filtered Excel reports and hand them over cleanly to our clients."</p>
              </div>
            </div>
          </div>
          {/* Features list */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs text-teal-600 font-bold uppercase tracking-wider">Accounting & Tax Module</span>
            <h3 className="font-clash text-3xl font-semibold text-slate-900">Automated GST Isolation & Reports</h3>
            <p className="text-slate-600 leading-relaxed">
              Track client audit timelines, corporate filings, and quarterly compliance deadlines in a unified system. Generate audit-ready tax summary PDFs with proper GST breakdowns for regulatory bodies.
            </p>
            <div className="space-y-4 pt-4 border-t border-slate-200/60">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                  <i className="ph-light ph-file-xls text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Excel Export & Reconciliation</h4>
                  <p className="text-sm text-slate-500">Export filtered GST ledger entries directly to Excel for seamless reconciliation with accounting software and tax filing systems.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <i className="ph-light ph-receipt text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-900">Multi-Client Billing Dashboard</h4>
                  <p className="text-sm text-slate-500">Manage multiple corporate client accounts with separate invoice streams, payment tracking, and automated reminders via WhatsApp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  {/* Feature Grid */}
  <section className="py-20 lg:py-32 bg-slate-50/50 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <h2 className="font-clash text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Everything you need in one place
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Belize Professional brings together scheduling, client management, billing, and compliance tools designed specifically for high-touch professional services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Feature Card 1 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/60 hover:border-indigo-200 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform">
            <i className="ph-light ph-calendar-check text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Google Calendar Sync</h3>
          <p className="text-slate-600 leading-relaxed">
            Two-way sync with Google Calendar ensures your appointments are always up to date across all devices and platforms.
          </p>
        </div>

        {/* Feature Card 2 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/60 hover:border-teal-200 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-5 group-hover:scale-110 transition-transform">
            <i className="ph-light ph-whatsapp-logo text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">WhatsApp Automation</h3>
          <p className="text-slate-600 leading-relaxed">
            Send appointment reminders, invoice notifications, and payment confirmations automatically via WhatsApp.
          </p>
        </div>

        {/* Feature Card 3 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/60 hover:border-amber-200 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
            <i className="ph-light ph-lock text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure KYC Records</h3>
          <p className="text-slate-600 leading-relaxed">
            Store client identification, case files, and sensitive documents in encrypted, HIPAA-compliant storage.
          </p>
        </div>

        {/* Feature Card 4 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/60 hover:border-indigo-200 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform">
            <i className="ph-light ph-receipt text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Professional Invoicing</h3>
          <p className="text-slate-600 leading-relaxed">
            Generate branded invoices with your logo, itemized services, hourly rates, and automatically calculated 12.5% GST.
          </p>
        </div>

        {/* Feature Card 5 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/60 hover:border-teal-200 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 mb-5 group-hover:scale-110 transition-transform">
            <i className="ph-light ph-video-camera text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Zoom Integration</h3>
          <p className="text-slate-600 leading-relaxed">
            Schedule virtual consultations with automatic Zoom link generation and calendar invite distribution.
          </p>
        </div>

        {/* Feature Card 6 */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200/60 hover:border-amber-200 transition-all hover:shadow-lg group">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 mb-5 group-hover:scale-110 transition-transform">
            <i className="ph-light ph-bank text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">Online Payments</h3>
          <p className="text-slate-600 leading-relaxed">
            Accept payments via bank transfer, credit card, or ACH with automatic payment tracking and reconciliation.
          </p>
        </div>

      </div>
    </div>
  </section>

  {/* CTA Section */}
  <section className="py-20 lg:py-32 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center space-y-8">
      
      <h2 className="font-clash text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">
        Join Belize's elite professional network
      </h2>
      
      <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
        Whether you're an attorney, doctor, or accountant, Belize Professional gives you everything you need to manage clients, appointments, and billing in one beautiful platform.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <a href="#signup" className="px-8 py-4 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl text-base transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
          Start Your Free Trial <i className="ph-light ph-arrow-right"></i>
        </a>
        <a href="#contact" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl text-base transition-all shadow-luxury flex items-center justify-center gap-2">
          <i className="ph-light ph-phone"></i> Contact Sales
        </a>
      </div>

      <div className="flex items-center justify-center gap-8 pt-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <i className="ph-light ph-check-circle text-brand-600 text-lg"></i>
          <span>No credit card required</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ph-light ph-check-circle text-brand-600 text-lg"></i>
          <span>14-day free trial</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="ph-light ph-check-circle text-brand-600 text-lg"></i>
          <span>Cancel anytime</span>
        </div>
      </div>

    </div>
  </section>

  {/* Footer */}
  <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
              <i className="ph-light ph-squares-four text-2xl font-bold"></i>
            </div>
            <span className="font-clash font-semibold text-xl text-white">Belize Professional</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The premier platform connecting Belize's top professionals with high-value clients.
          </p>
        </div>

        {/* Product Column */}
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="#accounting" className="hover:text-white transition-colors">Accounting</a></li>
            <li><a href="#professionals" className="hover:text-white transition-colors">For Professionals</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#support" className="hover:text-white transition-colors">Support</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <i className="ph-light ph-phone"></i>
              <span>501-6352720</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="ph-light ph-map-pin"></i>
              <span>Cayo, Belize</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="ph-light ph-envelope"></i>
              <a href="mailto:hello@belizepro.com" className="hover:text-white transition-colors">hello@belizepro.com</a>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
        <p>&copy; 2024 Belize Professional. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>

    </div>
  </footer>

</div>
      </>
    );
}