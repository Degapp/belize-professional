'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const [professionals, setProfessionals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDemoModal, setShowDemoModal] = useState(false);

    useEffect(() => {
        // Redirect authenticated users to dashboard
        if (isAuthenticated) {
            router.push('/dashboard');
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
    }, [isAuthenticated, router]);

    useEffect(() => {
        const checkHash = () => {
            const hash = window.location.hash;
            if (hash === '#interactive-preview') {
                setShowDemoModal(true);
            }
        };
        
        checkHash();
        
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    const closeModal = () => {
        setShowDemoModal(false);
        window.location.hash = '';
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };
        
        if (showDemoModal) {
            window.addEventListener('keydown', handleEscape);
            return () => window.removeEventListener('keydown', handleEscape);
        }
    }, [showDemoModal]);

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

                <div className="mb-8 rounded-xl overflow-hidden bg-slate-100 aspect-video flex items-center justify-center border border-slate-200">
                  <div className="text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white mx-auto shadow-lg hover:bg-brand-700 transition-all cursor-pointer">
                      <i className="ph-light ph-play-circle text-5xl"></i>
                    </div>
                    <p className="text-slate-600 font-medium">Watch Platform Demo Video</p>
                    <p className="text-sm text-slate-500">See how professionals manage clients, appointments & invoices</p>
                  </div>
                </div>

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

                <div className="text-center pt-6 border-t border-slate-100">
                  <p className="text-slate-600 mb-4">Ready to streamline your professional practice?</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link 
                      href="/signup"
                      className="px-8 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98]"
                    >
                      Start Free Trial
                    </Link>
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

        <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased overflow-x-hidden selection:bg-brand-100 selection:text-brand-900">
  <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-100/30 rounded-full glow-blob -z-10"></div>
  <div className="absolute top-[40vh] left-[-10vw] w-[40vw] h-[40vw] bg-teal-50/40 rounded-full glow-blob -z-10"></div>
  <div className="absolute top-[120vh] right-[5vw] w-[45vw] h-[45vw] bg-amber-50/30 rounded-full glow-blob -z-10"></div>

  <div className="bg-brand-900 text-brand-50 text-xs py-3 px-4 font-medium tracking-wide text-center relative z-50">
    <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
      <span className="bg-brand-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">NEW</span>
      <span>Belize's Premier Professional Network. Connect with Top Attorneys, Doctors & Accountants. Phone: 501-6352720 | Cayo, Belize</span>
      <a href="#demo" className="underline hover:text-white transition-colors ml-1 inline-flex items-center gap-1">
        Explore interactive invoicing <i className="ph-light ph-arrow-right"></i>
      </a>
    </div>
  </div>

  <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3 active:scale-[0.98] transition-transform">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <i className="ph-light ph-squares-four text-2xl font-bold"></i>
        </div>
        <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
      </Link>

      <nav className="hidden lg:flex items-center gap-8">
        <Link href="/" className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">Home</Link>
        <Link href="/features" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
        <Link href="/professionals" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">
          Professionals
        </Link>
        <Link href="/invoicing" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">
          Explore Interactive Invoicing
        </Link>
        <Link href="/accounting" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Accounting</Link>
        <Link href="/support" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Support</Link>
        <Link href="/about" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About Us</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2.5 px-4 rounded-xl hover:bg-slate-50">Log In</Link>
        <Link href="/signup" className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl active:scale-[0.98]">
          Start Free Trial
        </Link>
      </div>
    </div>
  </header>

  <section id="home" className="pt-8 pb-20 lg:pt-16 lg:pb-32 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 grid-lines rounded-[3rem] py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200/80 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
            <i className="ph-light ph-sparkle text-indigo-500 text-base"></i>
            <span>Tailored for Attorneys, Doctors & Accountants</span>
          </div>

          <h1 className="font-clash text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-slate-950">
            Belize's Premier Platform for <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">Elite Professionals</span>
          </h1>

          <p className="text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
            Belize Professional connects high-net-worth clients with Belize's finest attorneys, doctors, and accountants. Unified scheduling, secure KYC records, WhatsApp automation, and intelligent GST accounting—built for excellence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/signup" className="px-8 py-4 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl text-base transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
              Get Started for Free <i className="ph-light ph-arrow-right"></i>
            </Link>
            <Link href="#interactive-preview" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-semibold rounded-xl text-base transition-all shadow-luxury flex items-center justify-center gap-2">
              <i className="ph-light ph-play"></i> Watch Sandbox Demo
            </Link>
          </div>

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

        <div className="lg:col-span-6 relative">
          <div className="relative bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-slate-200/80 shadow-2xl shadow-indigo-500/10">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-200 font-semibold tracking-wide uppercase">Integrated Calendar</span>
                  <i className="ph-light ph-calendar-check text-xl text-indigo-400"></i>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-white">Upcoming Client Slots</h4>
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
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-1 opacity-70">
                    <p className="text-xs font-semibold text-white">GST Summary — Legal Audit</p>
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>Tomorrow, 10:00 AM</span>
                      <span>Google Sync Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">KYC & Client Profile</span>
                  <i className="ph-light ph-user-circle-gear text-xl text-indigo-500"></i>
                </div>
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

          <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl -z-10"></div>
        </div>
      </div>
    </div>
  </section>

  {/* Footer and remaining sections would go here - keeping it shorter for clarity */}
</div>
      </>
    );
}
