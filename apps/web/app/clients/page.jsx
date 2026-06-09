'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function ClientsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchClients();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        client.full_name?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.toLowerCase().includes(query) ||
        client.city?.toLowerCase().includes(query)
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients?professional_id=${user?.id || 1}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getKYCBadgeColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'incomplete': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <i className="ph-light ph-spinner text-4xl text-brand-600 animate-spin"></i>
          <p className="mt-4 text-slate-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
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
            <a href="#" onClick={() => router.push('/dashboard')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Dashboard</a>
            <a href="#" onClick={() => router.push('/analytics')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Analytics</a>
            <a href="#" onClick={() => router.push('/features')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Features</a>
            <a href="#" onClick={() => router.push('/professionals')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Professionals</a>
            <a href="#" onClick={() => router.push('/invoicing')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Explore Interactive Invoicing</a>
            <a href="#" onClick={() => router.push('/resources')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Resources</a>
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

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-clash text-4xl font-semibold text-slate-900 mb-2">Client Database</h1>
                <p className="text-slate-600">Manage your client information, case notes, and appointment history</p>
              </div>
              <button 
                onClick={() => router.push('/clients/new')}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
              >
                <i className="ph-light ph-user-plus text-lg"></i>
                Add Client
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <i className="ph-light ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
              <input
                type="text"
                placeholder="Search by name, email, phone, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Clients Content */}
          {filteredClients.length === 0 && !loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                <i className="ph-light ph-users text-4xl text-slate-400"></i>
              </div>
              <h3 className="font-clash text-2xl font-semibold text-slate-900 mb-3">
                {searchQuery ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search criteria or clear the search to see all clients.'
                  : 'Start building your client database by adding your first client. Track their information, case notes, and appointment history all in one place.'
                }
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => router.push('/clients/new')}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 inline-flex items-center gap-2"
                >
                  <i className="ph-light ph-user-plus text-lg"></i>
                  Add Your First Client
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Client</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">KYC Status</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Added</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredClients.map((client) => (
                      <tr 
                        key={client.id} 
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/clients/${client.id}`)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-100 to-indigo-100 flex items-center justify-center text-brand-700 font-semibold">
                              {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{client.full_name}</div>
                              {client.date_of_birth && (
                                <div className="text-xs text-slate-500">
                                  Born {formatDate(client.date_of_birth)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <i className="ph-light ph-envelope text-slate-400"></i>
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <i className="ph-light ph-phone text-slate-400"></i>
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {client.city && client.country ? (
                            <div className="flex items-center gap-2">
                              <i className="ph-light ph-map-pin text-slate-400"></i>
                              {client.city}, {client.country}
                            </div>
                          ) : (
                            <span className="text-slate-400">Not specified</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getKYCBadgeColor(client.kyc_status)}`}>
                            {client.kyc_status === 'verified' && <i className="ph-fill ph-check-circle"></i>}
                            {client.kyc_status === 'pending' && <i className="ph-fill ph-clock"></i>}
                            {client.kyc_status === 'incomplete' && <i className="ph-fill ph-warning-circle"></i>}
                            {client.kyc_status?.charAt(0).toUpperCase() + client.kyc_status?.slice(1) || 'Pending'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {formatDate(client.created_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/clients/${client.id}`);
                            }}
                            className="text-brand-600 hover:text-brand-700 font-semibold text-sm"
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Results Count */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{filteredClients.length}</span> {filteredClients.length === 1 ? 'client' : 'clients'}
                  {searchQuery && <span> matching "{searchQuery}"</span>}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
