'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AppointmentDetailPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    recipient_type: 'client',
    channel: 'email',
    hours_before: 24
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location_type: '',
    location_details: '',
    status: ''
  });
  const [invoiceForm, setInvoiceForm] = useState({
    description: '',
    hours_worked: 1,
    hourly_rate: 150,
    notes: ''
  });

  useEffect(() => {
    fetchAppointmentDetails();
  }, []);

  useEffect(() => {
    if (appointment) {
      const startDate = new Date(appointment.start_at);
      const endDate = new Date(appointment.end_at);
      setEditForm({
        title: appointment.title || '',
        description: appointment.description || '',
        date: startDate.toISOString().split('T')[0],
        start_time: startDate.toTimeString().slice(0, 5),
        end_time: endDate.toTimeString().slice(0, 5),
        location_type: appointment.location_type || 'in_person',
        location_details: appointment.location_details || '',
        status: appointment.status || 'scheduled'
      });
    }
  }, [appointment]);

  async function fetchAppointmentDetails() {
    try {
      setLoading(true);
      const resolvedParams = await params;
      
      const [aptRes, remindersRes] = await Promise.all([
        fetch(`/api/appointments/${resolvedParams.id}`),
        fetch(`/api/appointments/${resolvedParams.id}/reminders`)
      ]);
      
      if (aptRes.ok) {
        const data = await aptRes.json();
        setAppointment(data);
      }
      
      if (remindersRes.ok) {
        const data = await remindersRes.json();
        setReminders(data);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateReminder(e) {
    e.preventDefault();
    
    if (!appointment) return;
    
    const appointmentStart = new Date(appointment.start_at);
    const scheduledFor = new Date(appointmentStart);
    scheduledFor.setHours(scheduledFor.getHours() - reminderForm.hours_before);
    
    try {
      const resolvedParams = await params;
      const res = await fetch(`/api/appointments/${resolvedParams.id}/reminders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_type: reminderForm.recipient_type,
          channel: reminderForm.channel,
          scheduled_for: scheduledFor.toISOString()
        })
      });
      
      if (res.ok) {
        setShowReminderModal(false);
        setReminderForm({
          recipient_type: 'client',
          channel: 'email',
          hours_before: 24
        });
        fetchAppointmentDetails();
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  }

  async function handleSendReminder(reminderId) {
    try {
      const resolvedParams = await params;
      const res = await fetch(`/api/appointments/${resolvedParams.id}/send-reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminder_id: reminderId })
      });
      
      if (res.ok) {
        fetchAppointmentDetails();
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    
    try {
      const resolvedParams = await params;
      const startDateTime = new Date(`${editForm.date}T${editForm.start_time}`);
      const endDateTime = new Date(`${editForm.date}T${editForm.end_time}`);
      
      const res = await fetch(`/api/appointments/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          start_at: startDateTime.toISOString(),
          end_at: endDateTime.toISOString(),
          location_type: editForm.location_type,
          location_details: editForm.location_details,
          status: editForm.status
        })
      });
      
      if (res.ok) {
        setShowEditModal(false);
        fetchAppointmentDetails();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  }

  async function handleStatusUpdate(newStatus) {
    try {
      const resolvedParams = await params;
      const res = await fetch(`/api/appointments/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        fetchAppointmentDetails();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function handleGenerateInvoice(e) {
    e.preventDefault();
    
    if (!appointment) return;
    
    try {
      // First, create a time entry for this appointment
      const timeEntryRes = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: appointment.professional_id,
          client_id: appointment.client_id,
          work_date: appointment.start_at.split('T')[0],
          hours_worked: invoiceForm.hours_worked,
          hourly_rate: invoiceForm.hourly_rate,
          description: invoiceForm.description || appointment.title,
          invoiced: false
        })
      });
      
      if (!timeEntryRes.ok) {
        alert('Failed to create time entry');
        return;
      }
      
      const timeEntry = await timeEntryRes.json();
      
      // Then generate invoice using that time entry
      const invoiceRes = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: appointment.professional_id,
          client_id: appointment.client_id,
          time_entry_ids: [timeEntry.id],
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: invoiceForm.notes
        })
      });
      
      if (invoiceRes.ok) {
        const invoice = await invoiceRes.json();
        setShowInvoiceModal(false);
        router.push(`/invoices/${invoice.id}`);
      } else {
        alert('Failed to generate invoice');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice');
    }
  }

  function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  }

  function formatTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function getLocationIcon(type) {
    switch(type) {
      case 'in_person': return 'ph-map-pin';
      case 'zoom': return 'ph-video-camera';
      case 'whatsapp_call': return 'ph-phone';
      case 'phone': return 'ph-phone';
      default: return 'ph-calendar';
    }
  }

  function getChannelIcon(channel) {
    switch(channel) {
      case 'email': return 'ph-envelope';
      case 'whatsapp': return 'ph-whatsapp-logo';
      case 'sms': return 'ph-chat-circle-text';
      default: return 'ph-bell';
    }
  }

  function getStatusBadge(status) {
    switch(status) {
      case 'sent':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">Sent</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Scheduled</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">{status}</span>;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ph-light ph-spinner text-4xl text-brand-600 animate-spin"></i>
          <p className="mt-4 text-slate-600">Loading appointment...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={() => router.push('/calendar')}
            className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-2 mb-3"
          >
            <i className="ph-light ph-arrow-left"></i>
            Back to Calendar
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{appointment.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{formatDate(appointment.start_at)}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
              appointment.status === 'completed' ? 'bg-slate-100 text-slate-700' :
              appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {appointment.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Details */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Appointment Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700">
                  <i className="ph-light ph-calendar text-xl text-brand-600"></i>
                  <div>
                    <div className="text-sm text-slate-500">Date & Time</div>
                    <div className="font-semibold">
                      {formatTime(appointment.start_at)} - {formatTime(appointment.end_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <i className={`ph-light ${getLocationIcon(appointment.location_type)} text-xl text-brand-600`}></i>
                  <div>
                    <div className="text-sm text-slate-500">Meeting Method</div>
                    <div className="font-semibold capitalize">{appointment.location_type?.replace('_', ' ')}</div>
                    {appointment.location_details && (
                      <div className="text-sm text-slate-600 mt-0.5">{appointment.location_details}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-700">
                  <i className="ph-light ph-user text-xl text-brand-600"></i>
                  <div>
                    <div className="text-sm text-slate-500">Client</div>
                    <div className="font-semibold">{appointment.client_name}</div>
                    <div className="text-sm text-slate-600 mt-0.5">{appointment.client_email}</div>
                    {appointment.client_phone && (
                      <div className="text-sm text-slate-600">{appointment.client_phone}</div>
                    )}
                  </div>
                </div>

                {appointment.description && (
                  <div className="pt-4 border-t border-slate-200">
                    <div className="text-sm text-slate-500 mb-2">Description</div>
                    <p className="text-slate-700">{appointment.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reminder Controls */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <i className="ph-light ph-bell text-brand-600"></i>
                  Reminders
                </h2>
                <button
                  onClick={() => setShowReminderModal(true)}
                  className="px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <i className="ph-bold ph-plus"></i>
                  Add Reminder
                </button>
              </div>

              {/* Reminder Timeline */}
              {reminders.length > 0 ? (
                <div className="space-y-4">
                  {reminders.map((reminder, index) => (
                    <div 
                      key={reminder.id}
                      className="relative pl-8 pb-4 border-l-2 border-slate-200 last:border-transparent"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                        reminder.status === 'sent' ? 'bg-emerald-500' :
                        reminder.status === 'scheduled' ? 'bg-blue-500' :
                        reminder.status === 'failed' ? 'bg-red-500' :
                        'bg-slate-400'
                      }`}></div>

                      <div className="bg-slate-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <i className={`ph-light ${getChannelIcon(reminder.channel)} text-brand-600`}></i>
                            <span className="font-semibold text-slate-900 capitalize">
                              {reminder.channel} to {reminder.recipient_type}
                            </span>
                          </div>
                          {getStatusBadge(reminder.status)}
                        </div>

                        <div className="text-sm text-slate-600 mb-2">
                          <strong>Scheduled for:</strong> {formatDateTime(reminder.scheduled_for)}
                        </div>

                        {reminder.sent_at && (
                          <div className="text-sm text-emerald-600 mb-2">
                            <strong>Sent at:</strong> {formatDateTime(reminder.sent_at)}
                          </div>
                        )}

                        <div className="text-sm text-slate-600 bg-white rounded p-3 mt-2 border border-slate-200">
                          <div className="font-semibold mb-1">Message Preview:</div>
                          <div className="whitespace-pre-wrap text-xs">{reminder.message?.substring(0, 200)}{reminder.message?.length > 200 ? '...' : ''}</div>
                        </div>

                        {reminder.status === 'scheduled' && new Date(reminder.scheduled_for) <= new Date() && (
                          <button
                            onClick={() => handleSendReminder(reminder.id)}
                            className="mt-3 px-4 py-2 bg-brand-600 text-white hover:bg-brand-700 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                          >
                            <i className="ph-light ph-paper-plane-tilt"></i>
                            Send Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <i className="ph-light ph-bell-slash text-3xl text-slate-400"></i>
                  </div>
                  <p className="text-slate-600 mb-4">No reminders set for this appointment</p>
                  <button
                    onClick={() => setShowReminderModal(true)}
                    className="text-brand-600 hover:text-brand-700 font-semibold text-sm"
                  >
                    Add your first reminder
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-brand-50 to-indigo-50 rounded-xl border border-brand-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200"
                >
                  <i className="ph-light ph-pencil"></i>
                  Edit Appointment
                </button>
                <button 
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-emerald-600 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200"
                >
                  <i className="ph-light ph-file-text"></i>
                  Send Invoice
                </button>
                <button 
                  onClick={() => handleStatusUpdate('completed')}
                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200"
                >
                  <i className="ph-light ph-check-circle"></i>
                  Mark as Completed
                </button>
                <button 
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 text-red-600 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-slate-200"
                >
                  <i className="ph-light ph-x-circle"></i>
                  Cancel Appointment
                </button>
              </div>
            </div>

            {(appointment.zoom_meeting_url || appointment.whatsapp_call_number) && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Meeting Links</h3>
                <div className="space-y-2">
                  {appointment.zoom_meeting_url && (
                    <a 
                      href={appointment.zoom_meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-blue-200"
                    >
                      <i className="ph-light ph-video-camera"></i>
                      Join Zoom Meeting
                    </a>
                  )}
                  {appointment.whatsapp_call_number && (
                    <a 
                      href={`https://wa.me/${appointment.whatsapp_call_number.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 border border-emerald-200"
                    >
                      <i className="ph-light ph-whatsapp-logo"></i>
                      WhatsApp Call
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Appointment Modal */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Edit Appointment</h2>
              <p className="text-sm text-slate-500 mt-1">Update appointment details</p>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={editForm.start_time}
                    onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={editForm.end_time}
                    onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Method *</label>
                <select
                  value={editForm.location_type}
                  onChange={(e) => setEditForm({ ...editForm, location_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="in_person">In-Person</option>
                  <option value="zoom">Zoom Video Call</option>
                  <option value="whatsapp_call">WhatsApp Call</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {editForm.location_type === 'in_person' ? 'Location' : 
                   editForm.location_type === 'zoom' ? 'Zoom Link' : 
                   'Phone Number'}
                </label>
                <input
                  type="text"
                  value={editForm.location_details}
                  onChange={(e) => setEditForm({ ...editForm, location_details: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all shadow-md shadow-brand-500/20"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Invoice Modal */}
      {showInvoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowInvoiceModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Generate Invoice</h2>
              <p className="text-sm text-slate-500 mt-1">Create an invoice for this appointment</p>
            </div>
            
            <form onSubmit={handleGenerateInvoice} className="p-6 space-y-4">
              <div className="bg-brand-50 border border-brand-100 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ph-light ph-info text-brand-600"></i>
                  <span className="font-semibold text-brand-900">Invoice Details</span>
                </div>
                <div className="text-sm text-brand-700">
                  <div><strong>Client:</strong> {appointment?.client_name}</div>
                  <div><strong>Appointment:</strong> {appointment?.title}</div>
                  <div><strong>Date:</strong> {formatDate(appointment?.start_at)}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Service Description *</label>
                <input
                  type="text"
                  value={invoiceForm.description}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={appointment?.title || 'Professional consultation'}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hours Worked *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={invoiceForm.hours_worked}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, hours_worked: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hourly Rate (BZD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={invoiceForm.hourly_rate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, hourly_rate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Subtotal:</span>
                  <span className="font-semibold text-slate-900">${(invoiceForm.hours_worked * invoiceForm.hourly_rate).toFixed(2)} BZD</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>GST will be calculated based on professional settings</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Additional notes for the invoice..."
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all"
                >
                  Generate & View Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showReminderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowReminderModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Add Reminder</h2>
              <p className="text-sm text-slate-500 mt-1">Send a reminder before the appointment</p>
            </div>
            
            <form onSubmit={handleCreateReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Send To</label>
                <select
                  value={reminderForm.recipient_type}
                  onChange={(e) => setReminderForm({ ...reminderForm, recipient_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="client">Client ({appointment.client_name})</option>
                  <option value="professional">Professional (You)</option>
                  <option value="both">Both Client & Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Channel</label>
                <select
                  value={reminderForm.channel}
                  onChange={(e) => setReminderForm({ ...reminderForm, channel: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Send Reminder</label>
                <select
                  value={reminderForm.hours_before}
                  onChange={(e) => setReminderForm({ ...reminderForm, hours_before: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="1">1 hour before</option>
                  <option value="2">2 hours before</option>
                  <option value="4">4 hours before</option>
                  <option value="12">12 hours before</option>
                  <option value="24">24 hours before (1 day)</option>
                  <option value="48">48 hours before (2 days)</option>
                  <option value="72">72 hours before (3 days)</option>
                  <option value="168">1 week before</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-800">
                  <strong>Reminder will be sent:</strong><br />
                  {new Date(new Date(appointment.start_at).getTime() - reminderForm.hours_before * 60 * 60 * 1000).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all"
                >
                  Schedule Reminder
                </button>
                <button
                  type="button"
                  onClick={() => setShowReminderModal(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
