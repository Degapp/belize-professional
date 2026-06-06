'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch('/api/support');
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
      <>
        <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased overflow-x-hidden">
          {/* Ambient Light Blobs */}
  <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-100/30 rounded-full glow-blob -z-10"></div>
  <div className="absolute top-[40vh] left-[-10vw] w-[40vw] h-[40vw] bg-teal-50/40 rounded-full glow-blob -z-10"></div>

  {/* Header */}
  <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <a href="#" onClick={() => router.push('/')} className="flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <i className="ph-light ph-squares-four text-2xl font-bold"></i>
        </div>
        <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
      </a>

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
        <a href="#" onClick={() => router.push('/support')} className="relative py-2 text-sm font-semibold text-brand-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">Support</a>
        <a href="#" onClick={() => router.push('/about')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About Us</a>
      </nav>

      <div className="flex items-center gap-4">
        <button className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]">
          Contact Sales
        </button>
      </div>
    </div>
  </header>

  {/* Hero Section */}
  <section className="pt-16 pb-12 text-center">
    <div className="max-w-4xl mx-auto px-6">
      <span className="text-xs text-brand-600 font-bold uppercase tracking-widest bg-brand-50 px-4 py-2 rounded-full">Help & Support</span>
      <h1 className="font-clash text-4xl lg:text-6xl font-semibold tracking-tight text-slate-950 mt-6 mb-6">
        Everything you need to succeed with <span className="text-brand-600">Belize Professional.</span>
      </h1>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto">
        Need assistance? Explore our resources, FAQs, and contact our team for personalized help with your practice management.
      </p>
    </div>
  </section>

  {/* Content Grid */}
  <section className="pb-24 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Navigation/Categories */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-luxury sticky top-28">
          <h3 className="font-clash text-lg font-semibold text-slate-900 mb-4">Help Center</h3>
          <ul className="space-y-2">
            <li><a href="#faqs" className="block py-2 text-sm text-slate-600 hover:text-brand-600 transition-colors border-l-2 border-transparent pl-4 hover:border-brand-600 font-medium">Frequently Asked Questions</a></li>
            <li><a href="#contact" className="block py-2 text-sm text-slate-600 hover:text-brand-600 transition-colors border-l-2 border-transparent pl-4 hover:border-brand-600 font-medium">Contact Our Team</a></li>
            <li><a href="#tutorials" className="block py-2 text-sm text-slate-600 hover:text-brand-600 transition-colors border-l-2 border-transparent pl-4 hover:border-brand-600 font-medium">Video Tutorials & Guides</a></li>
          </ul>
        </div>
      </div>

      {/* Right Column: Main Content */}
      <div className="lg:col-span-2 space-y-16">
        
        {/* FAQs */}
        <div id="faqs" className="scroll-mt-24">
          <h2 className="font-clash text-2xl font-semibold text-slate-950 mb-8 flex items-center gap-3">
            <i className="ph-light ph-question text-brand-600"></i> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-slate-900 mb-2">Is Belize Professional compatible with my existing accounting software?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Yes. Our system is designed to complement existing tools. You can export clean, structured Excel reports for your monthly compliance and tax fillings, which import seamlessly into standard accounting suites.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-slate-900 mb-2">How secure is my patient and client data?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Security is our priority. We employ end-to-end encryption for all sensitive client documents and KYC records. Our infrastructure adheres to industry-standard compliance for healthcare and legal data protection.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-slate-900 mb-2">Can I setup WhatsApp automation for specific client types?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Absolutely. You can toggle automated reminders for specific client segments directly from your dashboard settings. Whether it's a medical follow-up or a legal deadline, the system handles the reminders automatically.</p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div id="contact" className="scroll-mt-24 p-8 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20"><i className="ph-light ph-headset text-9xl"></i></div>
          <h2 className="font-clash text-2xl font-semibold mb-4">Still need assistance?</h2>
          <p className="text-slate-300 text-sm mb-8 max-w-md">Our support team is available 24/7. Whether it's a technical issue or a feature question, we're here to guide you through it.</p>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl text-sm font-semibold transition-all">Submit a Ticket</button>
            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all">Start Live Chat</button>
          </div>
        </div>

        {/* Tutorials */}
        <div id="tutorials" className="scroll-mt-24">
          <h2 className="font-clash text-2xl font-semibold text-slate-950 mb-8 flex items-center gap-3">
            <i className="ph-light ph-video text-brand-600"></i> Video Tutorials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm group">
              <div className="h-40 bg-slate-200 flex items-center justify-center relative">
                <i className="ph-light ph-play-circle text-4xl text-slate-400 group-hover:text-brand-600 transition-colors"></i>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-slate-900 text-sm">Getting Started: Your First 10 Minutes</h4>
                <p className="text-xs text-slate-500 mt-1">Quick tour of the interface and setup process.</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm group">
              <div className="h-40 bg-slate-200 flex items-center justify-center relative">
                <i className="ph-light ph-play-circle text-4xl text-slate-400 group-hover:text-brand-600 transition-colors"></i>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-slate-900 text-sm">Mastering Tax Compliance & GST</h4>
                <p className="text-xs text-slate-500 mt-1">Deep dive into ledger exports and 12.5% taxation.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  {/* Footer */}
  <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 border-t border-slate-800">
    <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
        <div className="lg:col-span-4 space-y-6">
          <a href="#" onClick={() => router.push('/')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
              <i className="ph-light ph-squares-four text-2xl font-bold"></i>
            </div>
            <span className="font-clash font-semibold text-2xl tracking-tight text-white">Belize Professional<span className="text-indigo-400">.</span></span>
          </a>
          <p className="text-sm leading-relaxed text-slate-400">
            Belize's premier platform for professional service management with automated scheduling, client databases, and compliant tax outputs.
          </p>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">System App</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#" onClick={() => router.push('/')} className="hover:text-white transition-colors">Workspace Home</a></li>
            <li><a href="#" onClick={() => router.push('/features')} className="hover:text-white transition-colors">Features List</a></li>
          </ul>
        </div>
        <div className="lg:col-span-3 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resources</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#" onClick={() => router.push('/support')} className="hover:text-white transition-colors">Help Center</a></li>
            <li><a href="#" onClick={() => router.push('/support')} className="hover:text-white transition-colors">Submit a Ticket</a></li>
          </ul>
        </div>
        <div className="lg:col-span-3 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Practice Newsletter</h5>
          <div className="space-y-2">
            <input type="email" placeholder="professional@company.com" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors" />
            <button className="w-full py-2.5 bg-slate-800 text-white font-bold rounded-lg text-xs hover:bg-slate-700 transition-colors">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; 2024 Belize Professional. All rights reserved.</p>
      </div>
    </div>
  </footer>
        </div>
      </>
    );
}