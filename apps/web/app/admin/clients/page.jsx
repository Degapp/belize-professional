'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients');
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.professional_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getKycBadge = (status) => {
    const badges = {
      verified: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'check-circle', label: 'Verified' },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'clock', label: 'Pending' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: 'x-circle', label: 'Rejected' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <i className="ph-light ph-spinner text-4xl text-brand-600 animate-spin mb-4"></i>
          <p className="text-slate-600">Loading clients...</p>
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
              <p className="text-xs text-slate-400">Clients Management</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/professionals" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Professionals
            </Link>
            <Link href="/admin/clients" className="text-sm font-semibold text-amber-400 border-b-2 border-amber-400 pb-1">
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

          <Link href="/admin" className="px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium text-sm rounded-xl transition-all">
            Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-clash text-2xl font-semibold text-slate-900 mb-2">Clients</h2>
              <p className="text-slate-600">{filteredClients.length} total clients</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <i className="ph-light ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400"></i>
              <input
                type="text"
                placeholder="Search by name, email, or professional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => {
              const kycBadge = getKycBadge(client.kyc_status);
              const totalPaid = parseFloat(client.total_paid) || 0;
              const totalOutstanding = parseFloat(client.total_outstanding) || 0;
              
              return (
                <div key={client.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 mb-1">{client.full_name}</div>
                      <div className="text-xs text-slate-500 mb-2">{client.email}</div>
                      <div className="text-xs text-slate-500">{client.phone}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${kycBadge.bg} ${kycBadge.text}`}>
                      <i className={`ph-light ph-${kycBadge.icon}`}></i>
                      {kycBadge.label}
                    </span>
                  </div>

                  <div className="mb-4 pb-4 border-b border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">Professional</div>
                    <div className="text-sm font-semibold text-slate-900">{client.professional_name}</div>
                    <div className="text-xs text-slate-500">{client.firm_name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Invoices</div>
                      <div className="font-semibold text-slate-900">{client.invoice_count}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Appointments</div>
                      <div className="font-semibold text-slate-900">{client.appointment_count}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Paid</div>
                      <div className="font-semibold text-emerald-600">${totalPaid.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Outstanding</div>
                      <div className="font-semibold text-amber-600">${totalOutstanding.toFixed(2)}</div>
                    </div>
                  </div>

                  {client.notes && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">Notes</div>
                      <div className="text-xs text-slate-700">{client.notes}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <i className="ph-light ph-users text-6xl text-slate-300 mb-4"></i>
              <p className="text-slate-500">No clients found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
