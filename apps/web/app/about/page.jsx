'use client';

import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';

export default function AboutPage() {
  const team = [
    {
      name: 'Dr. Marcus Chen',
      role: 'Chief Medical Officer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
    },
    {
      name: 'Sarah Thompson',
      role: 'Lead Attorney',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop'
    },
    {
      name: 'James Rodriguez',
      role: 'Senior Accountant',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    }
  ];

  const values = [
    {
      icon: 'shield-check',
      title: 'Security & Privacy',
      description: 'Bank-level encryption and compliance with international data protection standards.'
    },
    {
      icon: 'users-three',
      title: 'Professional Excellence',
      description: 'Built by professionals, for professionals who demand the highest standards.'
    },
    {
      icon: 'heart',
      title: 'Client-Centered',
      description: 'Every feature designed to enhance your client relationships and service delivery.'
    },
    {
      icon: 'lightbulb',
      title: 'Innovation',
      description: 'Continuously evolving with the latest technology to keep you ahead.'
    }
  ];

  return (
    <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased">
      {/* Top Banner */}
      <div className="bg-brand-900 text-brand-50 text-xs py-3 px-4 font-medium tracking-wide text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="bg-brand-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">ABOUT US</span>
          <span>Trusted by Belize's Leading Professionals. Phone: 501-6352720 | Cayo, Belize</span>
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
            <Link href="/about" className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">About Us</Link>
            <Link href="/contact" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Contact</Link>
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
      <section className="pt-16 pb-20 bg-gradient-to-br from-indigo-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="font-clash text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-slate-950 mb-6">
            Empowering Belize's <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">Professional Community</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We're on a mission to provide Belize's attorneys, doctors, and accountants with world-class tools to deliver exceptional service to their clients.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-clash text-3xl font-semibold text-slate-900 mb-3">See Our Platform in Action</h2>
            <p className="text-slate-600">Discover how we're transforming professional practice management in Belize</p>
          </div>
          <VideoPlayer 
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            poster="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=675&fit=crop&q=80"
            title="Our Story"
            description="Learn about our mission to empower Belize's professionals"
          />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-clash text-4xl font-semibold text-slate-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Belize Professional was born from a simple observation: Belize's most talented professionals were spending too much time on administrative work and not enough time serving their clients.
                </p>
                <p>
                  We set out to change that by building a comprehensive platform that handles scheduling, invoicing, client management, and compliance—all in one place, specifically designed for the Belizean professional landscape.
                </p>
                <p>
                  Today, we're proud to serve hundreds of attorneys, doctors, and accountants across Belize, helping them run more efficient practices and deliver better client experiences.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-12 text-white">
              <div className="space-y-8">
                <div>
                  <div className="text-5xl font-bold mb-2">500+</div>
                  <div className="text-brand-100">Active Professionals</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">50K+</div>
                  <div className="text-brand-100">Appointments Scheduled</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">$2M+</div>
                  <div className="text-brand-100">Invoices Processed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-clash text-4xl font-semibold text-center text-slate-900 mb-4">Our Values</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mb-4">
                  <i className={`ph-light ph-${value.icon} text-2xl`}></i>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-clash text-4xl font-semibold text-center text-slate-900 mb-4">Meet Our Advisory Team</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Industry experts guiding our platform development
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
                />
                <h3 className="font-semibold text-slate-900 text-lg">{member.name}</h3>
                <p className="text-slate-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-clash text-4xl font-semibold mb-4">Join Belize's Elite Professionals</h2>
          <p className="text-xl text-brand-50 mb-8">Start your free trial today and experience the difference.</p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-white text-brand-600 hover:bg-slate-50 font-semibold rounded-xl text-base transition-all shadow-lg active:scale-[0.98]">
            Get Started Free <i className="ph-light ph-arrow-right ml-2"></i>
          </Link>
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
