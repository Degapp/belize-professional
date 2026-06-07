'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to an API
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', profession: '', message: '' });
    }, 3000);
  };

  return (
    <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased">
      {/* Top Banner */}
      <div className="bg-brand-900 text-brand-50 text-xs py-3 px-4 font-medium tracking-wide text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="bg-brand-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">CONTACT</span>
          <span>We're here to help. Phone: 501-6352720 | Cayo, Belize</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <i className="ph-light ph-squares-four text-2xl font-bold"></i>
            </div>
            <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Home</Link>
            <Link href="/features" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</Link>
            <Link href="/professionals" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Professionals</Link>
            <Link href="/pricing" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/about" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About Us</Link>
            <Link href="/contact" className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors py-2.5 px-4 rounded-xl hover:bg-slate-50">Log In</Link>
            <Link href="/signup" className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm rounded-xl transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl active:scale-[0.98]">
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 bg-gradient-to-br from-indigo-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="font-clash text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-slate-950 mb-6">
            Get in <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="font-clash text-2xl font-semibold text-slate-900 mb-6">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <i className="ph-light ph-phone text-brand-600 text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                      <p className="text-slate-600">501-6352720</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <i className="ph-light ph-map-pin text-brand-600 text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Location</h3>
                      <p className="text-slate-600">Cayo, Belize</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <i className="ph-light ph-clock text-brand-600 text-2xl"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Business Hours</h3>
                      <p className="text-slate-600">Mon-Fri: 8am - 6pm CST<br />Sat: 9am - 2pm CST</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-6 text-white">
                <h3 className="font-semibold text-lg mb-2">Need Immediate Help?</h3>
                <p className="text-brand-50 text-sm mb-4">Our support team is available during business hours to assist you.</p>
                <a href="tel:5016352720" className="inline-block w-full text-center px-6 py-3 bg-white text-brand-600 hover:bg-slate-50 font-semibold rounded-xl transition-all">
                  Call Now
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h2 className="font-clash text-2xl font-semibold text-slate-900 mb-6">Send us a Message</h2>
                
                {submitted && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <i className="ph-light ph-check-circle text-emerald-600 text-2xl"></i>
                    <div>
                      <p className="font-semibold text-emerald-900">Message sent successfully!</p>
                      <p className="text-sm text-emerald-700">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all"
                        placeholder="501-123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Profession
                      </label>
                      <select
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all"
                      >
                        <option value="">Select your profession</option>
                        <option value="attorney">Attorney</option>
                        <option value="doctor">Doctor</option>
                        <option value="accountant">Accountant</option>
                        <option value="other">Other Professional</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-600 focus:border-brand-600 outline-none transition-all resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    Send Message <i className="ph-light ph-paper-plane-tilt"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
                  <i className="ph-light ph-squares-four text-xl font-bold"></i>
                </div>
                <span className="font-clash font-semibold text-xl text-white">Belize Professional</span>
              </div>
              <p className="text-sm text-slate-400">The premier platform for Belize's elite professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/professionals" className="hover:text-white transition-colors">Professionals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><i className="ph-light ph-phone"></i> 501-6352720</li>
                <li className="flex items-center gap-2"><i className="ph-light ph-map-pin"></i> Cayo, Belize</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 Belize Professional. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
