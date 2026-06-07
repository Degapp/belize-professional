'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Solo Professional',
      description: 'Perfect for individual practitioners',
      monthlyPrice: 49,
      yearlyPrice: 470,
      features: [
        'Up to 50 clients',
        'Unlimited appointments',
        'Google Calendar sync',
        'WhatsApp reminders',
        'Professional invoicing',
        'Time tracking',
        'GST reporting',
        'Email support'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Professional Team',
      description: 'For growing practices',
      monthlyPrice: 99,
      yearlyPrice: 950,
      features: [
        'Up to 500 clients',
        'Unlimited appointments',
        'Google Calendar sync',
        'WhatsApp & email automation',
        'Custom branded invoices',
        'Advanced time tracking',
        'GST & financial analytics',
        'Online payment processing',
        'Priority support',
        'Multi-user access (3 users)'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Enterprise',
      description: 'For large firms & organizations',
      monthlyPrice: null,
      yearlyPrice: null,
      features: [
        'Unlimited clients',
        'Unlimited users',
        'Everything in Professional Team',
        'Custom integrations',
        'Dedicated account manager',
        'White-label options',
        'Advanced security & compliance',
        'Custom training & onboarding',
        '24/7 premium support'
      ],
      cta: 'Contact Sales',
      highlighted: false
    }
  ];

  return (
    <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased">
      {/* Top Banner */}
      <div className="bg-brand-900 text-brand-50 text-xs py-3 px-4 font-medium tracking-wide text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="bg-brand-500/30 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">NEW</span>
          <span>14-day free trial. No credit card required. Cancel anytime.</span>
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
            <Link href="/pricing" className="relative py-2 text-sm font-semibold text-brand-600 transition-colors after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full">Pricing</Link>
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
      <section className="pt-16 pb-12 bg-gradient-to-br from-indigo-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="font-clash text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-slate-950 mb-6">
            Simple, Transparent <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-indigo-700 bg-clip-text text-transparent">Pricing</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Choose the perfect plan for your practice. All plans include 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-1.5 shadow-sm border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                billingCycle === 'yearly' 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`rounded-2xl p-8 ${
                  plan.highlighted 
                    ? 'bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-2xl scale-105 border-2 border-brand-500' 
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`font-clash text-2xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-brand-100' : 'text-slate-600'}`}>
                  {plan.description}
                </p>

                <div className="mb-8">
                  {plan.monthlyPrice ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                          ${billingCycle === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                        </span>
                        <span className={`${plan.highlighted ? 'text-brand-100' : 'text-slate-600'}`}>/month</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className={`text-sm mt-1 ${plan.highlighted ? 'text-brand-100' : 'text-slate-500'}`}>
                          Billed ${plan.yearlyPrice} annually
                        </p>
                      )}
                    </>
                  ) : (
                    <div className={`text-3xl font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>
                      Custom
                    </div>
                  )}
                </div>

                <Link 
                  href={plan.cta === 'Contact Sales' ? '/contact' : '/signup'}
                  className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all ${
                    plan.highlighted 
                      ? 'bg-white text-brand-600 hover:bg-slate-50 shadow-lg' 
                      : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md'
                  }`}
                >
                  {plan.cta}
                </Link>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start gap-3">
                      <i className={`ph-light ph-check-circle text-xl flex-shrink-0 ${
                        plan.highlighted ? 'text-white' : 'text-brand-600'
                      }`}></i>
                      <span className={`text-sm ${plan.highlighted ? 'text-brand-50' : 'text-slate-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="font-clash text-4xl font-semibold text-center text-slate-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Is there a free trial?',
                a: 'Yes! All plans include a 14-day free trial with full access to all features. No credit card required.'
              },
              {
                q: 'Can I change plans later?',
                a: 'Absolutely. You can upgrade or downgrade your plan at any time from your account settings.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, debit cards, and bank transfers for Enterprise plans.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes. We use bank-level encryption and are fully compliant with international data protection standards.'
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
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
