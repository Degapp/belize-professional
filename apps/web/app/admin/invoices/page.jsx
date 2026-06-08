'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/admin/invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.professional_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inv.payment_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      paid: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'check-circle', label: 'Paid' },
      unpaid: { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'clock', label: 'Unpaid' },
      overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: 'warning', label: 'Overdue' }
    };
    return badges[status] || badges.unpaid;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <i className="ph-light ph-spinner text-4xl text-brand-600 animate-spin mb-4"></i>
          <p className="text-slate-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
  const paidAmount = invoices.filter(inv => inv.payment_status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);
  const unpaidAmount = invoices.filter(inv => inv.payment_status === 'unpaid').reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0);

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
              <p className="text-xs text-slate-400">Invoices Management</p>
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
            <Link href="/admin/invoices" className="text-sm font-semibold text-amber-400 border-b-2 border-amber-400 pb-1">
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-semibold mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs text-emerald-600 uppercase font-semibold mb-2">Paid</div>
              <div className="text-3xl font-bold text-emerald-600">${paidAmount.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-xs text-amber-600 uppercase font-semibold mb-2">Unpaid</div>
              <div className="text-3xl font-bold text-amber-600">${unpaidAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Page Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-clash text-2xl font-semibold text-slate-900 mb-2">Invoices</h2>
              <p className="text-slate-600">{filteredInvoices.length} invoices</p>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <i className="ph-light ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400"></i>
              <input
                type="text"
                placeholder="Search by invoice number, client, or professional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Professional</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((invoice) => {
                    const statusBadge = getStatusBadge(invoice.payment_status);
                    return (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{invoice.invoice_number}</div>
                          <div className="text-xs text-slate-500">Issued: {formatDate(invoice.issue_date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{invoice.client_name}</div>
                          <div className="text-xs text-slate-500">{invoice.client_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{invoice.professional_name}</div>
                          <div className="text-xs text-slate-500">{invoice.firm_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">${parseFloat(invoice.total_amount).toFixed(2)}</div>
                          <div className="text-xs text-slate-500">{invoice.currency}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{formatDate(invoice.due_date)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                            <i className={`ph-light ph-${statusBadge.icon}`}></i>
                            {statusBadge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <i className="ph-light ph-receipt text-6xl text-slate-300 mb-4"></i>
                <p className="text-slate-500">No invoices found</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
