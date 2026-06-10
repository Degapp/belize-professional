'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import WhatsAppMessaging from '@/components/WhatsAppMessaging.jsx';

function ClientHistorySection({ professionalId }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!professionalId) return;

    async function fetchClientHistory() {
      try {
        const response = await fetch(`/api/clients/history?professionalId=${professionalId}`);
        if (!response.ok) throw new Error('Failed to fetch client history');
        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching client history:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchClientHistory();
  }, [professionalId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPaymentStatusInfo = (client) => {
    const totalPaid = parseFloat(client.total_paid) || 0;
    const totalBilled = parseFloat(client.total_billed) || 0;
    const totalOutstanding = parseFloat(client.total_outstanding) || 0;

    if (totalBilled === 0) {
      return { label: 'No Invoices', color: 'slate', icon: 'minus-circle' };
    }
    if (totalOutstanding === 0) {
      return { label: 'Fully Paid', color: 'emerald', icon: 'check-circle' };
    }
    if (totalPaid === 0) {
      return { label: 'All Pending', color: 'amber', icon: 'clock' };
    }
    return { label: 'Partial', color: 'blue', icon: 'info' };
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-slate-500">
        <i className="ph-light ph-spinner text-2xl animate-spin"></i>
        <p className="mt-2 text-sm">Loading client history...</p>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl">
        <i className="ph-light ph-users text-4xl text-slate-300 mb-3"></i>
        <p className="text-sm text-slate-500">No clients yet. Add your first client to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {clients.map((client) => {
        const statusInfo = getPaymentStatusInfo(client);
        const totalBilled = parseFloat(client.total_billed) || 0;
        const totalPaid = parseFloat(client.total_paid) || 0;
        const totalOutstanding = parseFloat(client.total_outstanding) || 0;
        
        return (
          <div 
            key={client.id} 
            className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="font-semibold text-slate-900">{client.full_name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <i className="ph-light ph-envelope"></i>
                    {client.email || 'No email'}
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-1">
                      <i className="ph-light ph-phone"></i>
                      {client.phone}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900 text-lg">${totalBilled.toFixed(2)}</div>
                <div className="text-xs text-slate-500">Total Billed</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60">
              <div>
                <div className="text-xs text-slate-500 mb-1">Paid</div>
                <div className="font-semibold text-emerald-600">${totalPaid.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Outstanding</div>
                <div className="font-semibold text-amber-600">${totalOutstanding.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Invoices</div>
                <div className="font-semibold text-slate-700">{client.total_invoices}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <i className="ph-light ph-clock"></i>
                Last activity: {formatDate(client.last_interaction)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [stats, setStats] = useState({ appointments_this_week: 0, active_clients: 0, pending_invoices: 0 });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [activeInvoiceTab, setActiveInvoiceTab] = useState('recent');
  const [newInvoice, setNewInvoice] = useState({
    client_id: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
    notes: ''
  });
  const [clients, setClients] = useState([]);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('dashboard-todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (todos.length > 0 || localStorage.getItem('dashboard-todos')) {
      localStorage.setItem('dashboard-todos', JSON.stringify(todos));
    }
  }, [todos]);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchDashboardData() {
      try {
        setLoadingData(true);
        
        // Fetch stats
        const statsRes = await fetch(`/api/dashboard/stats?professional_id=${user.id}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch recent invoices
        const invoicesRes = await fetch(`/api/invoices?professional_id=${user.id}`);
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setRecentInvoices(invoicesData.slice(0, 5) || []);
        }

        // Fetch clients for invoice creation
        const clientsRes = await fetch(`/api/clients?professional_id=${user.id}`);
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setClients(clientsData || []);
        }

        // Fetch upcoming appointments
        const appointmentsRes = await fetch(`/api/dashboard/upcoming-appointments?professional_id=${user.id}&limit=2`);
        if (appointmentsRes.ok) {
          const appointmentsData = await appointmentsRes.json();
          setUpcomingAppointments(appointmentsData.appointments || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    }

    fetchDashboardData();
  }, [user?.id]);

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const newTask = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos([...todos, newTask]);
      setNewTodo('');
    }
  };

  const handleToggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const handleAddInvoiceItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const handleRemoveInvoiceItem = (index) => {
    const items = newInvoice.items.filter((_, i) => i !== index);
    setNewInvoice({ ...newInvoice, items });
  };

  const handleInvoiceItemChange = (index, field, value) => {
    const items = [...newInvoice.items];
    items[index][field] = value;
    setNewInvoice({ ...newInvoice, items });
  };

  const calculateInvoiceTotal = () => {
    return newInvoice.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
    }, 0);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    
    if (!newInvoice.client_id || !newInvoice.invoice_number || !newInvoice.due_date) {
      alert('Please fill in all required fields');
      return;
    }

    const hasValidItems = newInvoice.items.some(item => 
      item.description && item.quantity > 0 && item.unit_price > 0
    );

    if (!hasValidItems) {
      alert('Please add at least one valid invoice item');
      return;
    }

    try {
      setCreatingInvoice(true);

      const subtotal = calculateInvoiceTotal();
      const gstAmount = subtotal * 0.10; // 10% GST
      const totalAmount = subtotal + gstAmount;

      const invoiceData = {
        professional_id: user.id,
        client_id: parseInt(newInvoice.client_id),
        invoice_number: newInvoice.invoice_number,
        issue_date: newInvoice.issue_date,
        due_date: newInvoice.due_date,
        status: 'draft',
        subtotal: subtotal.toFixed(2),
        gst_amount: gstAmount.toFixed(2),
        total_amount: totalAmount.toFixed(2),
        currency: 'BZD',
        notes: newInvoice.notes,
        items: newInvoice.items.filter(item => item.description && item.quantity > 0)
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create invoice');
      }

      const createdInvoice = await response.json();

      // Refresh invoices list
      const invoicesRes = await fetch(`/api/invoices?professional_id=${user.id}`);
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setRecentInvoices(invoicesData.slice(0, 5) || []);
      }

      // Reset form
      setNewInvoice({
        client_id: '',
        invoice_number: '',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        items: [{ description: '', quantity: 1, unit_price: 0 }],
        notes: ''
      });

      // Switch to recent invoices tab
      setActiveInvoiceTab('recent');

      alert('Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert(error.message || 'Failed to create invoice');
    } finally {
      setCreatingInvoice(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user) return null;

  return (
    <>
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
              <a href="#" onClick={() => router.push('/dashboard')} className="relative py-2 text-sm font-semibold text-brand-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600 after:rounded-full cursor-pointer">Dashboard</a>
              <a href="#" onClick={() => router.push('/analytics')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Analytics</a>
              <a href="#" onClick={() => router.push('/features')} className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">Features</a>
              <Link href="/professionals" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">
                Professionals
              </Link>
              <Link href="/invoicing" className="text-slate-700 hover:text-brand-600 transition-colors font-medium">
                Explore Interactive Invoicing
              </Link>
              <Link href="/resources" className="py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Resources
              </Link>
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

        {/* Welcome Section */}
        <section className="pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-3xl p-8 lg:p-12 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="font-clash text-3xl lg:text-4xl font-semibold mb-2">Welcome back, {user.name || user.email}!</h1>
                  <p className="text-indigo-100">Here's your practice overview at a glance.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/20">
                  <div className="text-xs text-indigo-200 uppercase tracking-wider mb-1">Email</div>
                  <div className="text-lg font-bold">{user.email}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Quick Stats */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button 
                  onClick={() => router.push('/calendar')}
                  className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <i className="ph-light ph-calendar-check text-xl"></i>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">This Week</span>
                  </div>
                  {loadingData ? (
                    <div className="text-2xl font-bold text-slate-400 mb-1">--</div>
                  ) : (
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stats.appointments_this_week}</div>
                  )}
                  <div className="text-sm text-slate-500">Appointments</div>
                </button>

                <button 
                  onClick={() => router.push('/clients')}
                  className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                      <i className="ph-light ph-users text-xl"></i>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Active</span>
                  </div>
                  {loadingData ? (
                    <div className="text-2xl font-bold text-slate-400 mb-1">--</div>
                  ) : (
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stats.active_clients}</div>
                  )}
                  <div className="text-sm text-slate-500">Clients</div>
                </button>

                <button 
                  onClick={() => router.push('/invoice-builder')}
                  className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all cursor-pointer text-left">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                      <i className="ph-light ph-receipt text-xl"></i>
                    </div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Pending</span>
                  </div>
                  {loadingData ? (
                    <div className="text-2xl font-bold text-slate-400 mb-1">--</div>
                  ) : (
                    <div className="text-2xl font-bold text-slate-900 mb-1">{stats.pending_invoices}</div>
                  )}
                  <div className="text-sm text-slate-500">Invoices</div>
                </button>
              </div>

              {/* Client Management Overview Video */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-clash text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <i className="ph-light ph-play-circle text-brand-600"></i> Client Management Overview
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Professional CRM and client management tutorial</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-2xl bg-slate-900 rounded-xl overflow-hidden">
                    <iframe
                      className="w-full"
                      width="560"
                      height="315"
                      src="https://www.youtube.com/embed/dIf4PZlzYno"
                      title="Client Management Overview - HubSpot CRM Tutorial"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <p className="text-sm text-slate-500 mt-4 text-center">Learn professional client management best practices with this comprehensive HubSpot CRM tutorial</p>
                </div>
              </div>

              {/* Video Tutorials Section */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-clash text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <i className="ph-light ph-video text-brand-600"></i> Video Tutorials
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Learn how to make the most of your dashboard</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/dIf4PZlzYno"
                        title="Client Management Overview"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">43:21</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Client Management Overview</h4>
                      <p className="text-xs text-slate-500">Add clients, manage info, and track interactions</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/ZPPikY3Qn7Q"
                        title="Document Upload & Management"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">4:15</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Document Upload & Management</h4>
                      <p className="text-xs text-slate-500">Upload and organize client documents securely</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/Xnk4seEHmgw"
                        title="Time Tracking & Billing"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">6:45</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Time Tracking & Billing</h4>
                      <p className="text-xs text-slate-500">Master timer, manual entries, and billing reports</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl overflow-hidden group hover:shadow-md transition-all">
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/KsAq3H4ErHU"
                        title="Creating & Sending Invoices"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">7:20</div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">Creating & Sending Invoices</h4>
                      <p className="text-xs text-slate-500">Create professional invoices and send to clients</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100">
                  <a href="#" onClick={() => router.push('/resources')} className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-2 cursor-pointer">
                    Browse all tutorials <i className="ph-light ph-arrow-right"></i>
                  </a>
                </div>
              </div>

              {/* WhatsApp Messaging Section */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-clash text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <i className="ph-light ph-chat-circle-dots text-brand-600"></i> WhatsApp Messages
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Send and receive messages with your clients</p>
                  </div>
                </div>

                <WhatsAppMessaging />
              </div>

              {/* Client History Section */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-clash text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <i className="ph-light ph-users text-brand-600"></i> Client History
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Chronological view of all clients with billing details</p>
                  </div>
                </div>

                <ClientHistorySection professionalId={user?.id} />
              </div>

              {/* Invoices Section with Tabs */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-clash text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <i className="ph-light ph-receipt text-brand-600"></i> Invoice Management
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">View recent invoices or create new ones</p>
                  </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-2 mb-6 border-b border-slate-200">
                  <button
                    onClick={() => setActiveInvoiceTab('recent')}
                    className={`px-4 py-2.5 text-sm font-semibold transition-all relative ${
                      activeInvoiceTab === 'recent'
                        ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <i className="ph-light ph-list mr-2"></i>
                    Recent Invoices
                  </button>
                  <button
                    onClick={() => setActiveInvoiceTab('create')}
                    className={`px-4 py-2.5 text-sm font-semibold transition-all relative ${
                      activeInvoiceTab === 'create'
                        ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-brand-600'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <i className="ph-light ph-plus-circle mr-2"></i>
                    Create Invoice
                  </button>
                </div>

                {/* Recent Invoices Tab Content */}
                {activeInvoiceTab === 'recent' && (
                  <div className="space-y-3">
                    {loadingData ? (
                      <div className="text-center py-8 text-slate-500">
                        <i className="ph-light ph-spinner text-2xl animate-spin"></i>
                        <p className="mt-2 text-sm">Loading invoices...</p>
                      </div>
                    ) : recentInvoices.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-xl">
                        <i className="ph-light ph-receipt text-4xl text-slate-300 mb-3"></i>
                        <p className="text-sm text-slate-500">No invoices yet. Create your first invoice using the "Create Invoice" tab.</p>
                      </div>
                    ) : (
                      <>
                        {recentInvoices.map((invoice) => {
                          const statusConfig = {
                            'paid': { color: 'emerald', icon: 'check-circle', label: 'Paid' },
                            'sent': { color: 'amber', icon: 'clock', label: 'Pending' },
                            'overdue': { color: 'red', icon: 'warning', label: 'Overdue' },
                            'draft': { color: 'slate', icon: 'file-dashed', label: 'Draft' }
                          };
                          const status = statusConfig[invoice.status] || statusConfig['draft'];
                          const issueDate = invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
                          const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

                          // Find client name
                          const client = clients.find(c => c.id === invoice.client_id);
                          const clientName = client?.full_name || 'Unknown Client';

                          return (
                            <div 
                              key={invoice.id}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg bg-${status.color}-50 flex items-center justify-center text-${status.color}-600`}>
                                  <i className={`ph-light ph-${status.icon} text-xl`}></i>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 text-sm">{invoice.invoice_number}</div>
                                  <div className="text-xs text-slate-500">Client: {clientName} · Issued: {issueDate} · Due: {dueDate}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-slate-900">BZD ${parseFloat(invoice.total_amount || 0).toFixed(2)}</div>
                                <div className={`text-xs text-${status.color}-600 font-semibold`}>{status.label}</div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <button 
                            onClick={() => router.push('/invoicing')}
                            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-2"
                          >
                            View all invoices <i className="ph-light ph-arrow-right"></i>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Create Invoice Tab Content */}
                {activeInvoiceTab === 'create' && (
                  <form onSubmit={handleCreateInvoice} className="space-y-6">
                    {/* Client Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Client <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newInvoice.client_id}
                        onChange={(e) => setNewInvoice({ ...newInvoice, client_id: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a client</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.full_name} - {client.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Invoice Number and Dates */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Invoice # <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newInvoice.invoice_number}
                          onChange={(e) => setNewInvoice({ ...newInvoice, invoice_number: e.target.value })}
                          placeholder="INV-001"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Issue Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={newInvoice.issue_date}
                          onChange={(e) => setNewInvoice({ ...newInvoice, issue_date: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                          Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={newInvoice.due_date}
                          onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-slate-900">
                          Invoice Items <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddInvoiceItem}
                          className="px-3 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 text-xs font-semibold rounded-lg transition-all"
                        >
                          <i className="ph-light ph-plus mr-1"></i> Add Item
                        </button>
                      </div>
                      <div className="space-y-3">
                        {newInvoice.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-slate-50 rounded-xl">
                            <div className="col-span-5">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleInvoiceItemChange(index, 'description', e.target.value)}
                                placeholder="Description"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                required
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleInvoiceItemChange(index, 'quantity', e.target.value)}
                                placeholder="Qty"
                                min="1"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                required
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => handleInvoiceItemChange(index, 'unit_price', e.target.value)}
                                placeholder="Price (BZD)"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                required
                              />
                            </div>
                            <div className="col-span-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-900">
                                ${((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)).toFixed(2)}
                              </span>
                              {newInvoice.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInvoiceItem(index)}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <i className="ph-light ph-trash text-lg"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-semibold text-slate-900">BZD ${calculateInvoiceTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">GST (10%):</span>
                        <span className="font-semibold text-slate-900">BZD ${(calculateInvoiceTotal() * 0.10).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base pt-2 border-t border-slate-200">
                        <span className="font-bold text-slate-900">Total:</span>
                        <span className="font-bold text-brand-600 text-lg">BZD ${(calculateInvoiceTotal() * 1.10).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={newInvoice.notes}
                        onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                        placeholder="Add any additional notes or payment instructions..."
                        rows="3"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={creatingInvoice}
                        className="flex-1 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
                      >
                        {creatingInvoice ? (
                          <>
                            <i className="ph-light ph-spinner animate-spin mr-2"></i>
                            Creating Invoice...
                          </>
                        ) : (
                          <>
                            <i className="ph-light ph-check mr-2"></i>
                            Create Invoice
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewInvoice({
                            client_id: '',
                            invoice_number: '',
                            issue_date: new Date().toISOString().split('T')[0],
                            due_date: '',
                            items: [{ description: '', quantity: 1, unit_price: 0 }],
                            notes: ''
                          });
                          setActiveInvoiceTab('recent');
                        }}
                        className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Right Column - Quick Actions & Calendar */}
            <div className="space-y-8">
              
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/calendar')}
                    className="w-full px-4 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-calendar-plus text-lg"></i>
                    New Appointment
                  </button>
                  <button 
                    onClick={() => router.push('/clients/new')}
                    className="w-full px-4 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-user-plus text-lg"></i>
                    Add Client
                  </button>
                  <button 
                    onClick={() => router.push('/invoice-builder')}
                    className="w-full px-4 py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-file-plus text-lg"></i>
                    Create Invoice
                  </button>
                  <button 
                    onClick={() => router.push('/analytics')}
                    className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-chart-bar text-lg"></i>
                    View Analytics
                  </button>
                  <button 
                    onClick={() => router.push('/settings/integrations')}
                    className="w-full px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-gear text-lg"></i>
                    Settings
                  </button>
                  <button 
                    onClick={() => router.push('/settings/reminders')}
                    className="w-full px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-sm font-semibold transition-all flex items-center gap-3">
                    <i className="ph-light ph-bell text-lg"></i>
                    Payment Reminders
                  </button>
                </div>
              </div>

              {/* To-Do List */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <i className="ph-light ph-check-square text-brand-600"></i> To-Do List
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {todos.filter(t => t.completed).length} / {todos.length}
                  </span>
                </div>

                {/* Add Task Form */}
                <form onSubmit={handleAddTodo} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Add a new task..."
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newTodo.trim()}
                      className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all"
                    >
                      <i className="ph-light ph-plus text-lg"></i>
                    </button>
                  </div>
                </form>

                {/* Task List */}
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {todos.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl">
                      <i className="ph-light ph-check-circle text-3xl text-slate-300 mb-2"></i>
                      <p className="text-xs text-slate-500">No tasks yet. Add your first task above!</p>
                    </div>
                  ) : (
                    todos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                          todo.completed 
                            ? 'bg-slate-50 border-slate-200' 
                            : 'bg-white border-slate-200 hover:border-brand-300'
                        }`}
                      >
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className="flex-shrink-0 mt-0.5"
                        >
                          {todo.completed ? (
                            <i className="ph-fill ph-check-square text-xl text-emerald-600"></i>
                          ) : (
                            <i className="ph-light ph-square text-xl text-slate-400 hover:text-brand-600 transition-colors"></i>
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm break-words ${
                            todo.completed 
                              ? 'text-slate-400 line-through' 
                              : 'text-slate-900'
                          }`}>
                            {todo.text}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="flex-shrink-0 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <i className="ph-light ph-trash text-lg"></i>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Upcoming This Week</h3>
                <div className="space-y-3">
                  {loadingData ? (
                    <div className="text-center py-4 text-slate-500">
                      <i className="ph-light ph-spinner text-xl animate-spin"></i>
                    </div>
                  ) : upcomingAppointments.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-xl">
                      <i className="ph-light ph-calendar-x text-3xl text-slate-300 mb-2"></i>
                      <p className="text-xs text-slate-500">No upcoming appointments</p>
                    </div>
                  ) : (
                    upcomingAppointments.map((appointment, index) => {
                      const startTime = new Date(appointment.start_at);
                      const endTime = new Date(appointment.end_at);
                      const duration = Math.round((endTime - startTime) / 60000); // minutes
                      const isToday = startTime.toDateString() === new Date().toDateString();
                      const isTomorrow = startTime.toDateString() === new Date(Date.now() + 86400000).toDateString();
                      
                      let dateLabel;
                      if (isToday) {
                        dateLabel = `Today, ${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                      } else if (isTomorrow) {
                        dateLabel = `Tomorrow, ${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
                      } else {
                        dateLabel = startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                      }

                      const meetingTypeConfig = {
                        'zoom': { color: 'emerald', label: 'Zoom' },
                        'whatsapp': { color: 'teal', label: 'WhatsApp' },
                        'google_meet': { color: 'blue', label: 'Google Meet' },
                        'in_person': { color: 'purple', label: 'In Person' },
                        'phone': { color: 'indigo', label: 'Phone' }
                      };
                      const meetingType = meetingTypeConfig[appointment.meeting_type] || { color: 'slate', label: 'Meeting' };

                      return (
                        <div 
                          key={appointment.id}
                          onClick={() => router.push('/calendar')}
                          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${index === 0 && isToday ? 'bg-brand-50 border-brand-100' : 'bg-slate-50 border-slate-100'}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className={`text-xs font-bold uppercase ${index === 0 && isToday ? 'text-brand-600' : 'text-slate-500'}`}>
                              {dateLabel}
                            </div>
                            <span className={`text-xs bg-${meetingType.color}-500/20 text-${meetingType.color}-700 px-2 py-0.5 rounded font-semibold`}>
                              {meetingType.label}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900">{appointment.client_name || 'No client'}</div>
                          <div className="text-xs text-slate-500 mt-1">{appointment.title} ({duration}m)</div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-gradient-to-br from-indigo-600 to-brand-600 rounded-2xl p-6 text-white">
                <i className="ph-light ph-headset text-3xl mb-3 opacity-80"></i>
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-indigo-100 mb-4">Our support team is available 24/7 to assist you.</p>
                <button 
                  onClick={() => router.push('/support')}
                  className="w-full px-4 py-2.5 bg-white text-brand-700 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-all active:scale-[0.98] transition-transform">
                  Contact Support
                </button>
              </div>

            </div>

          </div>
        </section>

      </div>
    </>
  );
}
