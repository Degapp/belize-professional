'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ReminderSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [manualTestAppointment, setManualTestAppointment] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [professionalId] = useState(1); // In production, get from auth context

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  async function fetchUpcomingAppointments() {
    try {
      const response = await fetch('/api/admin/appointments');
      if (response.ok) {
        const data = await response.json();
        const upcoming = data.filter(apt => {
          const startDate = new Date(apt.start_at);
          return startDate > new Date() && apt.status === 'scheduled';
        });
        setUpcomingAppointments(upcoming.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }

  async function testAutomatedReminders() {
    setLoading(true);
    setTestResults(null);
    
    try {
      const response = await fetch('/api/appointments/auto-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professional_id: professionalId })
      });

      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function sendManualReminder() {
    if (!manualTestAppointment) {
      alert('Please select an appointment');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/appointments/send-payment-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: parseInt(manualTestAppointment) })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Reminder sent to: ${data.sent_to}`);
        setManualTestAppointment('');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <i className="ph-light ph-arrow-left text-xl"></i>
            <span>Back to Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-clash font-semibold text-slate-900">
            Automated Payment Reminders
          </h1>
          <p className="text-slate-600 mt-2">
            Manage automated email reminders for upcoming appointments
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">How It Works</h2>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Automatic Scheduling</h3>
                <p className="text-sm text-slate-600">
                  When you create or confirm an appointment that's 3+ days away, a payment reminder is automatically scheduled for 3 days before the appointment.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Daily Automated Sending</h3>
                <p className="text-sm text-slate-600">
                  A cron job runs daily at 9 AM to check all scheduled reminders and sends emails to clients with appointment details and payment links.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Payment Information</h3>
                <p className="text-sm text-slate-600">
                  Each reminder includes the appointment date/time, service details, estimated cost based on hourly rate, and a payment link.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Automated Reminders */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Test Automated Reminder System
          </h2>
          
          <p className="text-sm text-slate-600 mb-4">
            Check which appointments scheduled 3 days from now would receive automated reminders:
          </p>

          <button
            onClick={testAutomatedReminders}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Checking...' : 'Run Test Check (3 Days Ahead)'}
          </button>

          {testResults && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Test Results:</h3>
              
              <div className="space-y-2 text-sm">
                <p><strong>Date Checked:</strong> {testResults.checked_date}</p>
                <p><strong>Appointments Found:</strong> {testResults.appointments_found}</p>
                <p><strong>Reminders Sent:</strong> {testResults.reminders_sent}</p>
              </div>

              {testResults.reminders && testResults.reminders.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Reminders:</h4>
                  <div className="space-y-3">
                    {testResults.reminders.map((r, idx) => (
                      <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200">
                        <p className="text-sm"><strong>Client:</strong> {r.client_name}</p>
                        <p className="text-sm"><strong>Email:</strong> {r.client_email}</p>
                        <p className="text-sm"><strong>Appointment:</strong> {r.appointment_date} at {r.appointment_time}</p>
                        <p className="text-sm"><strong>Estimated Cost:</strong> ${r.estimated_cost?.toFixed(2) || 'TBD'}</p>
                        <p className="text-sm text-indigo-600 truncate">
                          <strong>Payment Link:</strong> {r.payment_link}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {testResults.error && (
                <p className="text-red-600 mt-2">{testResults.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Manual Reminder */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Send Manual Payment Reminder
          </h2>
          
          <p className="text-sm text-slate-600 mb-4">
            Manually send a payment reminder for any upcoming appointment:
          </p>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Appointment
              </label>
              <select
                value={manualTestAppointment}
                onChange={(e) => setManualTestAppointment(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose an appointment...</option>
                {upcomingAppointments.map(apt => (
                  <option key={apt.id} value={apt.id}>
                    {apt.title} - {apt.client_name} - {new Date(apt.start_at).toLocaleDateString()} {new Date(apt.start_at).toLocaleTimeString()}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={sendManualReminder}
              disabled={loading || !manualTestAppointment}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Reminder'}
            </button>
          </div>
        </div>

        {/* Cron Setup Instructions */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Production Setup</h2>
          
          <div className="space-y-3 text-sm">
            <p>
              <strong>vercel.json</strong> has been configured to run the cron job daily at 9 AM:
            </p>
            <pre className="bg-white/10 rounded-lg p-3 overflow-x-auto">
{`{
  "crons": [{
    "path": "/api/cron/send-appointment-reminders",
    "schedule": "0 9 * * *"
  }]
}`}
            </pre>

            <p className="mt-4">
              <strong>Email Integration:</strong> To send actual emails, integrate with:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Resend (recommended)</li>
              <li>SendGrid</li>
              <li>AWS SES</li>
              <li>Postmark</li>
            </ul>

            <p className="mt-4">
              The reminder email template is ready and includes appointment details, service info, estimated cost, and payment link.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
