'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ClientDetailPage({ params }) {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Time tracking state
  const [timeEntries, setTimeEntries] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [manualHours, setManualHours] = useState('');
  const [manualMinutes, setManualMinutes] = useState('');
  const [timeNotes, setTimeNotes] = useState('');
  const [savingTime, setSavingTime] = useState(false);

  useEffect(() => {
    const fetchClientData = async () => {
      const resolvedParams = await params;
      try {
        setLoading(true);
        const response = await fetch(`/api/clients/${resolvedParams.id}`);
        if (!response.ok) throw new Error('Failed to fetch client');
        const data = await response.json();
        setClientData(data);

        // Fetch payment history
        const paymentRes = await fetch(
          `/api/clients/payment-history?client_id=${resolvedParams.id}&professional_id=${user?.id || 1}`
        );
        if (paymentRes.ok) {
          const paymentData = await paymentRes.json();
          setPaymentHistory(paymentData);
        }

        // Fetch documents
        const docsRes = await fetch(`/api/clients/${resolvedParams.id}/documents`);
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setDocuments(docsData);
        }

        // Fetch time entries
        const timeRes = await fetch(
          `/api/time-entries?professional_id=${user?.id || 1}&client_id=${resolvedParams.id}`
        );
        if (timeRes.ok) {
          const timeData = await timeRes.json();
          setTimeEntries(timeData);
        }
      } catch (error) {
        console.error('Error fetching client:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [params, user]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timerStart) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timerStart) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerStart]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

  const getKYCBadgeColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'incomplete': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-slate-100 text-slate-700';
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        // Upload file
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('File upload failed');
        }

        const uploadData = await uploadRes.json();

        // Save document record
        const resolvedParams = await params;
        const docRes = await fetch(`/api/clients/${resolvedParams.id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_name: file.name,
            file_path: uploadData.url,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: user?.id || null,
          }),
        });

        if (docRes.ok) {
          const newDoc = await docRes.json();
          setDocuments([newDoc, ...documents]);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const resolvedParams = await params;
      const res = await fetch(
        `/api/clients/${resolvedParams.id}/documents?document_id=${documentId}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        setDocuments(documents.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'ph-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'ph-file-doc';
    if (fileType.includes('image')) return 'ph-file-image';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'ph-file-xls';
    return 'ph-file';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTimerDisplay = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setTimerStart(Date.now());
    setIsTimerRunning(true);
    setElapsedSeconds(0);
  };

  const handleStopTimer = async () => {
    if (!timerStart) return;
    
    setIsTimerRunning(false);
    const hoursWorked = elapsedSeconds / 3600; // Convert seconds to hours
    
    // Save the timer entry
    await saveTimeEntry(hoursWorked, 'Timer entry');
    
    // Reset timer
    setTimerStart(null);
    setElapsedSeconds(0);
  };

  const handleSaveManualEntry = async () => {
    const hours = parseInt(manualHours) || 0;
    const minutes = parseInt(manualMinutes) || 0;
    
    if (hours === 0 && minutes === 0) {
      alert('Please enter hours or minutes');
      return;
    }
    
    const totalHours = hours + (minutes / 60);
    await saveTimeEntry(totalHours, timeNotes || 'Manual time entry');
    
    // Reset form
    setManualHours('');
    setManualMinutes('');
    setTimeNotes('');
  };

  const saveTimeEntry = async (hoursWorked, description) => {
    setSavingTime(true);
    try {
      const resolvedParams = await params;
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: user?.id || 1,
          client_id: parseInt(resolvedParams.id),
          description,
          work_date: new Date().toISOString().split('T')[0],
          hours_worked: hoursWorked,
          hourly_rate: 100, // Default rate, should come from professional settings
          billable: true
        })
      });

      if (response.ok) {
        const newEntry = await response.json();
        setTimeEntries([newEntry, ...timeEntries]);
      } else {
        throw new Error('Failed to save time entry');
      }
    } catch (error) {
      console.error('Error saving time entry:', error);
      alert('Error saving time entry. Please try again.');
    } finally {
      setSavingTime(false);
    }
  };

  const handleDeleteTimeEntry = async (entryId) => {
    if (!confirm('Delete this time entry?')) return;
    
    try {
      const response = await fetch(`/api/time-entries/${entryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTimeEntries(timeEntries.filter(entry => entry.id !== entryId));
      } else {
        throw new Error('Failed to delete time entry');
      }
    } catch (error) {
      console.error('Error deleting time entry:', error);
      alert('Error deleting time entry. Please try again.');
    }
  };

  const calculateTotalHours = () => {
    return timeEntries.reduce((total, entry) => {
      return total + parseFloat(entry.hours_worked || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <i className="ph-light ph-spinner text-4xl text-brand-600 animate-spin"></i>
          <p className="mt-4 text-slate-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <p className="text-slate-600">Client not found</p>
      </div>
    );
  }

  const { client, appointments, invoices, cases } = clientData;
  const customFields = typeof client.custom_fields === 'string' 
    ? JSON.parse(client.custom_fields) 
    : client.custom_fields || {};

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
          {/* Breadcrumb */}
          <div className="mb-6">
            <button 
              onClick={() => router.push('/clients')}
              className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-2"
            >
              <i className="ph-light ph-arrow-left"></i>
              Back to Clients
            </button>
          </div>

          {/* Client Header */}
          <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                  {client.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h1 className="font-clash text-3xl font-semibold mb-2">{client.full_name}</h1>
                  <div className="flex items-center gap-4 text-indigo-100">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <i className="ph-light ph-envelope"></i>
                        {client.email}
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <i className="ph-light ph-phone"></i>
                        {client.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                client.kyc_status === 'verified' ? 'bg-emerald-500/20 text-emerald-100' :
                client.kyc_status === 'pending' ? 'bg-amber-500/20 text-amber-100' :
                'bg-slate-500/20 text-slate-100'
              }`}>
                KYC: {client.kyc_status?.charAt(0).toUpperCase() + client.kyc_status?.slice(1)}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm mb-8">
            <div className="flex border-b border-slate-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'overview'
                    ? 'text-brand-600 border-brand-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <i className="ph-light ph-info mr-2"></i>
                Overview
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'appointments'
                    ? 'text-brand-600 border-brand-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <i className="ph-light ph-calendar mr-2"></i>
                Appointments ({appointments?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'invoices'
                    ? 'text-brand-600 border-brand-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <i className="ph-light ph-receipt mr-2"></i>
                Invoices ({invoices?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'cases'
                    ? 'text-brand-600 border-brand-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <i className="ph-light ph-folder mr-2"></i>
                Cases ({cases?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'payments'
                    ? 'text-brand-600 border-brand-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <i className="ph-light ph-credit-card mr-2"></i>
                Payment History
              </button>
              <button
                onClick={() => setActiveTab('time-tracking')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'time-tracking'
                    ? 'text-brand-600 border-brand-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <i className="ph-light ph-timer mr-2"></i>
                Time Tracking
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === 'documents'
                    ? 'text-brand-600 border-brand-600'
                    : 'text-slate-600 border-transparent hover:text-slate-900'
                }`}
              >
                <i className="ph-light ph-folder-open mr-2"></i>
                Documents ({documents?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                  <h2 className="font-semibold text-xl text-slate-900 mb-6 flex items-center gap-2">
                    <i className="ph-light ph-user text-brand-600"></i>
                    Contact Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Full Name</p>
                      <p className="font-semibold text-slate-900">{client.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Date of Birth</p>
                      <p className="font-semibold text-slate-900">{formatDate(client.date_of_birth)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Email</p>
                      <p className="font-semibold text-slate-900">{client.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Phone</p>
                      <p className="font-semibold text-slate-900">{client.phone || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-slate-500 mb-1">Address</p>
                      <p className="font-semibold text-slate-900">
                        {[client.address, client.city, client.country].filter(Boolean).join(', ') || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Case Notes */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                  <h2 className="font-semibold text-xl text-slate-900 mb-4 flex items-center gap-2">
                    <i className="ph-light ph-note text-brand-600"></i>
                    Case Notes
                  </h2>
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {client.notes || 'No notes added yet.'}
                  </p>
                </div>

                {/* Custom Fields */}
                {Object.keys(customFields).length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                    <h2 className="font-semibold text-xl text-slate-900 mb-6 flex items-center gap-2">
                      <i className="ph-light ph-plus-circle text-brand-600"></i>
                      Custom Fields
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(customFields).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-slate-500 mb-1">{key}</p>
                          <p className="font-semibold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Appointments</span>
                      <span className="font-bold text-slate-900">{appointments?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Total Invoices</span>
                      <span className="font-bold text-slate-900">{invoices?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Active Cases</span>
                      <span className="font-bold text-slate-900">
                        {cases?.filter(c => c.status === 'open').length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Client Since</span>
                      <span className="font-bold text-slate-900">{formatDate(client.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-2xl border border-brand-100 p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200">
                      <i className="ph-light ph-calendar-plus"></i>
                      Schedule Appointment
                    </button>
                    <button className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200">
                      <i className="ph-light ph-receipt"></i>
                      Create Invoice
                    </button>
                    <button className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200">
                      <i className="ph-light ph-pencil"></i>
                      Edit Client
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
              <h2 className="font-semibold text-xl text-slate-900 mb-6">Appointment History</h2>
              {appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-slate-900">{apt.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{apt.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                        <span className="flex items-center gap-1">
                          <i className="ph-light ph-calendar"></i>
                          {formatDateTime(apt.start_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ph-light ph-map-pin"></i>
                          {apt.location_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-slate-500">No appointments yet</p>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
              <h2 className="font-semibold text-xl text-slate-900 mb-6">Invoice History</h2>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{inv.invoice_number}</h3>
                          <p className="text-sm text-slate-600">
                            Issue: {formatDate(inv.issue_date)} • Due: {formatDate(inv.due_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-lg">BZD {parseFloat(inv.total_amount).toFixed(2)}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(inv.status)}`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-slate-500">No invoices yet</p>
              )}
            </div>
          )}

          {activeTab === 'cases' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
              <h2 className="font-semibold text-xl text-slate-900 mb-6">Case History</h2>
              {cases && cases.length > 0 ? (
                <div className="space-y-4">
                  {cases.map((caseItem) => (
                    <div key={caseItem.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{caseItem.subject}</h3>
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-semibold">
                              {caseItem.case_type}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{caseItem.details}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                        <span>Opened: {formatDate(caseItem.opened_at)}</span>
                        {caseItem.closed_at && <span>Closed: {formatDate(caseItem.closed_at)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-slate-500">No cases yet</p>
              )}
            </div>
          )}

          {activeTab === 'payments' && paymentHistory && (
            <div className="space-y-8">
              {/* Payment Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Total Invoices</p>
                  <p className="text-2xl font-bold text-slate-900">{paymentHistory.summary.total_invoices}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Amount Paid</p>
                  <p className="text-2xl font-bold text-emerald-600">BZD {parseFloat(paymentHistory.summary.total_paid_amount).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Outstanding</p>
                  <p className="text-2xl font-bold text-amber-600">BZD {parseFloat(paymentHistory.summary.total_outstanding_amount).toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Unpaid Invoices</p>
                  <p className="text-2xl font-bold text-slate-900">{paymentHistory.summary.unpaid_invoices}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{paymentHistory.summary.overdue_invoices}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase mb-2">Avg Days to Pay</p>
                  <p className="text-2xl font-bold text-slate-900">{Math.round(paymentHistory.summary.avg_days_to_payment)} days</p>
                </div>
              </div>

              {/* Payment Methods */}
              {paymentHistory.payment_methods.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                  <h3 className="font-semibold text-xl text-slate-900 mb-6">Payment Methods</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paymentHistory.payment_methods.map((method) => (
                      <div key={method.payment_method} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          {method.payment_method === 'credit_card' && <i className="ph-light ph-credit-card text-brand-600 text-xl"></i>}
                          {method.payment_method === 'bank_transfer' && <i className="ph-light ph-bank text-brand-600 text-xl"></i>}
                          {method.payment_method === 'cash' && <i className="ph-light ph-money text-brand-600 text-xl"></i>}
                          {method.payment_method === 'check' && <i className="ph-light ph-receipt text-brand-600 text-xl"></i>}
                          {!['credit_card', 'bank_transfer', 'cash', 'check'].includes(method.payment_method) && <i className="ph-light ph-credit-card text-brand-600 text-xl"></i>}
                          <h4 className="font-semibold text-slate-900 capitalize">{method.payment_method.replace('_', ' ')}</h4>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{method.count} payment{method.count !== 1 ? 's' : ''}</p>
                        <p className="text-lg font-bold text-slate-900">BZD {parseFloat(method.total_amount).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoice & Payment Records */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Invoices */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                  <h3 className="font-semibold text-xl text-slate-900 mb-6">Invoices</h3>
                  {paymentHistory.invoices.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {paymentHistory.invoices.map((invoice) => {
                        const amountDue = invoice.total_amount - invoice.amount_paid;
                        return (
                          <div key={invoice.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-900">{invoice.invoice_number}</h4>
                                <p className="text-xs text-slate-500 mt-1">
                                  Issued: {formatDate(invoice.issue_date)}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                                {invoice.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mt-2 pt-2 border-t border-slate-200">
                              <div>
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="font-semibold text-slate-900">BZD {parseFloat(invoice.total_amount).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Paid / Due</p>
                                <p className="font-semibold">
                                  <span className="text-emerald-600">BZD {parseFloat(invoice.amount_paid).toFixed(2)}</span> / 
                                  <span className="text-slate-900 ml-1">BZD {parseFloat(amountDue).toFixed(2)}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-slate-500">No invoices</p>
                  )}
                </div>

                {/* Payments */}
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                  <h3 className="font-semibold text-xl text-slate-900 mb-6">Payment Transactions</h3>
                  {paymentHistory.payments.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {paymentHistory.payments.map((payment) => (
                        <div key={payment.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-slate-900">{payment.invoice_number}</h4>
                              <p className="text-xs text-slate-500 mt-1">
                                {payment.payment_method && `Via ${payment.payment_method.replace('_', ' ')}`}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {payment.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm mt-2 pt-2 border-t border-slate-200">
                            <div>
                              <p className="text-xs text-slate-500">Amount</p>
                              <p className="font-semibold text-emerald-600">BZD {parseFloat(payment.amount).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Date</p>
                              <p className="font-semibold text-slate-900">{formatDate(payment.paid_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-slate-500">No payments recorded</p>
                  )}
                </div>
              </div>

              {/* Monthly Trend */}
              {paymentHistory.monthly_trend.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                  <h3 className="font-semibold text-xl text-slate-900 mb-6">Payment Trend (Last 12 Months)</h3>
                  <div className="space-y-2">
                    {paymentHistory.monthly_trend.map((trend) => (
                      <div key={trend.month} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-sm font-semibold text-slate-600 min-w-fit">{trend.month}</span>
                          <div className="h-2 bg-slate-200 rounded-full flex-1">
                            <div 
                              className="h-2 bg-emerald-500 rounded-full" 
                              style={{ width: `${Math.min((trend.total_amount / (paymentHistory.monthly_trend[0]?.total_amount || 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-slate-900">BZD {parseFloat(trend.total_amount).toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{trend.payment_count} payment{trend.payment_count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'time-tracking' && (
            <div className="space-y-8">
              {/* Timer Section */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                <h2 className="font-semibold text-xl text-slate-900 mb-6 flex items-center gap-2">
                  <i className="ph-light ph-timer text-brand-600"></i>
                  Live Timer
                </h2>
                
                <div className="flex flex-col items-center justify-center py-8 bg-gradient-to-br from-brand-50 to-indigo-50 rounded-xl">
                  <div className="text-6xl font-bold text-slate-900 mb-6 font-mono">
                    {formatTimerDisplay(elapsedSeconds)}
                  </div>
                  
                  {!isTimerRunning ? (
                    <button
                      onClick={handleStartTimer}
                      className="px-8 py-4 bg-brand-600 text-white hover:bg-brand-700 font-semibold text-lg rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
                    >
                      <i className="ph-bold ph-play text-xl"></i>
                      Start Timer
                    </button>
                  ) : (
                    <button
                      onClick={handleStopTimer}
                      disabled={savingTime}
                      className="px-8 py-4 bg-red-600 text-white hover:bg-red-700 font-semibold text-lg rounded-xl transition-all shadow-md shadow-red-500/20 flex items-center gap-2"
                    >
                      <i className="ph-bold ph-stop text-xl"></i>
                      {savingTime ? 'Saving...' : 'Stop & Save'}
                    </button>
                  )}
                </div>
              </div>

              {/* Manual Entry Section */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                <h2 className="font-semibold text-xl text-slate-900 mb-6 flex items-center gap-2">
                  <i className="ph-light ph-pencil text-brand-600"></i>
                  Manual Time Entry
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Hours</label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={manualHours}
                        onChange={(e) => setManualHours(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Minutes</label>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={manualMinutes}
                        onChange={(e) => setManualMinutes(e.target.value)}
                        placeholder="0"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                    <textarea
                      value={timeNotes}
                      onChange={(e) => setTimeNotes(e.target.value)}
                      placeholder="What did you work on?"
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                    />
                  </div>
                  
                  <button
                    onClick={handleSaveManualEntry}
                    disabled={savingTime}
                    className="w-full px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
                  >
                    <i className="ph-bold ph-plus-circle text-lg"></i>
                    {savingTime ? 'Saving...' : 'Save Time Entry'}
                  </button>
                </div>
              </div>

              {/* Total Hours Summary */}
              <div className="bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-semibold uppercase mb-2">Total Hours Tracked</p>
                    <p className="text-5xl font-bold">{calculateTotalHours().toFixed(2)}</p>
                  </div>
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <i className="ph-light ph-clock text-4xl"></i>
                  </div>
                </div>
              </div>

              {/* Time Entries List */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
                <h2 className="font-semibold text-xl text-slate-900 mb-6 flex items-center gap-2">
                  <i className="ph-light ph-list text-brand-600"></i>
                  Time Entry History
                </h2>
                
                {timeEntries && timeEntries.length > 0 ? (
                  <div className="space-y-3">
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-300 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-lg text-sm font-bold">
                                {parseFloat(entry.hours_worked).toFixed(2)} hrs
                              </span>
                              <span className="text-sm text-slate-500">
                                {formatDate(entry.started_at)}
                              </span>
                            </div>
                            <p className="text-slate-700">{entry.description || 'No description'}</p>
                            {entry.total_amount && (
                              <p className="text-sm text-emerald-600 font-semibold mt-2">
                                BZD {parseFloat(entry.total_amount).toFixed(2)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteTimeEntry(entry.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete entry"
                          >
                            <i className="ph-light ph-trash text-lg"></i>
                          </button>
                        </div>
                        {entry.invoiced && (
                          <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">
                            Invoiced
                          </span>
                        )}
                        {entry.billable === false && (
                          <span className="inline-block px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold">
                            Non-billable
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <i className="ph-light ph-timer text-3xl text-slate-400"></i>
                    </div>
                    <p className="text-slate-600 mb-2">No time entries yet</p>
                    <p className="text-sm text-slate-500">Start the timer or add a manual entry to begin tracking time</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-xl text-slate-900">Client Documents</h2>
                <label className="px-5 py-2.5 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 cursor-pointer">
                  <i className="ph-bold ph-upload-simple text-lg"></i>
                  {uploading ? 'Uploading...' : 'Upload Document'}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>

              {documents && documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-brand-300 transition-all group">
                      <div className="flex items-start gap-3">
                        <div className="p-3 bg-white rounded-lg border border-slate-200">
                          <i className={`${getFileIcon(doc.file_type)} text-2xl text-brand-600`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 text-sm truncate" title={doc.file_name}>
                            {doc.file_name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatFileSize(doc.file_size)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(doc.upload_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200">
                        <a
                          href={doc.file_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                        >
                          <i className="ph-light ph-download-simple"></i>
                          Download
                        </a>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <i className="ph-light ph-trash"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="ph-light ph-folder-open text-3xl text-slate-400"></i>
                  </div>
                  <p className="text-slate-600 mb-2">No documents uploaded yet</p>
                  <p className="text-sm text-slate-500">Upload PDF, Word, or image files to keep client documents organized</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
