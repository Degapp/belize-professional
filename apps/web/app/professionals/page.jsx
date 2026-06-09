'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfessionalsPage() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    async function fetchProfessionals() {
      try {
        setLoading(true);
        const url = activeCategory === 'all' 
          ? '/api/professionals' 
          : `/api/professionals?category=${activeCategory}`;
        const res = await fetch(url);
        const data = await res.json();
        setProfessionals(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching professionals:', error);
        setProfessionals([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProfessionals();
  }, [activeCategory]);

  const handleViewFullDirectory = () => {
    setActiveCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryColor = (category) => {
    const colors = {
      attorney: { from: 'amber-50', to: 'amber-100/50', badge: 'amber-700', badgeBg: 'amber-100', tag: 'amber-50', tagText: 'amber-700' },
      doctor: { from: 'blue-50', to: 'blue-100/50', badge: 'blue-700', badgeBg: 'blue-100', tag: 'blue-50', tagText: 'blue-700' },
      accountant: { from: 'teal-50', to: 'teal-100/50', badge: 'teal-700', badgeBg: 'teal-100', tag: 'teal-50', tagText: 'teal-700' },
      consultant: { from: 'purple-50', to: 'purple-100/50', badge: 'purple-700', badgeBg: 'purple-100', tag: 'purple-50', tagText: 'purple-700' },
      engineer: { from: 'orange-50', to: 'orange-100/50', badge: 'orange-700', badgeBg: 'orange-100', tag: 'orange-50', tagText: 'orange-700' }
    };
    return colors[category] || colors.attorney;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      attorney: 'ph-scales',
      doctor: 'ph-stethoscope',
      accountant: 'ph-calculator',
      consultant: 'ph-briefcase',
      engineer: 'ph-hammer'
    };
    return icons[category] || 'ph-briefcase';
  };

  const getCategoryLabel = (category) => {
    const labels = {
      attorney: 'Attorney & Counsel',
      doctor: 'Medical Doctor',
      accountant: 'CPA Accountant',
      consultant: 'Business Consultant',
      engineer: 'Civil Engineer'
    };
    return labels[category] || category;
  };

    return (
      <>
        <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased overflow-x-hidden selection:bg-brand-100 selection:text-brand-900">
          {/* Ambient Light Blobs */}
  <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-indigo-100/30 rounded-full glow-blob -z-10"></div>
  <div className="absolute top-[40vh] left-[-10vw] w-[40vw] h-[40vw] bg-teal-50/40 rounded-full glow-blob -z-10"></div>

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
        <a onClick={() => router.push('/dashboard')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Dashboard</a>
        <a onClick={() => router.push('/analytics')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Analytics</a>
        <a onClick={() => router.push('/features')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Features</a>
        <a onClick={() => router.push('/professionals')} className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full cursor-pointer">Professionals</a>
        <a onClick={() => router.push('/invoicing')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Explore Interactive Invoicing</a>
        <a onClick={() => router.push('/resources')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Resources</a>
        <a onClick={() => router.push('/accounting')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Accounting</a>
        <a onClick={() => router.push('/support')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Support</a>
        <a onClick={() => router.push('/about')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">About Us</a>
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
  <section className="pt-12 pb-20 lg:pt-16 lg:pb-24 relative">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
        <h1 className="font-clash text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-slate-950">
          Connect with Belize's <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">Elite Professionals</span>
        </h1>

        <p className="text-lg text-slate-600 font-normal leading-relaxed">
          Browse and book consultations with top-rated attorneys, doctors, accountants, consultants, and engineers across Belize. Real-time availability, transparent rates, and 15% service fee.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <input type="text" placeholder="Search professionals by name or firm..." className="w-full px-5 py-3.5 border border-slate-200 rounded-xl text-base focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all" />
            <i className="ph-light ph-magnifying-glass absolute right-4 top-3.5 text-slate-400 text-xl"></i>
          </div>
          <button className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
            <i className="ph-light ph-funnel text-lg"></i> Filter
          </button>
        </div>
      </div>

    </div>
  </section>

  {/* Category Filter Tabs */}
  <section className="py-8 bg-white border-b border-slate-200/60">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveCategory('all')}
          className={`px-6 py-2.5 font-semibold rounded-xl text-sm whitespace-nowrap transition-all ${
            activeCategory === 'all' 
              ? 'bg-brand-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Categories
        </button>
        <button 
          onClick={() => setActiveCategory('attorney')}
          className={`px-6 py-2.5 font-semibold rounded-xl text-sm whitespace-nowrap transition-all ${
            activeCategory === 'attorney' 
              ? 'bg-brand-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <i className="ph-light ph-scales mr-1.5"></i> Attorneys
        </button>
        <button 
          onClick={() => setActiveCategory('doctor')}
          className={`px-6 py-2.5 font-semibold rounded-xl text-sm whitespace-nowrap transition-all ${
            activeCategory === 'doctor' 
              ? 'bg-brand-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <i className="ph-light ph-stethoscope mr-1.5"></i> Doctors
        </button>
        <button 
          onClick={() => setActiveCategory('accountant')}
          className={`px-6 py-2.5 font-semibold rounded-xl text-sm whitespace-nowrap transition-all ${
            activeCategory === 'accountant' 
              ? 'bg-brand-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <i className="ph-light ph-calculator mr-1.5"></i> Accountants
        </button>
        <button 
          onClick={() => setActiveCategory('consultant')}
          className={`px-6 py-2.5 font-semibold rounded-xl text-sm whitespace-nowrap transition-all ${
            activeCategory === 'consultant' 
              ? 'bg-brand-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <i className="ph-light ph-briefcase mr-1.5"></i> Consultants
        </button>
        <button 
          onClick={() => setActiveCategory('engineer')}
          className={`px-6 py-2.5 font-semibold rounded-xl text-sm whitespace-nowrap transition-all ${
            activeCategory === 'engineer' 
              ? 'bg-brand-600 text-white' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <i className="ph-light ph-hammer mr-1.5"></i> Engineers
        </button>
      </div>

    </div>
  </section>

  {/* Professionals Grid */}
  <section className="py-16 lg:py-24">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      
      {/* Category Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          {activeCategory === 'all' 
            ? 'All Professionals' 
            : activeCategory === 'attorney' ? 'Attorneys & Lawyers'
            : activeCategory === 'doctor' ? 'Medical Doctors'
            : activeCategory === 'accountant' ? 'CPA Accountants'
            : activeCategory === 'consultant' ? 'Business Consultants'
            : activeCategory === 'engineer' ? 'Civil Engineers'
            : 'Professionals'}
        </h2>
        <p className="text-slate-600 mt-1">
          {loading ? 'Loading...' : `${professionals.length} professional${professionals.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-600">Loading professionals...</p>
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ph-light ph-users text-4xl text-slate-400"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No professionals found</h3>
          <p className="text-slate-600 mb-6">
            {activeCategory === 'all' 
              ? 'No professionals available in the directory yet.' 
              : `No ${activeCategory}s found. Try browsing all categories.`}
          </p>
          {activeCategory !== 'all' && (
            <button 
              onClick={() => setActiveCategory('all')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              View All Categories
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {Array.isArray(professionals) ? professionals.map((prof) => {
          const colors = getCategoryColor(prof.category);
          const icon = getCategoryIcon(prof.category);
          const label = getCategoryLabel(prof.category);
          const isAvailable = Math.random() > 0.3;
          const rating = 4 + Math.random();
          const reviewCount = Math.floor(Math.random() * 150) + 20;
          const stars = Math.floor(rating);

          return (
            <div key={prof.id} className="professional-card bg-white rounded-2xl border border-slate-200/80 shadow-luxury overflow-hidden hover:shadow-luxury-hover">
              <div className={`relative bg-gradient-to-r from-${colors.from} to-${colors.to} p-6 pb-20`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block text-xs font-bold uppercase tracking-wider text-${colors.badge} bg-${colors.badgeBg} px-3 py-1 rounded-full mb-3`}>
                      <i className={`ph-light ${icon} mr-1`}></i> {label}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{prof.display_name || 'Professional'}</h3>
                    <p className="text-sm text-slate-500 mt-1">{prof.firm_name || 'Firm'}</p>
                  </div>
                  <span className="badge-premium w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg">★</span>
                </div>

                <div className="absolute bottom-4 left-6">
                  <span className={`availability-badge ${isAvailable ? 'available' : 'busy'}`}>
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-600' : 'bg-red-600'}`}></span> {isAvailable ? 'Available Today' : 'Busy - Next slot tomorrow'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`ph-light ph-star-fill ${i < stars ? 'text-amber-500' : 'text-slate-300'} text-base`}></i>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-slate-600">({reviewCount} reviews)</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs bg-${colors.tag} text-${colors.tagText} px-2.5 py-1 rounded-lg font-medium`}>General</span>
                    <span className={`text-xs bg-${colors.tag} text-${colors.tagText} px-2.5 py-1 rounded-lg font-medium`}>Consulting</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Consultation Rate</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">${prof.hourly_rate || 250}</span>
                    <span className="text-xs text-slate-500">per hour</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">+ {prof.service_fee_percent || 15}% Belize Professional service fee</p>
                </div>

                <div className="space-y-2">
                  {prof.zoom_enabled && (
                    <button className="w-full px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                      <i className="ph-light ph-video-camera"></i> Schedule Zoom Call
                    </button>
                  )}
                  {prof.whatsapp_enabled && (
                    <button className="w-full px-4 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                      <i className="ph-light ph-whatsapp-logo"></i> WhatsApp Consultation
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-500 text-center border-t border-slate-100 pt-3">
                  📞 {prof.city || 'Cayo'}, {prof.country || 'Belize'}
                </div>
              </div>
            </div>
          );
        }) : null}

        {/* View Full Directory CTA (only shown when filtering by category) */}
        {activeCategory !== 'all' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-luxury overflow-hidden flex flex-col items-center justify-center p-8 text-center hover:shadow-luxury-hover transition-all group">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 group-hover:bg-brand-50 flex items-center justify-center mb-6 transition-colors">
              <i className="ph-light ph-users text-3xl text-slate-400 group-hover:text-brand-600"></i>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-3">View All Professionals</h3>
            <p className="text-sm text-slate-500 mb-6">Browse professionals across all categories</p>
            
            <button 
              onClick={handleViewFullDirectory} 
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all w-full"
            >
              View Full Directory
            </button>
          </div>
        )}

      </div>
      )}
      
    </div>
  </section>

  {/* How It Works Section */}
  <section className="py-16 lg:py-24 bg-white border-y border-slate-200/60">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h2 className="font-clash text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Book a consultation in 3 simple steps
        </h2>
        <p className="text-lg text-slate-500">
          Connect with Belize's top professionals instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="relative">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-brand-600">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Browse & Select</h3>
            <p className="text-slate-600 leading-relaxed">
              Search for professionals by category, specialty, or name. Check real-time availability and rates.
            </p>
          </div>
          <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-brand-600 to-transparent"></div>
        </div>

        {/* Step 2 */}
        <div className="relative">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-brand-600">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Choose Your Method</h3>
            <p className="text-slate-600 leading-relaxed">
              Select Zoom video call or WhatsApp chat. Pick your preferred time slot from available hours.
            </p>
          </div>
          <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-brand-600 to-transparent"></div>
        </div>

        {/* Step 3 */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-brand-600">
            3
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Connect & Pay</h3>
          <p className="text-slate-600 leading-relaxed">
            Complete your consultation. Automatic invoice sent via WhatsApp with secure online payment.
          </p>
        </div>
      </div>

    </div>
  </section>

  {/* Subscription Model Section */}
  <section className="py-16 lg:py-24 bg-slate-50">
    <div className="max-w-7xl mx-auto px-6 lg:px-8">
      
      <div className="max-w-2xl mx-auto text-center space-y-6 mb-12">
        <h2 className="font-clash text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
          Affordable monthly subscription for professionals
        </h2>
        <p className="text-lg text-slate-600">
          Grow your practice with premium listing and online consultation tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Starter Plan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-luxury p-8 space-y-6 hover:shadow-luxury-hover transition-all">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
            <p className="text-sm text-slate-600">Perfect for new practitioners</p>
          </div>
          
          <div>
            <span className="text-4xl font-bold text-slate-900">$99</span>
            <span className="text-slate-600 ml-2">/ month</span>
          </div>

          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Professional profile listing</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Up to 10 Zoom slots/month</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>WhatsApp integration</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Basic invoicing</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-x text-slate-300"></i>
              <span>KYC storage (basic)</span>
            </li>
          </ul>

          <button className="w-full px-6 py-3 border-2 border-slate-200 hover:border-brand-600 text-slate-700 hover:text-brand-600 font-semibold rounded-xl transition-all">
            Get Started
          </button>
        </div>

        {/* Professional Plan */}
        <div className="bg-white rounded-2xl border-2 border-brand-600 shadow-luxury p-8 space-y-6 hover:shadow-luxury-hover transition-all relative scale-105">
          <div className="absolute -top-4 left-6">
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
              Most Popular
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Professional</h3>
            <p className="text-sm text-slate-600">For established practices</p>
          </div>
          
          <div>
            <span className="text-4xl font-bold text-slate-900">$299</span>
            <span className="text-slate-600 ml-2">/ month</span>
          </div>

          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Premium profile with logo</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Unlimited Zoom bookings</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>WhatsApp + Email integration</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Advanced invoicing & GST</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Unlimited KYC records</span>
            </li>
          </ul>

          <button className="w-full px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all">
            Subscribe Now
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-luxury p-8 space-y-6 hover:shadow-luxury-hover transition-all">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
            <p className="text-sm text-slate-600">For firms & group practices</p>
          </div>
          
          <div>
            <span className="text-4xl font-bold text-slate-900">Custom</span>
            <span className="text-slate-600 ml-2">/ month</span>
          </div>

          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Multiple team members</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Advanced analytics & reports</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Priority support & training</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>Custom integrations</span>
            </li>
            <li className="flex items-center gap-3">
              <i className="ph-light ph-check text-emerald-600 font-bold"></i>
              <span>White-label options</span>
            </li>
          </ul>

          <button className="w-full px-6 py-3 border-2 border-slate-200 hover:border-brand-600 text-slate-700 hover:text-brand-600 font-semibold rounded-xl transition-all">
            Contact Sales
          </button>
        </div>

      </div>

      <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200/80 text-center">
        <p className="text-slate-700 font-medium">
          💰 <strong>Service Fee:</strong> Belize Professional takes a 15% commission on every consultation completed through our platform to maintain our service and support.
        </p>
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
          <p className="text-sm leading-relaxed text-slate-400">
            Belize's premier platform connecting elite professionals with high-net-worth clients. Phone: 501-6352720
          </p>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">For Clients</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="#professionals" className="hover:text-white transition-colors">Find Professionals</a></li>
            <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
            <li><a href="#pricing" className="hover:text-white transition-colors">For Professionals</a></li>
          </ul>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Resources</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="/support" className="hover:text-white transition-colors">Support</a></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
        <p>© 2024 Belize Professional. All rights reserved.</p>
      </div>

    </div>
  </footer>

        </div>
      </>
    );
  }