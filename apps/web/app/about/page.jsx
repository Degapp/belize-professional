'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AboutPage() {
  const router = useRouter();

    return (
      <>
        <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased overflow-x-hidden selection:bg-brand-100 selection:text-brand-900">
          {/*
    AESTHETIC DNA:
    Trend Core: Stripe meets Minimal Luxury ("Luxury Corporate SaaS")
    Spice: Dynamic Interactive State Switchers via Peer CSS, Ultra-fine grids
    Palette: Pure White (#FFFFFF), Ivory Glow (#FBFBFA), Royal Indigo (#4F46E5), Sage Teal (#0F766E), Amber Bronze (#B45309), Charcoal Navy (#0F172A)
    Type: Clash Display + Satoshi (Fontshare pairing)
    Page Type: About Us (Sub-page)
*/}

  {/* Header / Navbar */}
  <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
      
      {/* Brand Logo */}
      <a href="#" onClick={() => router.push('/')} className="flex items-center gap-3 active:scale-[0.98] transition-transform">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <i className="ph-light ph-squares-four text-2xl font-bold"></i>
        </div>
        <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
      </a>

      {/* Desktop Nav Links */}
      <nav className="hidden lg:flex items-center gap-8">
        <a href="#" onClick={() => router.push('/')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Home</a>
        <a href="#" onClick={() => router.push('/features')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
        <Link href="/professionals" className="text-gray-700 hover:text-blue-600 transition-colors">
          Professionals
        </Link>
        <Link href="/invoicing" className="text-gray-700 hover:text-blue-600 transition-colors">
          Explore Interactive Invoicing
        </Link>
        <a href="#" onClick={() => router.push('/accounting')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Accounting</a>
        <a href="#" onClick={() => router.push('/support')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Support</a>
        <a href="#" className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">About Us</a>
      </nav>

      {/* Header CTAs */}
      <div className="flex items-center gap-4">
        <a href="#" onClick={() => router.push('/')} className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2.5 px-4 rounded-xl hover:bg-slate-50">Back Home</a>
        <a href="#" className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl active:scale-[0.98]">
          Get Started
        </a>
      </div>
    </div>
  </header>

  {/* Hero Section */}
  <section className="pt-20 pb-20 relative overflow-hidden bg-white">
    <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
      <span className="text-brand-600 font-bold uppercase tracking-widest text-xs">Our Story</span>
      <h1 className="font-clash text-5xl lg:text-6xl font-semibold tracking-tight text-slate-950 leading-tight">
        Building the future of <br /> <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">Professional Administration</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Founded on the belief that practitioners should focus on their craft, not paperwork. We are crafting the operating system for the modern independent firm.
      </p>
    </div>
  </section>

  {/* Mission Section */}
  <section className="py-20 bg-slate-50/50">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div className="relative">
        <div className="absolute inset-0 bg-brand-600/5 rounded-3xl -rotate-2"></div>
        <img src="https://app-cdn.appgen.com/5841f720-0982-48b5-bc9f-5ad68cf07fc9/assets/belizean-professionals-hero_jpg.jpeg" className="rounded-3xl shadow-luxury relative rotate-0" alt="Belizean Professional Team" />
      </div>
      <div className="space-y-6">
        <h2 className="font-clash text-3xl font-semibold text-slate-900">Our Mission</h2>
        <p className="text-slate-600 leading-relaxed">
          At Belize Professional, we identified a fundamental disconnect in the modern professional landscape. Talented lawyers, physicians, and accountants were spending 40% of their billable time chasing invoicing, filing KYC documents, and managing disconnected calendar systems.
        </p>
        <p className="text-slate-600 leading-relaxed">
          Our mission is to empower professionals with an intuitive, unified workspace that eliminates administrative friction, protects client data, and ensures compliance through intelligent automation.
        </p>
        <div className="flex gap-8 pt-4">
          <div>
            <div className="text-3xl font-bold font-clash text-brand-600">15k+</div>
            <div className="text-sm text-slate-500">Active Professionals</div>
          </div>
          <div>
            <div className="text-3xl font-bold font-clash text-brand-600">99%</div>
            <div className="text-sm text-slate-500">Workflow Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Team Section */}
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="font-clash text-3xl font-semibold text-slate-900 mb-4">Meet the minds behind the platform</h2>
        <p className="text-slate-500 max-w-xl mx-auto">We are a distributed team of engineers, designers, and former practitioners united by a vision of seamless administrative workflows.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Team Card */}
        <div className="group p-6 rounded-3xl border border-slate-200 hover:border-brand-200 transition-all bg-white shadow-sm hover:shadow-lg">
          <img alt="" src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=400&auto=format&fit=crop" className="w-20 h-20 rounded-2xl mb-4 object-cover" />
          <h4 className="font-bold text-slate-900">Elena Vance</h4>
          <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-3">CEO & Co-Founder</p>
          <p className="text-sm text-slate-500 leading-relaxed">Former tax attorney with a vision to automate complex billing layers.</p>
        </div>
        {/* Team Card */}
        <div className="group p-6 rounded-3xl border border-slate-200 hover:border-brand-200 transition-all bg-white shadow-sm hover:shadow-lg">
          <img alt="" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" className="w-20 h-20 rounded-2xl mb-4 object-cover" />
          <h4 className="font-bold text-slate-900">Julian Chen</h4>
          <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-3">CTO & Lead Arch.</p>
          <p className="text-sm text-slate-500 leading-relaxed">Architecture specialist focusing on data security and real-time ledger syncs.</p>
        </div>
        {/* Team Card */}
        <div className="group p-6 rounded-3xl border border-slate-200 hover:border-brand-200 transition-all bg-white shadow-sm hover:shadow-lg">
          <img alt="" src="https://app-cdn.appgen.com/5841f720-0982-48b5-bc9f-5ad68cf07fc9/assets/generated_1780525875554_4ewyh60.jpeg" className="w-20 h-20 rounded-2xl mb-4 object-cover" />
          <h4 className="font-bold text-slate-900">Sarah Jenkins</h4>
          <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-3">Head of Design</p>
          <p className="text-sm text-slate-500 leading-relaxed">Designing the interface that brings calm to complex administrative tasks.</p>
        </div>
        {/* Team Card */}
        <div className="group p-6 rounded-3xl border border-slate-200 hover:border-brand-200 transition-all bg-white shadow-sm hover:shadow-lg">
          <img alt="" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop" className="w-20 h-20 rounded-2xl mb-4 object-cover" />
          <h4 className="font-bold text-slate-900">Marcus Thorne</h4>
          <p className="text-xs text-brand-600 font-semibold uppercase tracking-wider mb-3">Client Success</p>
          <p className="text-sm text-slate-500 leading-relaxed">Ensuring every firm gets the most out of their Belize Professional workspace.</p>
        </div>
      </div>
    </div>
  </section>

  {/* Testimonials Section */}
  <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center space-y-12">
      <h2 className="font-clash text-3xl font-semibold">Transforming practices globally</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left space-y-4">
          <p className="italic text-slate-300">"Moving our practice to Belize Professional eliminated our administrative backlog entirely. Everything—from billing to KYC—now happens in one secure view."</p>
          <div className="font-bold">Theresa Sterling</div>
          <div className="text-xs text-slate-400">Sterling Accountants Firm</div>
        </div>
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left space-y-4">
          <p className="italic text-slate-300">"The 12.5% GST automation feature alone was worth the investment. No more manual excel work or tax filing nightmares for our clinic."</p>
          <div className="font-bold">Dr. Marcus Julian</div>
          <div className="text-xs text-slate-400">Integrative Clinic Center</div>
        </div>
        <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-left space-y-4">
          <p className="italic text-slate-300">"Clients love the professional branded invoices we send directly via WhatsApp. It feels cohesive, modern, and has improved our payment collections."</p>
          <div className="font-bold">Clara Bennett, Esq.</div>
          <div className="text-xs text-slate-400">Bennett Counsel Group</div>
        </div>
      </div>
    </div>
  </section>

  {/* Footer */}
  <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
        <div className="lg:col-span-4 space-y-6">
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
              <i className="ph-light ph-squares-four text-2xl font-bold"></i>
            </div>
            <span className="font-clash font-semibold text-2xl tracking-tight text-white">Belize Professional<span className="text-indigo-400">.</span></span>
          </a>
          <p className="text-sm leading-relaxed text-slate-400">Belize's premier platform for professional service management with automated scheduling, client databases, WhatsApp integration, and compliant 12.5% GST tax calculations.</p>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">System App</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#" onClick={() => router.push('/')} className="hover:text-white transition-colors">Workspace Home</a></li>
            <li><a href="#" onClick={() => router.push('/features')} className="hover:text-white transition-colors">Features List</a></li>
            <li><a href="#" onClick={() => router.push('/accounting')} className="hover:text-white transition-colors">Tax & Accounting</a></li>
          </ul>
        </div>
        <div className="lg:col-span-3 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Company</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" onClick={() => router.push('/support')} className="hover:text-white transition-colors">Support Center</a></li>
          </ul>
        </div>
        <div className="lg:col-span-3 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Practice Newsletter</h5>
          <p className="text-xs text-slate-500">Subscribe for insights on regulatory adjustments and workspace updates.</p>
          <div className="space-y-2">
            <input type="email" placeholder="professional@company.com" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
          </div>
        </div>
      </div>
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
        <p>&copy; 2024 Belize Professional. All global practice administration rights reserved.</p>
      </div>
    </div>
  </footer>
        </div>
      </>
    );
}
