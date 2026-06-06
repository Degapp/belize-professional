'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AccountingPage() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/accounting/summary');
                const data = await res.json();
                setSummary(data);
            } catch (error) {
                console.error('Error fetching accounting summary:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const handleExportExcel = async () => {
        try {
            const res = await fetch('/api/accounting/export');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `accounting-report-${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    };

    return (
      <>
        <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased overflow-x-hidden selection:bg-brand-100 selection:text-brand-900">
          {/*
    AESTHETIC DNA:
    Trend Core: Stripe meets Minimal Luxury ("Luxury Corporate SaaS")
    Spice: Dynamic Interactive State Switchers via Peer CSS, Ultra-fine grids
    Palette: Pure White (#FFFFFF), Ivory Glow (#FBFBFA), Royal Indigo (#4F46E5), Sage Teal (#0F766E), Amber Bronze (#B45309), Charcoal Navy (#0F172A)
    Type: Clash Display + Satoshi (Fontshare pairing)
    Page Type: SaaS Internal Page (Accounting Module)
*/}

  {/* Ambient Light Blobs */}
  <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-teal-50/40 rounded-full glow-blob -z-10"></div>

  {/* Header */}
  <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
      <a href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
          <i className="ph-light ph-squares-four text-2xl"></i>
        </div>
        <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
      </a>

      <nav className="hidden lg:flex items-center gap-8">
        <a href="/" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Home</a>
        <a href="/features" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
        <Link href="/professionals" className="text-gray-700 hover:text-blue-600 transition-colors">
          Professionals
        </Link>
        <Link href="/invoicing" className="text-gray-700 hover:text-blue-600 transition-colors">
          Explore Interactive Invoicing
        </Link>
        <a href="/accounting" className="relative py-2 text-sm font-semibold text-brand-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">Accounting</a>
        <a href="/support" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Support</a>
        <a href="/about" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About Us</a>
      </nav>

      <div className="flex items-center gap-4">
        <a href="#signup" className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all">Start Free Trial</a>
      </div>
    </div>
  </header>

  {/* Hero Section */}
  <section className="pt-16 pb-20 lg:pt-24 lg:pb-32">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200/80 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
            <i className="ph-light ph-chart-line-up text-brand-600"></i>
            <span>Advanced Ledger Management</span>
          </div>
          <h1 className="font-clash text-4xl lg:text-6xl font-semibold text-slate-950 tracking-tight leading-[1.1]">
            Financial Clarity <br /><span className="text-brand-600">Without Complexity.</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
            Monitor earnings, calculate 12.5% GST, and generate compliant regulatory reports—all within one unified workspace. Say goodbye to spreadsheets.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleExportExcel} className="px-8 py-4 bg-brand-600 text-white rounded-xl font-semibold shadow-lg shadow-brand-500/20 hover:bg-brand-700">Generate Report</button>
            <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50">View Ledger</button>
          </div>
        </div>
        
        {/* Accounting Mockup */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Total Revenue</span>
              <p className="text-2xl font-bold text-white mt-1">${summary?.monthly?.total_income?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <span className="text-[10px] uppercase tracking-wider text-teal-400">GST Collected</span>
              <p className="text-2xl font-bold text-white mt-1">${summary?.monthly?.gst_amount?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
          <div className="mt-4 bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="space-y-4">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 w-[70%]"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Income Goal</span>
                <span>70% Achieved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Features Detail */}
  <section className="py-20 bg-white border-t border-slate-200/60">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
            <i className="ph-light ph-trend-up text-2xl"></i>
          </div>
          <h3 className="font-bold text-lg">Income Tracking</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Daily, weekly, and monthly tracking at a glance. Real-time insights into your firm's cash flow.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center">
            <i className="ph-light ph-calculator text-2xl"></i>
          </div>
          <h3 className="font-bold text-lg">12.5% GST Auto</h3>
          <p className="text-sm text-slate-500 leading-relaxed">No manual math. Every invoice automatically carves out your GST obligation accurately.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <i className="ph-light ph-file-xls text-2xl"></i>
          </div>
          <h3 className="font-bold text-lg">Excel Reporting</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Generate structured spreadsheets ready for tax authority submission in one single tap.</p>
        </div>

        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
            <i className="ph-light ph-shield-check text-2xl"></i>
          </div>
          <h3 className="font-bold text-lg">Compliance Ready</h3>
          <p className="text-sm text-slate-500 leading-relaxed">Transparency is built-in. Easily export logs for audits and professional peace of mind.</p>
        </div>

      </div>
    </div>
  </section>

  {/* Footer */}
  <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 space-y-4">
          <span className="font-clash text-xl text-white font-bold">Belize Professional.</span>
          <p className="text-xs">Unified workspace for modern professionals.</p>
        </div>
        <div className="space-y-4">
          <h5 className="text-white font-bold text-sm">Product</h5>
          <ul className="space-y-2 text-xs">
            <li><a href="features.html">Features</a></li>
            <li><a href="accounting.html">Accounting</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-white font-bold text-sm">Support</h5>
          <ul className="space-y-2 text-xs">
            <li><a href="support.html">Help Center</a></li>
            <li><a href="about.html">About</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <h5 className="text-white font-bold text-sm">Legal</h5>
          <ul className="space-y-2 text-xs">
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-12 pt-8 text-xs text-slate-600">
        &copy; 2024 Belize Professional. All rights reserved.
      </div>
    </div>
  </footer>
        </div>
      </>
    );
}