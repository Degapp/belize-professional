'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState('month'); // 'day', 'week', 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [previousAppointments, setPreviousAppointments] = useState([]);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    date: '',
    start_time: '',
    end_time: '',
    location_type: 'in_person',
    location_details: '',
    notes: '',
  });

  // Invoice form state
  const [invoiceData, setInvoiceData] = useState({
    hourly_rate: '150',
    hours_worked: '1',
    description: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [view, currentDate]);

  async function fetchData() {
    setLoading(true);
    try {
      const [appointmentsRes, clientsRes] = await Promise.all([
        fetch(`/api/appointments?view=${view}&date=${currentDate.toISOString()}`),
        fetch('/api/clients')
      ]);
      
      if (appointmentsRes.ok) {
        const data = await appointmentsRes.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
      
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openEditModal(appointment) {
    setSelectedAppointment(appointment);
    const startDate = new Date(appointment.start_at);
    const endDate = new Date(appointment.end_at);
    
    setFormData({
      client_id: appointment.client_id.toString(),
      title: appointment.title,
      description: appointment.description || '',
      date: startDate.toISOString().split('T')[0],
      start_time: startDate.toTimeString().slice(0, 5),
      end_time: endDate.toTimeString().slice(0, 5),
      location_type: appointment.location_type,
      location_details: appointment.location_details || '',
      notes: appointment.notes || '',
    });
    
    // Reset file uploads
    setUploadedFiles(appointment.attachments || []);
    
    // Fetch client details and previous appointments
    try {
      const clientRes = await fetch(`/api/clients/${appointment.client_id}`);
      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setSelectedClient(clientData);
      }
      
      const prevRes = await fetch(`/api/appointments?client_id=${appointment.client_id}`);
      if (prevRes.ok) {
        const prevData = await prevRes.json();
        // Filter out the current appointment and get the most recent ones
        const filtered = prevData.filter(a => a.id !== appointment.id).slice(0, 5);
        setPreviousAppointments(filtered);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    }
    
    setShowEditModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`);
    
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: parseInt(formData.client_id),
          title: formData.title,
          description: formData.description,
          start_at: startDateTime.toISOString(),
          end_at: endDateTime.toISOString(),
          location_type: formData.location_type,
          location_details: formData.location_details,
          status: 'confirmed'
        })
      });
      
      if (res.ok) {
        setShowNewAppointmentModal(false);
        setFormData({
          client_id: '',
          title: '',
          description: '',
          date: '',
          start_time: '',
          end_time: '',
          location_type: 'in_person',
          location_details: '',
          notes: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    
    const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
    const endDateTime = new Date(`${formData.date}T${formData.end_time}`);
    
    try {
      const res = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: parseInt(formData.client_id),
          title: formData.title,
          description: formData.description,
          start_at: startDateTime.toISOString(),
          end_at: endDateTime.toISOString(),
          location_type: formData.location_type,
          location_details: formData.location_details,
          notes: formData.notes,
          attachments: uploadedFiles,
        })
      });
      
      if (res.ok) {
        setShowEditModal(false);
        setSelectedAppointment(null);
        setUploadedFiles([]);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  }

  async function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (res.ok) {
          const data = await res.json();
          return {
            name: file.name,
            url: data.url,
            size: file.size,
            type: file.type,
          };
        }
        return null;
      });
      
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r !== null);
      
      setUploadedFiles([...uploadedFiles, ...successfulUploads]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function removeFile(index) {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  }

  async function handleSendInvoice(e) {
    e.preventDefault();
    
    if (!selectedAppointment) return;
    
    try {
      // Calculate total amount
      const hoursWorked = parseFloat(invoiceData.hours_worked);
      const hourlyRate = parseFloat(invoiceData.hourly_rate);
      const totalAmount = hoursWorked * hourlyRate;
      
      // Create invoice
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: selectedAppointment.client_id,
          appointment_id: selectedAppointment.id,
          items: [{
            description: invoiceData.description || selectedAppointment.title,
            quantity: hoursWorked,
            unit_price: hourlyRate,
            amount: totalAmount
          }],
          subtotal: totalAmount,
          tax_amount: totalAmount * 0.12,
          total_amount: totalAmount * 1.12,
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `Service provided on ${new Date(selectedAppointment.start_at).toLocaleDateString()}`
        })
      });
      
      if (res.ok) {
        const invoice = await res.json();
        alert('Invoice created successfully! Invoice #' + invoice.invoice_number);
        setShowInvoiceForm(false);
        setShowEditModal(false);
        setInvoiceData({
          hourly_rate: '150',
          hours_worked: '1',
          description: '',
        });
      } else {
        const error = await res.json();
        alert('Error creating invoice: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Error sending invoice. Please try again.');
    }
  }

  function navigateDate(direction) {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  }

  function getMonthDays() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }

  function getWeekDays() {
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }

  function getAppointmentsForDate(date) {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.start_at).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  }

  function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekRange = view === 'week' ? (() => {
    const days = getWeekDays();
    return `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  })() : '';
  const dayDisplay = view === 'day' ? currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your appointments and schedule</p>
            </div>
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="px-5 py-2.5 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all shadow-md shadow-brand-500/20 flex items-center gap-2"
            >
              <i className="ph-bold ph-plus text-lg"></i>
              New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <i className="ph-bold ph-caret-left text-xl text-slate-700"></i>
            </button>
            <div className="min-w-[250px] text-center">
              <h2 className="text-xl font-bold text-slate-900">
                {view === 'month' && monthName}
                {view === 'week' && weekRange}
                {view === 'day' && dayDisplay}
              </h2>
            </div>
            <button
              onClick={() => navigateDate(1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <i className="ph-bold ph-caret-right text-xl text-slate-700"></i>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                view === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                view === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                view === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Month View */}
        {view === 'month' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 border-r border-slate-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {getMonthDays().map((date, idx) => {
                const dayAppointments = date ? getAppointmentsForDate(date) : [];
                const isToday = date && date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={idx}
                    className={`min-h-[120px] p-2 border-r border-b border-slate-200 ${
                      !date ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                    } ${isToday ? 'bg-brand-50' : ''}`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-semibold mb-2 ${
                          isToday ? 'text-brand-600' : 'text-slate-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 3).map(apt => (
                            <div
                              key={apt.id}
                              className="text-xs p-1.5 bg-brand-100 text-brand-700 rounded border-l-2 border-brand-600 cursor-pointer hover:bg-brand-200 transition-colors"
                              title={apt.title}
                              onClick={() => openEditModal(apt)}
                            >
                              <div className="font-semibold truncate">{formatTime(apt.start_at)}</div>
                              <div className="truncate">{apt.title}</div>
                            </div>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className="text-xs text-slate-500 pl-1.5">
                              +{dayAppointments.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === 'week' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-200">
              {getWeekDays().map(date => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div key={date.toISOString()} className={`p-4 text-center border-r border-slate-200 last:border-r-0 ${
                    isToday ? 'bg-brand-50' : ''
                  }`}>
                    <div className={`text-sm font-semibold ${isToday ? 'text-brand-600' : 'text-slate-600'}`}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-brand-600' : 'text-slate-900'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7">
              {getWeekDays().map(date => {
                const dayAppointments = getAppointmentsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[400px] p-3 border-r border-slate-200 last:border-r-0 ${
                      isToday ? 'bg-brand-50/30' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      {dayAppointments.map(apt => (
                      <div
                        key={apt.id}
                        className="p-3 bg-white border border-brand-200 rounded-lg shadow-sm hover:shadow-md transition-all group cursor-pointer"
                        onClick={() => openEditModal(apt)}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <i className={`${getLocationIcon(apt.location_type)} text-brand-600 mt-0.5`}></i>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-slate-900 truncate">{apt.title}</div>
                            <div className="text-xs text-slate-600">{apt.client_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-brand-600">
                            {formatTime(apt.start_at)} - {formatTime(apt.end_at)}
                          </div>
                          <div
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-brand-600 text-white text-xs rounded"
                          >
                            Edit
                          </div>
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Day View */}
        {view === 'day' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <i className="ph-light ph-calendar-blank text-3xl text-slate-400"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments today</h3>
                  <p className="text-slate-500 mb-6">You have a free day. Schedule a new appointment to get started.</p>
                  <button
                    onClick={() => setShowNewAppointmentModal(true)}
                    className="px-5 py-2.5 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all shadow-md shadow-brand-500/20"
                  >
                    Schedule Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map(apt => (
                    <div
                      key={apt.id}
                      className="p-4 border border-slate-200 rounded-lg hover:border-brand-300 hover:shadow-md transition-all group cursor-pointer"
                      onClick={() => openEditModal(apt)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-center">
                          <div className="text-sm font-semibold text-brand-600">
                            {formatTime(apt.start_at)}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(apt.end_at).getHours() - new Date(apt.start_at).getHours()}h
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <i className={`${getLocationIcon(apt.location_type)} text-brand-600`}></i>
                            <h3 className="text-lg font-semibold text-slate-900">{apt.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                            <div className="flex items-center gap-1.5">
                              <i className="ph-light ph-user"></i>
                              <span>{apt.client_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <i className="ph-light ph-clock"></i>
                              <span>{formatTime(apt.start_at)} - {formatTime(apt.end_at)}</span>
                            </div>
                          </div>
                          {apt.description && (
                            <p className="text-sm text-slate-600 mb-2">{apt.description}</p>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`px-2 py-1 rounded-full font-semibold ${
                                apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                apt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                apt.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                                apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {apt.status}
                              </span>
                              <span className="text-slate-500">{apt.location_details}</span>
                            </div>
                            <div
                              className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-1.5 bg-brand-600 text-white text-sm font-semibold rounded-lg"
                            >
                              Edit Appointment
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State for Month/Week with no appointments */}
        {(view === 'month' || view === 'week') && appointments.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center mt-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <i className="ph-light ph-calendar-blank text-3xl text-slate-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No appointments scheduled</h3>
            <p className="text-slate-500 mb-6">Get started by creating your first appointment.</p>
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="px-5 py-2.5 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all shadow-md shadow-brand-500/20"
            >
              Schedule Appointment
            </button>
          </div>
        )}
      </div>

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => {
            setShowEditModal(false);
            setShowInvoiceForm(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Edit Appointment</h2>
              <p className="text-sm text-slate-500 mt-1">Update appointment details or send an invoice</p>
              {selectedClient && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Client: {selectedClient.full_name}</h3>
                  {previousAppointments.length > 0 && (
                    <div className="text-xs text-slate-600">
                      <p className="mb-2 font-semibold">Previous visits: {previousAppointments.length}</p>
                      {previousAppointments.slice(0, 2).map(apt => (
                        <div key={apt.id} className="text-xs text-slate-500">
                          • {apt.title} ({new Date(apt.start_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {!showInvoiceForm ? (
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  >
                    <option value="">Select a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.full_name} - {client.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g., Initial Consultation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Additional details about the appointment..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time *</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Time *</label>
                    <input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Method *</label>
                  <select
                    value={formData.location_type}
                    onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
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
                    {formData.location_type === 'in_person' ? 'Location' : 
                     formData.location_type === 'zoom' ? 'Zoom Link' : 
                     'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.location_details}
                    onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={
                      formData.location_type === 'in_person' ? 'Office, Room 101' :
                      formData.location_type === 'zoom' ? 'https://zoom.us/j/...' :
                      '+1234567890'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Add any notes about the client or appointment..."
                    rows={4}
                  />
                  <p className="text-xs text-slate-500 mt-1">Private notes that will be saved with the appointment</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 hover:border-brand-300 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <i className="ph-light ph-cloud-arrow-up text-4xl text-slate-400 mb-2"></i>
                      <span className="text-sm font-semibold text-slate-700">
                        {uploading ? 'Uploading...' : 'Click to upload files'}
                      </span>
                      <span className="text-xs text-slate-500 mt-1">PDF, images, documents (max 10MB each)</span>
                    </label>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <i className="ph-light ph-file text-xl text-brand-600"></i>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-2 p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <i className="ph-bold ph-x text-lg"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all shadow-md shadow-brand-500/20"
                  >
                    Update Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceForm(true)}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold rounded-lg transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <i className="ph-bold ph-receipt text-lg"></i>
                    Send Invoice
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setShowInvoiceForm(false);
                  }}
                  className="w-full px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <form onSubmit={handleSendInvoice} className="p-6 space-y-4">
                <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Appointment Details</h3>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><span className="font-semibold">Client:</span> {selectedAppointment.client_name}</p>
                    <p><span className="font-semibold">Service:</span> {selectedAppointment.title}</p>
                    <p><span className="font-semibold">Date:</span> {new Date(selectedAppointment.start_at).toLocaleDateString()}</p>
                    <p><span className="font-semibold">Time:</span> {formatTime(selectedAppointment.start_at)} - {formatTime(selectedAppointment.end_at)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Service Description</label>
                  <input
                    type="text"
                    value={invoiceData.description}
                    onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder={selectedAppointment.title}
                  />
                  <p className="text-xs text-slate-500 mt-1">Leave blank to use appointment title</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hourly Rate ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceData.hourly_rate}
                      onChange={(e) => setInvoiceData({ ...invoiceData, hourly_rate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hours Worked *</label>
                    <input
                      type="number"
                      step="0.25"
                      value={invoiceData.hours_worked}
                      onChange={(e) => setInvoiceData({ ...invoiceData, hours_worked: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-semibold text-slate-900">
                      ${(parseFloat(invoiceData.hourly_rate) * parseFloat(invoiceData.hours_worked)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-slate-600">Tax (12%):</span>
                    <span className="font-semibold text-slate-900">
                      ${(parseFloat(invoiceData.hourly_rate) * parseFloat(invoiceData.hours_worked) * 0.12).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-slate-200">
                    <span className="text-slate-900">Total:</span>
                    <span className="text-brand-600">
                      ${(parseFloat(invoiceData.hourly_rate) * parseFloat(invoiceData.hours_worked) * 1.12).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold rounded-lg transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    <i className="ph-bold ph-paper-plane-right text-lg"></i>
                    Create & Send Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceForm(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-lg transition-all"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setShowNewAppointmentModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">New Appointment</h2>
              <p className="text-sm text-slate-500 mt-1">Schedule a new appointment with a client</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Client *</label>
                <select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.full_name} - {client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g., Initial Consultation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Additional details about the appointment..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Meeting Method *</label>
                <select
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
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
                  {formData.location_type === 'in_person' ? 'Location' : 
                   formData.location_type === 'zoom' ? 'Zoom Link' : 
                   'Phone Number'}
                </label>
                <input
                  type="text"
                  value={formData.location_details}
                  onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder={
                    formData.location_type === 'in_person' ? 'Office, Room 101' :
                    formData.location_type === 'zoom' ? 'https://zoom.us/j/...' :
                    '+1234567890'
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-brand-600 text-white hover:bg-brand-700 font-semibold rounded-lg transition-all shadow-md shadow-brand-500/20"
                >
                  Create Appointment
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewAppointmentModal(false)}
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
