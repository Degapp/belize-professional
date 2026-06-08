'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [analytics, setAnalytics] = useState(null);
  const [timeBillingStats, setTimeBillingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month'); // day, week, month, year
  const [exporting, setExporting] = useState(false);
  const [professionalId, setProfessionalId] = useState(null);

  // Fetch professional ID from user
  useEffect(() => {
    if (!user) return;
    
    const fetchProfessionalId = async () => {
      try {
        // Fetch the professional record for this user
        const res = await fetch(`/api/professionals?user_id=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.professionals && data.professionals.length > 0) {
            setProfessionalId(data.professionals[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching professional ID:', error);
      }
    };
    
    fetchProfessionalId();
  }, [user]);

  useEffect(() => {
    if (!professionalId) return;
    fetchAnalytics();
  }, [professionalId, timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on timeframe
      const endDate = new Date();
      let startDate = new Date();
      
      switch(timeframe) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch invoice analytics
      const analyticsRes = await fetch(
        `/api/analytics/invoices?professional_id=${professionalId}&start_date=${startDateStr}&end_date=${endDateStr}`
      );
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
      
      // Fetch time billing stats
      const timeBillingRes = await fetch(
        `/api/analytics/time-billing?professional_id=${professionalId}&start_date=${startDateStr}&end_date=${endDateStr}`
      );
      if (timeBillingRes.ok) {
        const data = await timeBillingRes.json();
        setTimeBillingStats(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportMonthlyReport = async () => {
    try {
      setExporting(true);
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Prepare CSV content with proper spreadsheet structure
      let csvContent = "Monthly Tax Report - " + monthName + "\n";
      csvContent += "Generated: " + new Date().toLocaleDateString() + "\n\n";
      
      // Main tax summary table with separate columns
      csvContent += "TAX SUMMARY\n";
      csvContent += "Description,Amount (BZD)\n";
      
      if (analytics) {
        const gstRate = 0.125; // 12.5% GST
        const subtotal = analytics.summary.total_revenue / (1 + gstRate);
        const gstAmount = analytics.summary.total_revenue - subtotal;
        
        csvContent += `Income (before GST),${subtotal.toFixed(2)}\n`;
        csvContent += `GST Tax (12.5%),${gstAmount.toFixed(2)}\n`;
        csvContent += `Grand Total (including GST),${analytics.summary.total_revenue.toFixed(2)}\n\n`;
        
        // Detailed breakdown by invoice
        csvContent += "DETAILED INVOICE BREAKDOWN\n";
        csvContent += "Invoice Number,Client,Date,Income,GST Tax,Grand Total,Status\n";
        
        // Note: This would typically fetch individual invoices, but we'll use summary data
        const avgInvoice = analytics.summary.total_revenue / (analytics.summary.total_invoices || 1);
        const invoiceSubtotal = avgInvoice / (1 + gstRate);
        const invoiceGST = avgInvoice - invoiceSubtotal;
        
        // Placeholder structure - in production would loop through actual invoices
        csvContent += `Sample Invoice,Sample Client,${new Date().toLocaleDateString()},${invoiceSubtotal.toFixed(2)},${invoiceGST.toFixed(2)},${avgInvoice.toFixed(2)},Paid\n\n`;
        
        // Payment status breakdown
        csvContent += "PAYMENT STATUS BREAKDOWN\n";
        csvContent += "Status,Count,Income,GST Tax,Grand Total\n";
        analytics.status_breakdown.forEach(status => {
          const statusTotal = parseFloat(status.total_amount);
          const statusSubtotal = statusTotal / (1 + gstRate);
          const statusGST = statusTotal - statusSubtotal;
          csvContent += `${status.status},${status.count},${statusSubtotal.toFixed(2)},${statusGST.toFixed(2)},${statusTotal.toFixed(2)}\n`;
        });
        
        csvContent += "\nREVENUE BY CLIENT\n";
        csvContent += "Client Name,Invoices,Income,GST Tax,Grand Total\n";
        analytics.top_clients.forEach(client => {
          const clientTotal = parseFloat(client.total_revenue);
          const clientSubtotal = clientTotal / (1 + gstRate);
          const clientGST = clientTotal - clientSubtotal;
          csvContent += `${client.full_name},${client.invoice_count},${clientSubtotal.toFixed(2)},${clientGST.toFixed(2)},${clientTotal.toFixed(2)}\n`;
        });
        
        csvContent += "\nPAYMENT SUMMARY\n";
        csvContent += "Category,Amount (BZD)\n";
        csvContent += `Total Paid,${analytics.summary.paid_revenue.toFixed(2)}\n`;
        csvContent += `Outstanding,${analytics.summary.outstanding_revenue.toFixed(2)}\n`;
        csvContent += `Total Invoices,${analytics.summary.total_invoices}\n`;
      }
      
      if (timeBillingStats) {
        csvContent += "\nTIME TRACKING SUMMARY\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Hours,${timeBillingStats.summary.total_hours.toFixed(2)}\n`;
        csvContent += `Billable Hours,${timeBillingStats.summary.billable_hours.toFixed(2)}\n`;
        csvContent += `Utilization Rate,${timeBillingStats.summary.utilization_rate.toFixed(1)}%\n`;
        csvContent += `Unbilled Revenue,${timeBillingStats.summary.unbilled_revenue.toFixed(2)}\n`;
      }
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tax-report-${currentMonth}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const gstRate = 0.125; // 12.5% GST for Belize
  const totalRevenue = analytics?.summary.total_revenue || 0;
  const subtotal = totalRevenue / (1 + gstRate);
  const gstAmount = totalRevenue - subtotal;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <i className="ph-light ph-arrow-left text-xl"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Financial Analytics</h1>
                <p className="text-sm text-slate-500">Income reports and GST breakdown</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Timeframe Selector */}
        <div className="mb-8 flex gap-2 bg-white p-2 rounded-xl inline-flex border border-slate-200">
          <button
            onClick={() => setTimeframe('day')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
              timeframe === 'day'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
              timeframe === 'week'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
              timeframe === 'month'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
              timeframe === 'year'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Yearly
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                <i className="ph-light ph-currency-dollar text-2xl text-emerald-600"></i>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${totalRevenue.toFixed(2)}
            </div>
            <div className="text-sm text-slate-500">
              {analytics?.summary.total_invoices || 0} invoices
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <i className="ph-light ph-check-circle text-2xl text-blue-600"></i>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Paid</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${(analytics?.summary.paid_revenue || 0).toFixed(2)}
            </div>
            <div className="text-sm text-slate-500">
              {Math.round(((analytics?.summary.paid_revenue || 0) / (totalRevenue || 1)) * 100)}% of total
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <i className="ph-light ph-clock text-2xl text-amber-600"></i>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Outstanding</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${(analytics?.summary.outstanding_revenue || 0).toFixed(2)}
            </div>
            <div className="text-sm text-slate-500">
              Pending payment
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                <i className="ph-light ph-receipt text-2xl text-purple-600"></i>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Avg Invoice</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              ${(analytics?.summary.average_invoice_value || 0).toFixed(2)}
            </div>
            <div className="text-sm text-slate-500">
              Per invoice
            </div>
          </div>
        </div>

        {/* GST Breakdown */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <i className="ph-light ph-calculator text-brand-600"></i>
                GST Tax Summary
              </h2>
              <p className="text-sm text-slate-500 mt-1">12.5% Goods & Services Tax calculation for {timeframe === 'month' ? 'monthly' : timeframe === 'year' ? 'yearly' : timeframe === 'week' ? 'weekly' : 'daily'} reporting</p>
            </div>
            <button
              onClick={exportMonthlyReport}
              disabled={exporting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {exporting ? (
                <>
                  <i className="ph-light ph-spinner animate-spin"></i>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="ph-light ph-file-spreadsheet"></i>
                  Export Tax Report (CSV)
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-sm text-slate-500 mb-2 font-medium">Income (before GST)</div>
              <div className="text-3xl font-bold text-slate-900">${subtotal.toFixed(2)}</div>
              <div className="text-xs text-slate-400 mt-1">Base revenue</div>
            </div>

            <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-sm text-amber-700 mb-2 font-medium flex items-center gap-2">
                <i className="ph-light ph-percent"></i>
                GST Tax Amount (12.5%)
              </div>
              <div className="text-3xl font-bold text-amber-900">${gstAmount.toFixed(2)}</div>
              <div className="text-xs text-amber-600 mt-1">Tax collected</div>
            </div>

            <div className="p-6 bg-brand-50 rounded-xl border border-brand-200">
              <div className="text-sm text-brand-700 mb-2 font-medium flex items-center gap-2">
                <i className="ph-light ph-equals"></i>
                Grand Total (incl. GST)
              </div>
              <div className="text-3xl font-bold text-brand-900">${totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-brand-600 mt-1">Total revenue</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <i className="ph-light ph-file-text text-xl text-blue-600 mt-0.5"></i>
              <div className="text-sm text-blue-900">
                <span className="font-semibold">Tax Reporting:</span> Click "Export Tax Report" above to download a spreadsheet with separate columns for Income, GST Tax, and Grand Total. 
                This file is formatted for easy tax filing and includes breakdowns by client, status, and payment details.
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart (Simple Bar Chart) */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <i className="ph-light ph-chart-bar text-brand-600"></i>
              Revenue Trend
            </h2>
            <p className="text-sm text-slate-500 mt-1">Monthly revenue over the past 12 months</p>
          </div>

          {analytics?.monthly_trend && analytics.monthly_trend.length > 0 ? (
            <div className="space-y-4">
              {analytics.monthly_trend.slice(0, 12).reverse().map((month, index) => {
                const revenue = parseFloat(month.revenue);
                const maxRevenue = Math.max(...analytics.monthly_trend.map(m => parseFloat(m.revenue)));
                const barWidth = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{month.month}</span>
                      <span className="font-bold text-slate-900">${revenue.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-8 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      >
                        {barWidth > 15 && (
                          <span className="text-xs font-semibold text-white">
                            {month.invoice_count} {month.invoice_count === 1 ? 'invoice' : 'invoices'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <i className="ph-light ph-chart-line-up text-4xl mb-3 text-slate-300"></i>
              <p className="text-sm">No revenue data available for the selected period</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invoice Status Breakdown */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <i className="ph-light ph-list-checks text-brand-600"></i>
                Invoice Status
              </h2>
              <p className="text-sm text-slate-500 mt-1">Breakdown by status</p>
            </div>

            {analytics?.status_breakdown && analytics.status_breakdown.length > 0 ? (
              <div className="space-y-4">
                {analytics.status_breakdown.map((status, index) => {
                  const statusColors = {
                    paid: 'emerald',
                    sent: 'blue',
                    draft: 'slate',
                    overdue: 'red',
                    cancelled: 'gray'
                  };
                  const color = statusColors[status.status] || 'slate';
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                        <div>
                          <div className="font-semibold text-slate-900 capitalize">{status.status}</div>
                          <div className="text-xs text-slate-500">{status.count} {status.count === 1 ? 'invoice' : 'invoices'}</div>
                        </div>
                      </div>
                      <div className="font-bold text-slate-900">
                        ${parseFloat(status.total_amount).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No invoice status data available</p>
              </div>
            )}
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <i className="ph-light ph-users text-brand-600"></i>
                Top Clients
              </h2>
              <p className="text-sm text-slate-500 mt-1">By total revenue</p>
            </div>

            {analytics?.top_clients && analytics.top_clients.length > 0 ? (
              <div className="space-y-3">
                {analytics.top_clients.slice(0, 5).map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{client.full_name}</div>
                        <div className="text-xs text-slate-500">{client.invoice_count} {client.invoice_count === 1 ? 'invoice' : 'invoices'}</div>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900">
                      ${parseFloat(client.total_revenue).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">No client data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Time Billing Stats */}
        {timeBillingStats && (
          <div className="mt-8 bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <i className="ph-light ph-clock-clockwise text-brand-600"></i>
                Time & Billing
              </h2>
              <p className="text-sm text-slate-500 mt-1">Hourly tracking and utilization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-sm text-blue-700 mb-2 font-medium">Total Hours</div>
                <div className="text-3xl font-bold text-blue-900">
                  {timeBillingStats.summary.total_hours.toFixed(1)}h
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="text-sm text-emerald-700 mb-2 font-medium">Billable Hours</div>
                <div className="text-3xl font-bold text-emerald-900">
                  {timeBillingStats.summary.billable_hours.toFixed(1)}h
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-xl border border-purple-100">
                <div className="text-sm text-purple-700 mb-2 font-medium">Utilization Rate</div>
                <div className="text-3xl font-bold text-purple-900">
                  {timeBillingStats.summary.utilization_rate.toFixed(1)}%
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-xl border border-amber-100">
                <div className="text-sm text-amber-700 mb-2 font-medium">Unbilled Revenue</div>
                <div className="text-3xl font-bold text-amber-900">
                  ${timeBillingStats.summary.unbilled_revenue.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
