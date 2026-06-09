'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import VideoPlayer from '@/components/VideoPlayer';

function ClientHistorySection({ professionalId }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!professionalId) return;

    async function fetchClientHistory() {
      try {
        const response = await fetch(`/api/clients/history?professionalId=${professionalId}`);
        if (!response.ok) throw new Error('Failed to fetch client history');
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching client history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClientHistory();
  }, [professionalId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPaymentStatusInfo = (client) => {
    const totalPaid = parseFloat(client.total_paid) || 0;
    const totalBilled = parseFloat(client.total_billed) || 0;
    const totalOutstanding = parseFloat(client.total_outstanding) || 0;

    if (totalBilled === 0) {
      return { label: 'No Invoices', color: 'slate', icon: 'minus-circle' };
    }
    if (totalOutstanding === 0) {
      return { label: 'Fully Paid', color: 'emerald', icon: 'check-circle' };
    }
    if (totalPaid === 0) {
      return { label: 'All Pending', color: 'amber', icon: 'clock' };
    }
    return { label: 'Partial', color: 'blue', icon: 'info' };
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-500">
        <i className="ph-light ph-spinner text-2xl animate-spin"></i>
        <p className="mt-2 text-sm">Loading client history...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl">
        <i className="ph-light ph-users text-4xl text-slate-300 mb-3"></i>
        <p className="text-sm text-slate-500">No clients yet. Add your first client to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {clients.map((client) => {
        const statusInfo = getPaymentStatusInfo(client);
        const totalBilled = parseFloat(client.total_billed) || 0;
        const totalPaid = parseFloat(client.total_paid) || 0;
        const totalOutstanding = parseFloat(client.total_outstanding) || 0;
        
        return (
          <div 
            key={client.id} 
            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-slate-900">{client.full_name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <i className="ph-light ph-envelope"></i>
                    {client.email || 'No email'}
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <i className="ph-light ph-phone"></i>
                      {client.phone}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 text-lg">${totalBilled.toFixed(2)}</div>
                <div className="text-xs text-slate-500">Total Billed</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60">
              <div>
                <div className="text-xs text-slate-500 mb-1">Paid</div>
                <div className="font-semibold text-emerald-600">${totalPaid.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Outstanding</div>
                <div className="font-semibold text-amber-600">${totalOutstanding.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Invoices</div>
                <div className="font-semibold text-slate-700">{client.total_invoices}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <i className="ph-light ph-clock"></i>
                Last activity: {formatDate(client.last_interaction)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) return null;

  return (
    <>
      <div className="font-satoshi bg-slate-50/50 text-slate-900 antialiased min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/80">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
            
            <a href="#" onClick={() => router.push('/')} className="flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <i className="ph-light ph-squares-four text-2xl font-bold"></i>
              </div>
              <span className="font-clash font-semibold text-2xl tracking-tight text-slate-900">Belize Professional<span className="text-brand-600">.</span></span>
            </a>

            <nav className="hidden lg:flex items-center gap-8">
              <a href="#" onClick={() => router.push('/dashboard')} className="relative py-2 text-sm font-semibold text-brand-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full cursor-pointer">Dashboard</a>
              <a href="#" onClick={() => router.push('/analytics')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Analytics</a>
              <a href="#" onClick={() => router.push('/features')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Features</a>
              <Link href="/professionals" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">
                Professionals
              </Link>
              <Link href="/invoicing" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">
                Explore Interactive Invoicing
              </Link>
              <a href="#" onClick={() => router.push('/accounting')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Accounting</a>
              <a href="#" onClick={() => router.push('/support')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Support</a>
              <a href="#" onClick={() => router.push('/about')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">About Us</a>
            </nav>

            <div className="flex items-center gap-4">
              <button onClick={handleLogout} className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-sm rounded-xl transition-all">
                Log Out
              </button>
            </div>
          </div>
        </header>

        {/* Welcome Section */}
        <section className="pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="font-clash text-3xl lg:text-4xl font-semibold mb-2">Welcome back, {user.name || user.email}!</h1>
                  <p className="text-indigo-100">Here's your practice overview at a glance.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
                  <div className="text-xs text-indigo-200 uppercase tracking-wider mb-1">Email</div>
                  <div className="text-lg font-bold">{user.email}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Quick Stats */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <i className="ph-light ph-calendar-check text-xl"></i>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">This Week</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">12</div>
                  <div className="text-sm text-slate-500">Appointments</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <i className="ph-light ph-users text-xl"></i>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Active</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">48</div>
                  <div className="text-sm text-slate-500">Clients</div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <i className="ph-light ph-receipt text-xl"></i>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">5</div>
                  <div className="text-sm text-slate-500">Invoices</div>
                </div>
              </div>

              {/* Video Tutorials Section */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-clash text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <i className="ph-light ph-video text-brand-600"></i> Video Tutorials
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Learn how to make the most of your dashboard</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <VideoPlayer
                        src="/videos/getting-started.mp4"
                        autoPlay={false}
                        compact={true}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">4:32</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Getting Started Guide</h4>
                      <p className="text-xs text-slate-500">Your first 10 minutes with Belize Professional</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <VideoPlayer
                        src="/videos/appointments.mp4"
                        autoPlay={false}
                        compact={true}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">7:15</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Managing Appointments</h4>
                      <p className="text-xs text-slate-500">Schedule, sync, and automate reminders</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <VideoPlayer
                        src="/videos/invoices.mp4"
                        autoPlay={false}
                        compact={true}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">5:48</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Creating Invoices</h4>
                      <p className="text-xs text-slate-500">Professional billing with your branding</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <VideoPlayer
                        src="/videos/whatsapp.mp4"
                        autoPlay={false}
                        compact={true}
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">6:22</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">WhatsApp Integration</h4>
                      <p className="text-xs text-slate-500">Automated reminders and notifications</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <a href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-2">
                    Browse all tutorials <i className="ph-light ph-arrow-right"></i>
                  </a>
                </div>
              </div>

              {/* Client History Section */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-clash text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <i className="ph-light ph-users text-brand-600"></i> Client History
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Chronological view of all clients with billing details</p>
                  </div>
                </div>

                <ClientHistorySection professionalId={user?.id} />
              </div>

              {/* Invoices Section */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-clash text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <i className="ph-light ph-receipt text-brand-600"></i> Recent Invoices
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Track your billing and payments</p>
                  </div>
                  <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-all">
                    <i className="ph-light ph-plus mr-1"></i> Create Invoice
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Sample Invoice Items */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <i className="ph-light ph-check-circle text-xl"></i>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Invoice #1247</div>
                        <div className="text-xs text-slate-500">Client: Sarah Martinez · Feb 15, 2024</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">$1,437.50</div>
                      <div className="text-xs text-emerald-600 font-semibold">Paid</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                        <i className="ph-light ph-clock text-xl"></i>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Invoice #1246</div>
                        <div className="text-xs text-slate-500">Client: Marcus Chen · Feb 12, 2024</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">$2,125.00</div>
                      <div className="text-xs text-amber-600 font-semibold">Pending</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <i className="ph-light ph-check-circle text-xl"></i>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">Invoice #1245</div>
                        <div className="text-xs text-slate-500">Client: Elena Rodriguez · Feb 10, 2024</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">$875.00</div>
                      <div className="text-xs text-emerald-600 font-semibold">Paid</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <a href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-2">
                    View all invoices <i className="ph-light ph-arrow-right"></i>
                  </a>
                </div>
              </div>

            </div>

            {/* Right Column - Quick Actions & Calendar */}
            <div className="space-y-8">
              
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/calendar')}
                    className="w-full px-4 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-calendar-plus text-lg"></i>
                    New Appointment
                  </button>
                  <button 
                    onClick={() => router.push('/clients/new')}
                    className="w-full px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-user-plus text-lg"></i>
                    Add Client
                  </button>
                  <button 
                    onClick={() => router.push('/invoice-builder')}
                    className="w-full px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-file-plus text-lg"></i>
                    Create Invoice
                  </button>
                  <button 
                    onClick={() => router.push('/analytics')}
                    className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-chart-bar text-lg"></i>
                    View Analytics
                  </button>
                  <button 
                    onClick={() => router.push('/settings/integrations')}
                    className="w-full px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-gear text-lg"></i>
                    Settings
                  </button>
                  <button 
                    onClick={() => router.push('/settings/reminders')}
                    className="w-full px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-bell text-lg"></i>
                    Payment Reminders
                  </button>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Upcoming This Week</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-brand-50 rounded-lg border border-brand-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-xs text-brand-600 font-bold uppercase">Today, 2:30 PM</div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded font-semibold">Zoom</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">Dr. Julian Rodriguez</div>
                    <div className="text-xs text-slate-500 mt-1">Medical Consultation (45m)</div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-xs text-slate-500 font-bold uppercase">Tomorrow, 10:00 AM</div>
                      <span className="text-xs bg-teal-500/20 text-teal-700 px-2 py-0.5 rounded font-semibold">WhatsApp</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">Clara Bennett</div>
                    <div className="text-xs text-slate-500 mt-1">Legal Advisory (60m)</div>
                  </div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-gradient-to-br from-indigo-600 to-brand-600 rounded-2xl p-6 text-white">
                <i className="ph-light ph-headset text-3xl mb-3 opacity-80"></i>
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-indigo-100 mb-4">Our support team is available 24/7 to assist you.</p>
                <button className="w-full px-4 py-2.5 bg-white text-brand-700 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-all">
                  Contact Support
                </button>
              </div>

            </div>

          </div>
        </section>

      </div>
    </>
  );
}
