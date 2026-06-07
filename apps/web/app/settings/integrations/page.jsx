'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function IntegrationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [integrations, setIntegrations] = useState({
    calendar: null,
    communication: null
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Calendar connection modal
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarData, setCalendarData] = useState({
    calendar_id: '',
    access_token: '',
    refresh_token: ''
  });

  // Email connection modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    sender_address: '',
    api_key: ''
  });

  // WhatsApp connection modal
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappData, setWhatsappData] = useState({
    sender_phone: '',
    api_key: ''
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user]);

  async function fetchIntegrations() {
    try {
      const res = await fetch(`/api/integrations?professional_id=1`);
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectCalendar() {
    setSaving(true);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: 1,
          integration_type: 'calendar',
          provider: 'google',
          config: {
            access_token: calendarData.access_token,
            refresh_token: calendarData.refresh_token,
            calendar_id: calendarData.calendar_id,
            sync_enabled: true
          }
        })
      });

      if (res.ok) {
        await fetchIntegrations();
        setShowCalendarModal(false);
        setCalendarData({ calendar_id: '', access_token: '', refresh_token: '' });
      }
    } catch (error) {
      console.error('Error connecting calendar:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleConnectEmail() {
    setSaving(true);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: 1,
          integration_type: 'communication',
          provider: 'resend',
          config: {
            channel: 'email',
            api_key: emailData.api_key,
            sender_address: emailData.sender_address,
            enabled: true
          }
        })
      });

      if (res.ok) {
        await fetchIntegrations();
        setShowEmailModal(false);
        setEmailData({ sender_address: '', api_key: '' });
      }
    } catch (error) {
      console.error('Error connecting email:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleConnectWhatsApp() {
    setSaving(true);
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: 1,
          integration_type: 'communication',
          provider: 'twilio',
          config: {
            channel: 'whatsapp',
            api_key: whatsappData.api_key,
            sender_phone: whatsappData.sender_phone,
            enabled: true
          }
        })
      });

      if (res.ok) {
        await fetchIntegrations();
        setShowWhatsAppModal(false);
        setWhatsappData({ sender_phone: '', api_key: '' });
      }
    } catch (error) {
      console.error('Error connecting WhatsApp:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(integrationType) {
    if (!confirm('Are you sure you want to disconnect this integration?')) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/integrations?professional_id=1&integration_type=${integrationType}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchIntegrations();
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    } finally {
      setSaving(false);
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading integrations...</div>
      </div>
    );
  }

  const isCalendarConnected = integrations.calendar?.sync_enabled;
  const isEmailConnected = integrations.communication?.enabled && integrations.communication?.channel === 'email';
  const isWhatsAppConnected = integrations.communication?.enabled && integrations.communication?.channel === 'whatsapp';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              <i className="ph-light ph-arrow-left text-2xl"></i>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Integrations</h1>
              <p className="text-sm text-slate-500 mt-1">Connect your tools to automate your workflow</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Google Calendar Integration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <i className="ph-light ph-calendar-blank text-blue-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Google Calendar</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Sync appointments automatically and keep your schedule up-to-date
                  </p>
                  {isCalendarConnected && integrations.calendar?.calendar_id && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <i className="ph-fill ph-check-circle text-sm"></i>
                        Connected
                      </span>
                      <span className="text-xs text-slate-500">
                        Calendar ID: {integrations.calendar.calendar_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {isCalendarConnected ? (
                <button
                  onClick={() => handleDisconnect('calendar')}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
            {isCalendarConnected && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <i className="ph-light ph-info mr-1"></i>
                  All new appointments will automatically appear in your Google Calendar
                </p>
              </div>
            )}
          </div>

          {/* Email Integration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <i className="ph-light ph-envelope text-purple-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Email Invoicing</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Send professional invoices directly to clients via email
                  </p>
                  {isEmailConnected && integrations.communication?.sender_address && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <i className="ph-fill ph-check-circle text-sm"></i>
                        Connected
                      </span>
                      <span className="text-xs text-slate-500">
                        From: {integrations.communication.sender_address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {isEmailConnected ? (
                <button
                  onClick={() => handleDisconnect('communication')}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
            {isEmailConnected && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-800">
                  <i className="ph-light ph-info mr-1"></i>
                  Invoices can now be sent to clients with one click from the invoice builder
                </p>
              </div>
            )}
          </div>

          {/* WhatsApp Integration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <i className="ph-light ph-whatsapp-logo text-green-600 text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">WhatsApp Reminders</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Send automated appointment reminders and payment notifications
                  </p>
                  {isWhatsAppConnected && integrations.communication?.sender_phone && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <i className="ph-fill ph-check-circle text-sm"></i>
                        Connected
                      </span>
                      <span className="text-xs text-slate-500">
                        Number: {integrations.communication.sender_phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {isWhatsAppConnected ? (
                <button
                  onClick={() => handleDisconnect('communication')}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Connect
                </button>
              )}
            </div>
            {isWhatsAppConnected && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800">
                  <i className="ph-light ph-info mr-1"></i>
                  Clients will receive WhatsApp messages for appointment confirmations and reminders
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Google Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Connect Google Calendar</h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="ph-light ph-x text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Calendar ID
                </label>
                <input
                  type="text"
                  value={calendarData.calendar_id}
                  onChange={(e) => setCalendarData({ ...calendarData, calendar_id: e.target.value })}
                  placeholder="primary or your-email@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Access Token
                </label>
                <input
                  type="password"
                  value={calendarData.access_token}
                  onChange={(e) => setCalendarData({ ...calendarData, access_token: e.target.value })}
                  placeholder="Enter your Google access token"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Refresh Token
                </label>
                <input
                  type="password"
                  value={calendarData.refresh_token}
                  onChange={(e) => setCalendarData({ ...calendarData, refresh_token: e.target.value })}
                  placeholder="Enter your Google refresh token"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                  <i className="ph-light ph-info mr-1"></i>
                  Get your tokens from Google Cloud Console OAuth 2.0 credentials
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectCalendar}
                disabled={saving || !calendarData.calendar_id || !calendarData.access_token}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Connect Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="ph-light ph-x text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sender Email
                </label>
                <input
                  type="email"
                  value={emailData.sender_address}
                  onChange={(e) => setEmailData({ ...emailData, sender_address: e.target.value })}
                  placeholder="invoices@yourfirm.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={emailData.api_key}
                  onChange={(e) => setEmailData({ ...emailData, api_key: e.target.value })}
                  placeholder="Enter your Resend API key"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-800">
                  <i className="ph-light ph-info mr-1"></i>
                  Get your API key from Resend.com → Settings → API Keys
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEmailModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectEmail}
                disabled={saving || !emailData.sender_address || !emailData.api_key}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Connect WhatsApp</h3>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="ph-light ph-x text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={whatsappData.sender_phone}
                  onChange={(e) => setWhatsappData({ ...whatsappData, sender_phone: e.target.value })}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Twilio API Key
                </label>
                <input
                  type="password"
                  value={whatsappData.api_key}
                  onChange={(e) => setWhatsappData({ ...whatsappData, api_key: e.target.value })}
                  placeholder="Enter your Twilio API key"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800">
                  <i className="ph-light ph-info mr-1"></i>
                  Get your API key from Twilio Console → Account → API Keys
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectWhatsApp}
                disabled={saving || !whatsappData.sender_phone || !whatsappData.api_key}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
