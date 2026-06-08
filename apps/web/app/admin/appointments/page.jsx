'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/admin/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt =>
    apt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.professional_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLocationBadge = (locationType) => {
    const badges = {
      in_person: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'map-pin', label: 'In Person' },
      zoom: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'video-camera', label: 'Zoom' },
      whatsapp_call: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'whatsapp-logo', label: 'WhatsApp' },
      phone: { bg: 'bg-slate-100', text: 'text-slate-700', icon: 'phone', label: 'Phone' }
    };
    return badges[locationType] || badges.in_person;
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Confirmed' },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
      completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Completed' }
    };
    return badges[status] || badges.pending;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <i className="ph-light ph-spinner text-4xl text-brand-600 animate-spin mb-4"></i>
          <p className="text-slate-600">Loading appointments...</p>
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
              <p className="text-xs text-slate-400">Appointments Management</p>
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
            <Link href="/admin/appointments" className="text-sm font-semibold text-amber-400 border-b-2 border-amber-400 pb-1">
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
              <h2 className="font-clash text-2xl font-semibold text-slate-900 mb-2">Appointments</h2>
              <p className="text-slate-600">{filteredAppointments.length} scheduled appointments</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <i className="ph-light ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400"></i>
              <input
                type="text"
                placeholder="Search by title, client, or professional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Appointments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAppointments.map((apt) => {
              const locationBadge = getLocationBadge(apt.location_type);
              const statusBadge = getStatusBadge(apt.status);
              
              return (
                <div key={apt.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">{apt.title}</h3>
                      {apt.description && (
                        <p className="text-sm text-slate-600 mb-3">{apt.description}</p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <i className="ph-light ph-calendar text-brand-600"></i>
                      <span className="font-semibold text-slate-700">{formatDateTime(apt.start_at)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <i className={`ph-light ph-${locationBadge.icon} text-${locationBadge.text.replace('text-', '')}`}></i>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${locationBadge.bg} ${locationBadge.text}`}>
                        {locationBadge.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Client</div>
                      <div className="font-semibold text-slate-900 text-sm">{apt.client_name}</div>
                      <div className="text-xs text-slate-500">{apt.client_email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Professional</div>
                      <div className="font-semibold text-slate-900 text-sm">{apt.professional_name}</div>
                      <div className="text-xs text-slate-500">{apt.firm_name}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <i className="ph-light ph-calendar text-6xl text-slate-300 mb-4"></i>
              <p className="text-slate-500">No appointments found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
