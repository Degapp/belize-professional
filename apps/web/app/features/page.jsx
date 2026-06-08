'use client';

import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';

export default function FeaturesPage() {
  const features = [
    {
      icon: 'calendar-check',
      title: 'Smart Scheduling & Calendar Integration',
      description: 'Seamlessly sync with Google Calendar, automate appointment reminders via WhatsApp, and schedule Zoom or WhatsApp calls directly from the platform.',
      benefits: ['Two-way Google Calendar sync', 'Automated WhatsApp reminders', 'Zoom & WhatsApp call scheduling', 'Multi-timezone support']
    },
    {
      icon: 'file-text',
      title: 'Professional Invoicing & Time Tracking',
      description: 'Create branded invoices with your logo, track billable hours automatically, and calculate GST tax with precision—all in one unified system.',
      benefits: ['Custom branded invoices with logo', 'Automatic time tracking', '12.5% GST calculation & breakdown', 'Online payment integration']
    },
    {
      icon: 'users',
      title: 'Client Database & KYC Management',
      description: 'Maintain a secure, centralized client database with comprehensive KYC records, document storage, and complete interaction history.',
      benefits: ['Secure document storage', 'Complete client history tracking', 'Custom fields for each profession', 'Compliance-ready KYC records']
    },
    {
      icon: 'chart-line',
      title: 'Financial Analytics & GST Reporting',
      description: 'Comprehensive financial dashboards with daily, weekly, monthly, and yearly revenue analysis plus automated GST tax reports.',
      benefits: ['Revenue trend visualization', 'GST tax breakdown & reporting', 'Export for tax filing', 'Client revenue analytics']
    },
    {
      icon: 'bell-ringing',
      title: 'Automated Reminders & Notifications',
      description: 'Send automatic appointment reminders, payment follow-ups, and invoice notifications via WhatsApp and email—all on autopilot.',
      benefits: ['WhatsApp reminder automation', 'Email invoice delivery', 'Payment reminder workflows', 'Custom reminder scheduling']
    },
    {
      icon: 'credit-card',
      title: 'Online Payment Processing',
      description: 'Accept payments directly from invoices with secure online payment links, track payment status, and manage outstanding balances effortlessly.',
      benefits: ['Secure payment links', 'Real-time payment tracking', 'Multiple payment methods', 'Automated payment confirmations']
    }
  ];

  return (
    <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased">
      {/* Top Banner */}
      <div className="bg-brand-900 text-brand-50 text-xs py-3 px-4 font-medium tracking-wide text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="bg-brand-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">NEW</span>
          <span>Belize's Premier Professional Network. Phone: 501-6352720 | Cayo, Belize</span>
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
            <Link href="/features" className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">Features</Link>
            <Link href="/professionals" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Professionals</Link>
            <Link href="/pricing" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</Link>
            <Link href="/about" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About Us</Link>
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
          <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 px-4 py-2 rounded-full text-xs font-semibold text-slate-700 shadow-sm mb-8">
            <i className="ph-light ph-sparkle text-indigo-500 text-base"></i>
            <span>Everything you need to run your professional practice</span>
          </div>

          <h1 className="font-clash text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-slate-950 mb-6">
            Powerful Features for<br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">Exceptional Professionals</span>
          </h1>

          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            From intelligent scheduling to automated invoicing and comprehensive analytics—everything you need to deliver world-class service to your clients.
          </p>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <VideoPlayer 
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            poster="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=675&fit=crop&q=80"
            title="Features in Action"
            description="Watch how Belize Professional streamlines your daily workflow"
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-xl hover:border-indigo-200 transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mb-6">
                  <i className={`ph-light ph-${feature.icon} text-3xl`}></i>
                </div>
                <h3 className="font-clash text-2xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex items-start gap-3">
                      <i className="ph-light ph-check-circle text-brand-600 text-xl flex-shrink-0 mt-0.5"></i>
                      <span className="text-sm text-slate-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-clash text-4xl font-semibold text-slate-900 mb-4">Seamless Integrations</h2>
          <p className="text-lg text-slate-600 mb-12 max-w-2xl mx-auto">Connect with the tools you already use every day</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Google Calendar', icon: 'google-logo' },
              { name: 'WhatsApp', icon: 'whatsapp-logo' },
              { name: 'Zoom', icon: 'video-camera' },
              { name: 'Email', icon: 'envelope-simple' }
            ].map((integration, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 border border-slate-200 flex flex-col items-center gap-4 hover:shadow-lg transition-all">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                  <i className={`ph-light ph-${integration.icon} text-4xl text-slate-700`}></i>
                </div>
                <span className="font-semibold text-slate-900">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-clash text-4xl font-semibold mb-4">Ready to elevate your practice?</h2>
          <p className="text-xl text-brand-50 mb-8">Join Belize's leading professionals on our platform today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-white text-brand-600 hover:bg-slate-50 font-semibold rounded-xl text-base transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2">
              Start Free Trial <i className="ph-light ph-arrow-right"></i>
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 border border-white/20 text-white hover:bg-white/20 font-semibold rounded-xl text-base transition-all flex items-center justify-center gap-2">
              Contact Sales
            </Link>
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
