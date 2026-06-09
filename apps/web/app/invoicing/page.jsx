"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div id="video-demo" className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          poster="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=675&fit=crop&q=80"
        >
          <source
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        {/* Title Overlay */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/60 to-transparent">
          <h3 className="text-white text-2xl font-bold">Interactive Invoicing Features Demo</h3>
          <p className="text-gray-200 mt-1">Complete walkthrough of all invoicing capabilities</p>
        </div>
      </div>

      {/* Video Controls */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progress}%, #374151 ${progress}%, #374151 100%)`
            }}
          />
          <div className="flex justify-between text-sm text-gray-400 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              {isPlaying ? (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Skip Backward */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, currentTime - 10);
                }
              }}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              title="Rewind 10 seconds"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.min(duration, currentTime + 10);
                }
              }}
              className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center transition-colors"
              title="Forward 10 seconds"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
              </svg>
            </button>
          </div>

          {/* Feature Tags */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
              HD Quality
            </span>
            <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">
              Full Tutorial
            </span>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="bg-gray-900 p-6 border-t border-gray-700">
        <h4 className="text-white font-semibold mb-3">What You'll Learn:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-300 text-sm">
          <div className="flex items-start">
            <span className="text-green-400 mr-2">▶</span>
            Creating professional invoices with custom branding
          </div>
          <div className="flex items-start">
            <span className="text-green-400 mr-2">▶</span>
            Automated time tracking and billing
          </div>
          <div className="flex items-start">
            <span className="text-green-400 mr-2">▶</span>
            Setting up online payment collection
          </div>
          <div className="flex items-start">
            <span className="text-green-400 mr-2">▶</span>
            Sending invoices via email and WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicingPage() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [timeBillingStats, setTimeBillingStats] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reminder settings state
  const [reminderSettings, setReminderSettings] = useState(null);
  const [reminderLogs, setReminderLogs] = useState([]);
  const [editingSettings, setEditingSettings] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const professionalId = 1; // In production, get from auth context
        
        // Fetch analytics
        const analyticsRes = await fetch(`/api/analytics/invoices?professional_id=${professionalId}`);
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }
        
        // Fetch time billing stats
        const timeBillingRes = await fetch(`/api/analytics/time-billing?professional_id=${professionalId}`);
        if (timeBillingRes.ok) {
          const timeBillingData = await timeBillingRes.json();
          setTimeBillingStats(timeBillingData);
        }
        
        // Fetch unbilled time entries
        const timeEntriesRes = await fetch(`/api/time-entries?professional_id=${professionalId}&invoiced=false`);
        if (timeEntriesRes.ok) {
          const timeEntriesData = await timeEntriesRes.json();
          setTimeEntries(timeEntriesData);
        }
        
        // Fetch templates
        const templatesRes = await fetch(`/api/invoice-templates?professional_id=${professionalId}`);
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData);
        }
        
        // Fetch all invoices
        const invoicesRes = await fetch(`/api/invoices?professional_id=${professionalId}`);
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          setInvoices(invoicesData.invoices || []);
        }

        // Fetch reminder settings
        const settingsRes = await fetch(`/api/reminders/settings?professional_id=${professionalId}`);
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setReminderSettings(settingsData);
        }

        // Fetch reminder logs
        const logsRes = await fetch(`/api/reminders/logs?professional_id=${professionalId}&limit=20`);
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setReminderLogs(logsData.logs || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateInvoice = async () => {
    try {
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: 1,
          client_id: 1,
          time_entry_ids: timeEntries.slice(0, 3).map(e => e.id),
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      });
      
      if (response.ok) {
        const invoice = await response.json();
        alert(`Invoice ${invoice.invoice_number} generated successfully!`);
        // Refresh data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice');
    }
  };

  const handleSendEmail = async (invoiceId) => {
    try {
      const response = await fetch('/api/invoices/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoiceId,
          message: 'Please find your invoice attached. Payment is due within 30 days.'
        })
      });
      
      if (response.ok) {
        alert('Invoice sent via email successfully!');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  const handleSendWhatsApp = async (invoiceId) => {
    try {
      const response = await fetch('/api/invoices/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId })
      });
      
      if (response.ok) {
        alert('WhatsApp reminder sent successfully!');
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      alert('Failed to send WhatsApp reminder');
    }
  };

  const handleCheckReminders = async () => {
    try {
      const response = await fetch('/api/reminders/check-and-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professional_id: 1 })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Checked reminders. Sent: ${result.sent} reminder(s)`);
        // Refresh logs
        const logsRes = await fetch('/api/reminders/logs?professional_id=1&limit=20');
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setReminderLogs(logsData.logs || []);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
      alert('Failed to check reminders');
    }
  };

  const handleSaveReminderSettings = async () => {
    try {
      const response = await fetch('/api/reminders/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reminderSettings)
      });
      
      if (response.ok) {
        const result = await response.json();
        setReminderSettings(result);
        setEditingSettings(false);
        alert('Reminder settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">BP</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Belize Professionals
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/analytics" className="text-gray-700 hover:text-blue-600 transition-colors">
                Analytics
              </Link>
              <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </Link>
              <Link href="/professionals" className="text-gray-700 hover:text-blue-600 transition-colors">
                Professionals
              </Link>
              <Link href="/invoicing" className="text-blue-600 font-semibold border-b-2 border-blue-600">
                Explore Interactive Invoicing
              </Link>
              <Link href="/resources" className="text-gray-700 hover:text-blue-600 transition-colors">
                Resources
              </Link>
              <Link href="/accounting" className="text-gray-700 hover:text-blue-600 transition-colors">
                Accounting
              </Link>
              <Link href="/support" className="text-gray-700 hover:text-blue-600 transition-colors">
                Support
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About Us
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Explore Interactive Invoicing
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Streamline your billing process with our comprehensive invoicing features designed for professionals
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Create Invoices */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Create Professional Invoices</h3>
              <p className="text-gray-600 mb-6">
                Generate branded invoices with your logo, custom itemization, and professional layouts
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Custom logo upload
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Itemized billing
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Tax calculations
                </li>
              </ul>
            </div>

            {/* Time Tracking */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Automated Time Billing</h3>
              <p className="text-gray-600 mb-6">
                Track billable hours and automatically convert them into invoice line items
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Hourly rate tracking
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Activity logging
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Automatic totals
                </li>
              </ul>
            </div>

            {/* Payment Integration */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Online Payment Collection</h3>
              <p className="text-gray-600 mb-6">
                Accept payments directly through bank transfers and online payment methods
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Bank account integration
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Payment tracking
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Receipt generation
                </li>
              </ul>
            </div>

            {/* Email Delivery */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Email Invoice Delivery</h3>
              <p className="text-gray-600 mb-6">
                Send invoices directly to clients via email with professional templates
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  One-click email sending
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Custom email templates
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Delivery tracking
                </li>
              </ul>
            </div>

            {/* WhatsApp Reminders */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">WhatsApp Reminders</h3>
              <p className="text-gray-600 mb-6">
                Automatically send payment reminders and invoice notifications via WhatsApp
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Automated reminders
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Custom scheduling
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Delivery confirmation
                </li>
              </ul>
            </div>

            {/* Reports & Analytics */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Reports & Analytics</h3>
              <p className="text-gray-600 mb-6">
                Track revenue, outstanding payments, and generate financial reports
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Revenue tracking
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Payment status
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  Export reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Watch Our Interactive Invoicing Demo
            </h2>
            <p className="text-xl text-gray-600">
              See how easy it is to create, send, and manage professional invoices
            </p>
          </div>
          
          <VideoPlayer />
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Streamline Your Invoicing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start creating professional invoices with automated time tracking and payment collection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Get Started Now
            </Link>
            <a
              href="#video-demo"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Watch Demo Video
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            © 2024 Belize Professionals. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Tabbed Interface */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'dashboard'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('trackTime')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'trackTime'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                ⏱️ Track Time
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'invoices'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                📄 Invoices
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'reports'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                📈 Reports
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-colors ${
                  activeTab === 'reminders'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                🔔 Email Reminders
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                BZD {analytics?.summary?.total_revenue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-green-600 mt-2">↑ {analytics?.summary?.total_invoices || 0} invoices</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Outstanding</p>
              <p className="text-3xl font-bold text-orange-600">
                BZD {analytics?.summary?.outstanding_revenue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Awaiting payment</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Unbilled Time</p>
              <p className="text-3xl font-bold text-blue-600">
                {timeBillingStats?.summary?.unbilled_revenue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">{timeEntries?.length || 0} entries</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Avg Invoice Value</p>
              <p className="text-3xl font-bold text-gray-900">
                BZD {analytics?.summary?.average_invoice_value?.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Per invoice</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg mb-12 text-white">
            <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <button 
                onClick={handleGenerateInvoice}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Generate Invoice
              </button>
              <button className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition border border-white/20">
                Track Time
              </button>
              <button className="bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition border border-white/20">
                View Reports
              </button>
            </div>
          </div>

          {/* Unbilled Time Entries */}
          {timeEntries && timeEntries.length > 0 && (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Unbilled Time Entries</h3>
              <div className="space-y-3">
                {timeEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{entry.description || 'Time Entry'}</p>
                      <p className="text-sm text-gray-600">{entry.client_name} • {entry.hours_worked} hours</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">BZD {entry.total_amount}</p>
                      <p className="text-xs text-gray-500">{new Date(entry.started_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Templates</h3>
              <p className="text-gray-600 mb-4">Create invoices with your logo and branding using {templates?.length || 0} custom templates.</p>
              <p className="text-sm text-blue-600 font-medium">{templates?.filter(t => t.is_default).length || 0} default template</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Automated Time Billing</h3>
              <p className="text-gray-600 mb-4">Track time automatically and calculate hours with precision.</p>
              <p className="text-sm text-green-600 font-medium">
                {timeBillingStats?.summary?.utilization_rate?.toFixed(1) || 0}% utilization rate
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Online Payment Collection</h3>
              <p className="text-gray-600 mb-4">Accept payments via Stripe, PayPal, and bank transfers.</p>
              <p className="text-sm text-purple-600 font-medium">
                Avg {analytics?.summary?.avg_days_to_payment?.toFixed(0) || 0} days to payment
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Invoice Delivery</h3>
              <p className="text-gray-600 mb-4">Send invoices directly to clients with customizable templates.</p>
              <button 
                onClick={() => handleSendEmail(1)}
                className="text-sm text-yellow-600 font-medium hover:text-yellow-700"
              >
                Send Test Email →
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp Reminders</h3>
              <p className="text-gray-600 mb-4">Automated payment reminders sent via WhatsApp.</p>
              <button 
                onClick={() => handleSendWhatsApp(1)}
                className="text-sm text-red-600 font-medium hover:text-red-700"
              >
                Send Test Reminder →
              </button>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reports & Analytics</h3>
              <p className="text-gray-600 mb-4">Track invoice metrics and revenue trends in real-time.</p>
              <p className="text-sm text-indigo-600 font-medium">
                {analytics?.top_clients?.length || 0} active clients
              </p>
            </div>
          </div>
                </div>
              )}

              {/* Track Time Tab */}
              {activeTab === 'trackTime' && (
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Time Entries</h2>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        + New Entry
                      </button>
                    </div>

                    {timeEntries && timeEntries.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Hours</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {timeEntries.map((entry) => (
                              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {new Date(entry.started_at).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">{entry.client_name}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{entry.description}</td>
                                <td className="py-3 px-4 text-sm text-right text-gray-900">{entry.hours_worked}</td>
                                <td className="py-3 px-4 text-sm text-right text-gray-900">
                                  BZD {parseFloat(entry.hourly_rate).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                                  BZD {parseFloat(entry.total_amount).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {entry.invoiced ? (
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                      Invoiced
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                                      Unbilled
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No time entries found</p>
                        <p className="text-sm">Start tracking your billable hours</p>
                      </div>
                    )}
                  </div>

                  {/* Billing Summary */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium mb-1">Total Hours</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {timeEntries.reduce((sum, e) => sum + parseFloat(e.hours_worked || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                      <p className="text-sm text-green-700 font-medium mb-1">Unbilled Amount</p>
                      <p className="text-3xl font-bold text-green-900">
                        BZD {timeEntries
                          .filter(e => !e.invoiced)
                          .reduce((sum, e) => sum + parseFloat(e.total_amount || 0), 0)
                          .toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                      <p className="text-sm text-purple-700 font-medium mb-1">Avg Hourly Rate</p>
                      <p className="text-3xl font-bold text-purple-900">
                        BZD {timeEntries.length > 0
                          ? (timeEntries.reduce((sum, e) => sum + parseFloat(e.hourly_rate || 0), 0) / timeEntries.length).toFixed(2)
                          : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoices Tab */}
              {activeTab === 'invoices' && (
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
                      <button 
                        onClick={handleGenerateInvoice}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        + Generate Invoice
                      </button>
                    </div>

                    {invoices && invoices.length > 0 ? (
                      <div className="space-y-4">
                        {invoices.map((invoice) => (
                          <div 
                            key={invoice.id} 
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{invoice.invoice_number}</h3>
                                <p className="text-sm text-gray-600">{invoice.client_name}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                  BZD {parseFloat(invoice.total_amount).toFixed(2)}
                                </p>
                                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mt-2 ${
                                  invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                  invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                              <div>
                                <p className="text-gray-500">Issue Date</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(invoice.issue_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Due Date</p>
                                <p className="font-medium text-gray-900">
                                  {new Date(invoice.due_date).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Subtotal</p>
                                <p className="font-medium text-gray-900">
                                  BZD {parseFloat(invoice.subtotal).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">GST (12.5%)</p>
                                <p className="font-medium text-gray-900">
                                  BZD {parseFloat(invoice.gst_amount).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleSendEmail(invoice.id)}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                              >
                                📧 Send Email
                              </button>
                              <button
                                onClick={() => handleSendWhatsApp(invoice.id)}
                                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition"
                              >
                                💬 WhatsApp
                              </button>
                              <button className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition">
                                📄 Download PDF
                              </button>
                              {invoice.status === 'sent' && (
                                <button className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                                  💳 Record Payment
                                </button>
                              )}
                            </div>

                            {(invoice.sent_via_email || invoice.sent_via_whatsapp) && (
                              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-600">
                                {invoice.sent_via_email && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-green-600">✓</span> Email sent
                                  </span>
                                )}
                                {invoice.sent_via_whatsapp && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-green-600">✓</span> WhatsApp sent
                                  </span>
                                )}
                                {invoice.paid_at && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-green-600">✓</span> Paid {new Date(invoice.paid_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No invoices yet</p>
                        <p className="text-sm">Generate your first invoice to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email Reminders Tab */}
              {activeTab === 'reminders' && (
                <div>
                  {/* Reminder Settings Card */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">Automated Email Reminder Settings</h2>
                        <p className="text-sm text-gray-600 mt-1">Configure when payment reminder emails are automatically sent to clients</p>
                      </div>
                      {!editingSettings && reminderSettings && (
                        <button
                          onClick={() => setEditingSettings(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          ✏️ Edit Settings
                        </button>
                      )}
                    </div>

                    {reminderSettings ? (
                      <div>
                        {editingSettings ? (
                          <div className="space-y-6">
                            {/* Enable/Disable Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">Enable Automated Reminders</p>
                                <p className="text-sm text-gray-600">Turn on/off automatic email reminders</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={reminderSettings.enabled}
                                  onChange={(e) => setReminderSettings({...reminderSettings, enabled: e.target.checked})}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                              </label>
                            </div>

                            {/* Days Before Due */}
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <label className="block mb-2">
                                <span className="font-medium text-gray-900">Days Before Due Date</span>
                                <p className="text-sm text-gray-600 mb-2">Send reminder this many days before the invoice is due</p>
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={reminderSettings.days_before_due || 7}
                                  onChange={(e) => setReminderSettings({...reminderSettings, days_before_due: parseInt(e.target.value)})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </label>
                            </div>

                            {/* Days After Due */}
                            <div className="p-4 bg-orange-50 rounded-lg">
                              <label className="block mb-2">
                                <span className="font-medium text-gray-900">Days After Due Date</span>
                                <p className="text-sm text-gray-600 mb-2">Send overdue reminder this many days after the due date</p>
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={reminderSettings.days_after_due || 7}
                                  onChange={(e) => setReminderSettings({...reminderSettings, days_after_due: parseInt(e.target.value)})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                              </label>
                            </div>

                            {/* Email Subject */}
                            <div>
                              <label className="block mb-2">
                                <span className="font-medium text-gray-900">Email Subject Template</span>
                                <p className="text-sm text-gray-600 mb-2">
                                  Available variables: {'{invoice_number}'}, {'{client_name}'}, {'{total_amount}'}, {'{currency}'}, {'{due_date}'}
                                </p>
                                <input
                                  type="text"
                                  value={reminderSettings.email_subject}
                                  onChange={(e) => setReminderSettings({...reminderSettings, email_subject: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Payment Reminder: Invoice {{invoice_number}}"
                                />
                              </label>
                            </div>

                            {/* Email Message */}
                            <div>
                              <label className="block mb-2">
                                <span className="font-medium text-gray-900">Email Message Template</span>
                                <p className="text-sm text-gray-600 mb-2">
                                  Available variables: {'{invoice_number}'}, {'{client_name}'}, {'{total_amount}'}, {'{currency}'}, {'{due_date}'}
                                </p>
                                <textarea
                                  rows="6"
                                  value={reminderSettings.email_message}
                                  onChange={(e) => setReminderSettings({...reminderSettings, email_message: e.target.value})}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Dear {{client_name}},\n\nThis is a friendly reminder..."
                                />
                              </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={handleSaveReminderSettings}
                                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                              >
                                💾 Save Settings
                              </button>
                              <button
                                onClick={() => setEditingSettings(false)}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Current Settings Display */}
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                <p className="text-lg font-semibold">
                                  {reminderSettings.enabled ? (
                                    <span className="text-green-600">✓ Enabled</span>
                                  ) : (
                                    <span className="text-red-600">✗ Disabled</span>
                                  )}
                                </p>
                              </div>
                              <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Before Due Date</p>
                                <p className="text-lg font-semibold text-blue-900">{reminderSettings.days_before_due} days</p>
                              </div>
                              <div className="p-4 bg-orange-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">After Due Date</p>
                                <p className="text-lg font-semibold text-orange-900">{reminderSettings.days_after_due} days</p>
                              </div>
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Email Subject</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{reminderSettings.email_subject}</p>
                              </div>
                            </div>

                            {/* Preview Message */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600 mb-2">Email Message Template</p>
                              <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">{reminderSettings.email_message}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>Loading settings...</p>
                      </div>
                    )}
                  </div>

                  {/* Manual Check Button */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg mb-6 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Manual Reminder Check</h3>
                        <p className="text-blue-100">Check all invoices now and send reminders based on your settings</p>
                      </div>
                      <button
                        onClick={handleCheckReminders}
                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition shadow-lg"
                      >
                        🔍 Check Now
                      </button>
                    </div>
                  </div>

                  {/* Reminder Logs */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Reminder Activity</h2>
                    
                    {reminderLogs && reminderLogs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reminder Type</th>
                              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Recipient</th>
                              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reminderLogs.map((log) => (
                              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {new Date(log.sent_at).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                  {log.invoice_number}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-900">
                                  {log.client_name}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    log.reminder_type === 'before_due' ? 'bg-blue-100 text-blue-700' :
                                    log.reminder_type === 'on_due_date' ? 'bg-yellow-100 text-yellow-700' :
                                    log.reminder_type === 'after_due' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {log.reminder_type === 'before_due' ? '📅 Before Due' :
                                     log.reminder_type === 'on_due_date' ? '⏰ On Due Date' :
                                     log.reminder_type === 'after_due' ? '⚠️ Overdue' :
                                     log.reminder_type}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {log.recipient_email}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    log.status === 'sent' ? 'bg-green-100 text-green-700' :
                                    log.status === 'failed' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {log.status === 'sent' ? '✓ Sent' : log.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">No reminder activity yet</p>
                        <p className="text-sm">Reminders will appear here once they are sent</p>
                      </div>
                    )}
                  </div>

                  {/* Info Box */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      How Automated Reminders Work
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>The system checks all unpaid invoices daily and sends reminders based on your configured intervals</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Reminders are sent at three key times: before due date, on due date, and after due date (for overdue invoices)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Each reminder is only sent once per type to avoid spam</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>You can use {'{invoice_number}'}, {'{client_name}'}, {'{total_amount}'}, {'{currency}'}, and {'{due_date}'} placeholders in your message templates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>Click "Check Now" to manually trigger a reminder check instead of waiting for the automatic daily run</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Reports Tab */}
              {activeTab === 'reports' && (
                <div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Reports</h2>
                    
                    {/* Invoice Status Breakdown */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Breakdown</h3>
                      <div className="grid md:grid-cols-4 gap-4">
                        {analytics?.by_status?.map((statusItem) => (
                          <div key={statusItem.status} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">{statusItem.status}</p>
                            <p className="text-2xl font-bold text-gray-900">{statusItem.count}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              BZD {parseFloat(statusItem.total || 0).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Clients */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
                      <div className="space-y-3">
                        {analytics?.top_clients?.map((client) => (
                          <div key={client.client_id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{client.client_name}</p>
                              <p className="text-sm text-gray-600">{client.invoice_count} invoices</p>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              BZD {parseFloat(client.total_revenue).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time Billing Analytics */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Time Billing Analytics</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <p className="text-sm text-blue-700 mb-1">Utilization Rate</p>
                        <p className="text-3xl font-bold text-blue-900">
                          {timeBillingStats?.summary?.utilization_rate?.toFixed(1) || 0}%
                        </p>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg">
                        <p className="text-sm text-green-700 mb-1">Unbilled Revenue</p>
                        <p className="text-3xl font-bold text-green-900">
                          BZD {timeBillingStats?.summary?.unbilled_revenue?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <p className="text-sm text-purple-700 mb-1">Avg Days to Payment</p>
                        <p className="text-3xl font-bold text-purple-900">
                          {analytics?.summary?.avg_days_to_payment?.toFixed(0) || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}