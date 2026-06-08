'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    revenueByProfessional: [],
    invoicesByStatus: { paid: 0, unpaid: 0, overdue: 0 },
    appointmentsByType: { in_person: 0, zoom: 0, whatsapp_call: 0, phone: 0 },
    clientsByProfessional: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [profRes, invoicesRes, apptRes] = await Promise.all([
        fetch('/api/admin/professionals'),
        fetch('/api/admin/invoices'),
        fetch('/api/admin/appointments')
      ]);

      const professionals = await profRes.json();
      const invoices = await invoicesRes.json();
      const appointments = await apptRes.json();

      // Revenue by professional
      const revenueByProf = professionals.map(prof => {
        const profInvoices = invoices.filter(inv => inv.professional_id === prof.id);
        const totalRevenue = profInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
        return {
          name: prof.display_name,
          revenue: totalRevenue,
          invoiceCount: profInvoices.length
        };
      }).sort((a, b) => b.revenue - a.revenue);

      // Invoices by status
      const invoicesByStatus = {
        paid: invoices.filter(inv => inv.payment_status === 'paid').length,
        unpaid: invoices.filter(inv => inv.payment_status === 'unpaid').length,
        overdue: invoices.filter(inv => inv.payment_status === 'overdue').length
      };

      // Appointments by type
      const appointmentsByType = {
        in_person: appointments.filter(apt => apt.location_type === 'in_person').length,
        zoom: appointments.filter(apt => apt.location_type === 'zoom').length,
        whatsapp_call: appointments.filter(apt => apt.location_type === 'whatsapp_call').length,
        phone: appointments.filter(apt => apt.location_type === 'phone').length
      };

      setAnalytics({
        revenueByProfessional: revenueByProf,
        invoicesByStatus,
        appointmentsByType,
        clientsByProfessional: professionals.map(p => ({ name: p.display_name, count: p.client_count })),
        monthlyRevenue: []
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <i className="ph-light ph-spinner text-4xl text-brand-600 animate-spin mb-4"></i>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = analytics.revenueByProfessional.reduce((sum, p) => sum + p.revenue, 0);

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
              <p className="text-xs text-slate-400">Analytics & Reports</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
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
            <Link href="/admin/analytics" className="text-sm font-semibold text-amber-400 border-b-2 border-amber-400 pb-1">
              Analytics
            </Link>
          </nav>

          <Link href="/admin" className="px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium text-sm rounded-xl transition-all">
            Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-clash text-2xl font-semibold text-slate-900 mb-8">Analytics Dashboard</h2>

          {/* Revenue by Professional */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8">
            <h3 className="font-clash text-xl font-semibold text-slate-900 mb-6">Revenue by Professional</h3>
            <div className="space-y-4">
              {analytics.revenueByProfessional.map((prof, index) => {
                const percentage = totalRevenue > 0 ? (prof.revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">{prof.name}</span>
                      <span className="text-sm text-slate-600">${prof.revenue.toFixed(2)} ({prof.invoiceCount} invoices)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Invoice Status Distribution */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-clash text-xl font-semibold text-slate-900 mb-6">Invoice Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                      <i className="ph-light ph-check-circle text-xl"></i>
                    </div>
                    <span className="font-semibold text-slate-900">Paid</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{analytics.invoicesByStatus.paid}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white">
                      <i className="ph-light ph-clock text-xl"></i>
                    </div>
                    <span className="font-semibold text-slate-900">Unpaid</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">{analytics.invoicesByStatus.unpaid}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white">
                      <i className="ph-light ph-warning text-xl"></i>
                    </div>
                    <span className="font-semibold text-slate-900">Overdue</span>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{analytics.invoicesByStatus.overdue}</span>
                </div>
              </div>
            </div>

            {/* Appointment Types */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-clash text-xl font-semibold text-slate-900 mb-6">Appointment Types</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                      <i className="ph-light ph-map-pin text-xl"></i>
                    </div>
                    <span className="font-semibold text-slate-900">In Person</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{analytics.appointmentsByType.in_person}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                      <i className="ph-light ph-video-camera text-xl"></i>
                    </div>
                    <span className="font-semibold text-slate-900">Zoom</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{analytics.appointmentsByType.zoom}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                      <i className="ph-light ph-whatsapp-logo text-xl"></i>
                    </div>
                    <span className="font-semibold text-slate-900">WhatsApp</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">{analytics.appointmentsByType.whatsapp_call}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-500 flex items-center justify-center text-white">
                      <i className="ph-light ph-phone text-xl"></i>
                    </div>
                    <span className="font-semibold text-slate-900">Phone</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-600">{analytics.appointmentsByType.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
