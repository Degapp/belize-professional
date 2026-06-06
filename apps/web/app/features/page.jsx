'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FeaturesPage() {
    const [features, setFeatures] = useState([
      {
        icon: 'ph-calendar-check',
        bgColor: 'bg-brand-50',
        textColor: 'text-brand-600',
        title: 'Integrated Calendar',
        description: 'Seamlessly sync your appointments with Google Calendar. Manage booking availability, block personal time, and coordinate meetings across time zones without context switching.'
      },
      {
        icon: 'ph-user-list',
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-600',
        title: 'Client Database',
        description: 'A comprehensive vault for every client relationship. Access historical appointment logs, past case notes, KYC documentation, and interaction histories in one unified view.'
      },
      {
        icon: 'ph-receipt-x',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        title: 'Invoicing System',
        description: 'Create beautiful, on-brand invoices instantly. Customize line items, apply branding elements, and define tax treatments for a professional client-facing receipt every time.'
      },
      {
        icon: 'ph-credit-card',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        title: 'Payment Processing',
        description: 'Secure, frictionless payments built-in. Collect deposits, retainer fees, or final settlements directly through digital payment links sent via WhatsApp or email.'
      },
      {
        icon: 'ph-bell-ringing',
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-600',
        title: 'Automated Reminders',
        description: 'Enhance reliability with intelligent automated notifications. Schedule multi-channel reminders (WhatsApp, SMS, Email) for upcoming appointments to virtually eliminate no-shows.'
      }
    ]);
    const [loading, setLoading] = useState(false);

    return (
      <>
        <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased overflow-x-hidden selection:bg-brand-100 selection:text-brand-900">
          {/* Ambient Light Blobs */}
  <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-100/30 rounded-full glow-blob -z-10"></div>
  <div className="absolute top-[40vh] left-[-10vw] w-[40vw] h-[40vw] bg-teal-50/40 rounded-full glow-blob -z-10"></div>

  {/* Header */}
  <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
      <a href="#" onClick="window.location.href='index.html'" className="flex items-center gap-3 active:scale-[0.98] transition-transform">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <i className="ph-light ph-squares-four text-2xl font-bold"></i>
        </div>
        <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
      </a>

      <nav className="hidden lg:flex items-center gap-8">
        <a href="/" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Home</a>
        <a href="/features" className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">Features</a>
        <Link href="/professionals" className="text-gray-700 hover:text-blue-600 transition-colors">
          Professionals
        </Link>
        <Link href="/invoicing" className="text-gray-700 hover:text-blue-600 transition-colors">
          Explore Interactive Invoicing
        </Link>
        <a href="/accounting" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Accounting</a>
        <a href="/support" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Support</a>
        <a href="/about" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About Us</a>
      </nav>

      <div className="flex items-center gap-4">
        <a href="#login" className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2.5 px-4 rounded-xl">Log In</a>
        <button className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-lg active:scale-[0.98]">
          Start Free Trial
        </button>
      </div>
    </div>
  </header>

  {/* Hero Section */}
  <section className="py-20 lg:py-32 relative">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-6">
      <span className="text-xs text-brand-600 font-bold uppercase tracking-widest bg-brand-50 px-4 py-1.5 rounded-full">Suite Breakdown</span>
      <h1 className="font-clash text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-950">
        Engineered for <span className="text-brand-600">high-performance</span> professionals.
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Discover the toolkit designed to streamline your daily practice, from client intake to automated tax compliance.
      </p>
    </div>
  </section>

  {/* Features Grid */}
  <section className="py-16">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {Array.isArray(features) ? features.map((feature, index) => (
        <div key={index} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-luxury group transition-all hover:shadow-xl">
          <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} ${feature.textColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <i className={`ph-light ${feature.icon} text-3xl`}></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
          <p className="text-slate-500 leading-relaxed">
            {feature.description}
          </p>
        </div>
        )) : null}

        {/* Feature 6 */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-luxury group transition-all hover:shadow-xl flex items-center justify-center">
            <div className="text-center">
                <i className="ph-light ph-plus text-5xl text-slate-300 mb-4"></i>
                <h3 className="text-lg font-bold text-slate-900">More Features Coming Soon</h3>
                <p className="text-slate-400 text-sm mt-2">We are constantly evolving to better support your practice.</p>
            </div>
        </div>

      </div>
    </div>
  </section>

  {/* CTA Section */}
  <section className="py-24 bg-slate-900 text-white mt-12">
    <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
      <h2 className="font-clash text-4xl font-semibold">Ready to elevate your daily practice?</h2>
      <p className="text-indigo-200 text-lg">Join 15,000+ practitioners who save time every day with our integrated workflow solution.</p>
      <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
        Get Started Now
      </button>
    </div>
  </section>
        </div>
      </>
    );
}