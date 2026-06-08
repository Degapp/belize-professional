'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminProfessionals() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch('/api/admin/professionals');
      const data = await response.json();
      setProfessionals(data);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessionals = professionals.filter(prof =>
    prof.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.firm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadge = (category) => {
    const badges = {
      attorney: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Attorney' },
      doctor: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Doctor' },
      accountant: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Accountant' },
      professional: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Professional' }
    };
    return badges[category] || badges.professional;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <i className="ph-light ph-spinner text-4xl text-brand-600 animate-spin mb-4"></i>
          <p className="text-slate-600">Loading professionals...</p>
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
              <p className="text-xs text-slate-400">Professionals Management</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/professionals" className="text-sm font-semibold text-amber-400 border-b-2 border-amber-400 pb-1">
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
              <h2 className="font-clash text-2xl font-semibold text-slate-900 mb-2">Professionals</h2>
              <p className="text-slate-600">{filteredProfessionals.length} registered professionals</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <i className="ph-light ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400"></i>
              <input
                type="text"
                placeholder="Search by name, firm, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Professionals Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Professional</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Hourly Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfessionals.map((prof) => {
                    const badge = getCategoryBadge(prof.category);
                    return (
                      <tr key={prof.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                              {prof.display_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{prof.display_name}</div>
                              <div className="text-xs text-slate-500">{prof.firm_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900">{prof.email}</div>
                          <div className="text-xs text-slate-500">{prof.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">${prof.hourly_rate}</div>
                          <div className="text-xs text-slate-500">per hour</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-4 text-xs">
                            <div>
                              <span className="text-slate-500">Clients:</span>{' '}
                              <span className="font-semibold text-slate-900">{prof.client_count}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Invoices:</span>{' '}
                              <span className="font-semibold text-slate-900">{prof.invoice_count}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {prof.zoom_enabled && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">Zoom</span>
                            )}
                            {prof.whatsapp_enabled && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-semibold">WhatsApp</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredProfessionals.length === 0 && (
              <div className="text-center py-12">
                <i className="ph-light ph-user-circle text-6xl text-slate-300 mb-4"></i>
                <p className="text-slate-500">No professionals found</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
