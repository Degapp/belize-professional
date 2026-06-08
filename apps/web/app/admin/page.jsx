'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalProfessionals: 0,
    totalClients: 0,
    totalInvoices: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    pendingInvoices: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [profRes, clientsRes, invoicesRes, apptRes] = await Promise.all([
        fetch('/api/admin/professionals'),
        fetch('/api/admin/clients'),
        fetch('/api/admin/invoices'),
        fetch('/api/admin/appointments')
      ]);

      const professionals = await profRes.json();
      const clients = await clientsRes.json();
      const invoices = await invoicesRes.json();
      const appointments = await apptRes.json();

      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
      const pendingInvoices = invoices.filter(inv => inv.payment_status === 'unpaid').length;

      setStats({
        totalProfessionals: professionals.length,
        totalClients: clients.length,
        totalInvoices: invoices.length,
        totalAppointments: appointments.length,
        totalRevenue,
        pendingInvoices
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 mx-auto mb-4 animate-pulse">
            <i className="ph-light ph-gear text-2xl font-bold"></i>
          </div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-satoshi bg-slate-50 min-h-screen">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <i className="ph-light ph-shield-check text-2xl font-bold"></i>
            </div>
            <div>
              <h1 className="font-clash font-semibold text-xl text-white">Admin Panel</h1>
              <p className="text-xs text-slate-400">Belize Professional</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold text-amber-400 border-b-2 border-amber-400 pb-1">
              Dashboard
            </Link>
            <Link href="/admin/professionals" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Professionals
            </Link>
            <Link href="/admin/clients" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Clients
            </Link>
            <Link href="/admin/invoices" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Invoices
            </Link>
            <Link href="/admin/appointments" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Appointments
            </Link>
            <Link href="/admin/analytics" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Analytics
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="px-4 py-2 bg-slate-700 text-slate-200 hover:bg-slate-600 font-medium text-sm rounded-xl transition-all">
              User View
            </Link>
            <button onClick={handleLogout} className="px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium text-sm rounded-xl transition-all">
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="font-clash text-2xl font-semibold text-slate-900 mb-2">System Overview</h2>
            <p className="text-slate-600">Real-time statistics across the platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <i className="ph-light ph-user-circle text-2xl"></i>
                </div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Total</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalProfessionals}</div>
              <div className="text-sm text-slate-600">Professionals</div>
              <Link href="/admin/professionals" className="mt-4 text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
                View all <i className="ph-light ph-arrow-right"></i>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white">
                  <i className="ph-light ph-users text-2xl"></i>
                </div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Total</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalClients}</div>
              <div className="text-sm text-slate-600">Clients</div>
              <Link href="/admin/clients" className="mt-4 text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                View all <i className="ph-light ph-arrow-right"></i>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                  <i className="ph-light ph-receipt text-2xl"></i>
                </div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Total</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalInvoices}</div>
              <div className="text-sm text-slate-600">Invoices</div>
              <Link href="/admin/invoices" className="mt-4 text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1">
                View all <i className="ph-light ph-arrow-right"></i>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
                  <i className="ph-light ph-calendar text-2xl"></i>
                </div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Total</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalAppointments}</div>
              <div className="text-sm text-slate-600">Appointments</div>
              <Link href="/admin/appointments" className="mt-4 text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
                View all <i className="ph-light ph-arrow-right"></i>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                  <i className="ph-light ph-currency-dollar text-2xl"></i>
                </div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Revenue</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">${stats.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-slate-600">Total Revenue</div>
              <Link href="/admin/analytics" className="mt-4 text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1">
                View analytics <i className="ph-light ph-arrow-right"></i>
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white">
                  <i className="ph-light ph-clock text-2xl"></i>
                </div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Pending</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stats.pendingInvoices}</div>
              <div className="text-sm text-slate-600">Unpaid Invoices</div>
              <Link href="/admin/invoices?status=unpaid" className="mt-4 text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
                Review pending <i className="ph-light ph-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="font-clash text-xl font-semibold text-slate-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/professionals" className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all flex items-center gap-3">
                <i className="ph-light ph-user-plus text-2xl text-blue-600"></i>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Add Professional</div>
                  <div className="text-xs text-slate-600">Create new user account</div>
                </div>
              </Link>

              <Link href="/admin/clients" className="p-4 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition-all flex items-center gap-3">
                <i className="ph-light ph-users text-2xl text-teal-600"></i>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Manage Clients</div>
                  <div className="text-xs text-slate-600">View and edit client data</div>
                </div>
              </Link>

              <Link href="/admin/analytics" className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-all flex items-center gap-3">
                <i className="ph-light ph-chart-bar text-2xl text-purple-600"></i>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">View Reports</div>
                  <div className="text-xs text-slate-600">Analytics and insights</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
