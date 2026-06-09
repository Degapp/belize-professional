"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function RemindersSettingsPage() {
  const [settings, setSettings] = useState({
    professional_id: 1, // In production, get from auth context
    days_before_due: 3,
    days_after_due: 0,
    enabled: false,
    email_subject: 'Payment Reminder - Invoice {invoice_number}',
    email_message: 'Dear {client_name},\n\nThis is a friendly reminder that your invoice {invoice_number} for {amount} is due on {due_date}.\n\nPlease arrange payment at your earliest convenience.\n\nThank you for your business!'
  });

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingReminders, setTestingReminders] = useState(false);

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch(`/api/reminders/settings?professional_id=1`);
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch(`/api/reminders/logs?professional_id=1&limit=20`);
      const data = await res.json();
      setLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const res = await fetch('/api/reminders/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const testReminders = async () => {
    setTestingReminders(true);
    
    try {
      const res = await fetch('/api/reminders/check-and-send', {
        method: 'POST'
      });
      
      const data = await res.json();
      alert(`Reminder test complete!\n\nSent: ${data.sent} reminders\n\nCheck the Activity Log below for details.`);
      
      // Reload logs to show new reminders
      loadLogs();
    } catch (error) {
      console.error('Error testing reminders:', error);
      alert('Failed to test reminders. Please check the console for details.');
    } finally {
      setTestingReminders(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Reminders</h1>
              <p className="text-gray-600">Automate invoice payment reminder emails</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_sent}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{stats.successful}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Before Due</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.before_due}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reminder Settings</h2>

          {/* Enable/Disable Toggle */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Automatic Reminders</label>
                <p className="text-sm text-gray-500 mt-1">Send automated email reminders for unpaid invoices</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  settings.enabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Timing Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days Before Due Date
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={settings.days_before_due}
                onChange={(e) => setSettings({ ...settings, days_before_due: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Send reminder this many days before the due date</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days After Due Date
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={settings.days_after_due}
                onChange={(e) => setSettings({ ...settings, days_after_due: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">Send overdue reminders every this many days</p>
            </div>
          </div>

          {/* Email Template */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={settings.email_subject}
              onChange={(e) => setSettings({ ...settings, email_subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Payment Reminder - Invoice {invoice_number}"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Message
            </label>
            <textarea
              value={settings.email_message}
              onChange={(e) => setSettings({ ...settings, email_message: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dear {client_name},..."
            />
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {['{client_name}', '{invoice_number}', '{due_date}', '{amount}', '{days_until_due}', '{days_overdue}'].map(v => (
                  <code key={v} className="px-2 py-1 bg-white rounded text-xs text-blue-700 border border-blue-200">{v}</code>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>

            <button
              onClick={testReminders}
              disabled={testingReminders}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testingReminders ? 'Testing...' : 'Test Reminders Now'}
            </button>

            {saveSuccess && (
              <span className="flex items-center text-green-600 font-medium">
                <CheckCircle className="w-5 h-5 mr-2" />
                Saved successfully
              </span>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>

          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reminders sent yet</p>
              <p className="text-sm text-gray-500 mt-1">Enable reminders above and they'll appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      log.status === 'sent' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {log.status === 'sent' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.invoice_number}</p>
                      <p className="text-sm text-gray-600">{log.client_name} • {log.recipient_email}</p>
                      {log.error_message && (
                        <p className="text-sm text-red-600 mt-1">{log.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      log.reminder_type === 'before_due' ? 'bg-blue-100 text-blue-700' :
                      log.reminder_type === 'on_due' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {log.reminder_type === 'before_due' ? 'Before Due' :
                       log.reminder_type === 'on_due' ? 'On Due Date' : 'Overdue'}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{new Date(log.sent_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
