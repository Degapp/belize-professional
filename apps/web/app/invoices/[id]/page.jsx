'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Download, 
  Send, 
  CheckCircle, 
  Clock, 
  DollarSign,
  CreditCard,
  Link as LinkIcon,
  Copy,
  Mail,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [unwrappedParams.id]);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${unwrappedParams.id}`);
      const data = await res.json();
      setInvoice(data);
      
      // Generate payment link if not exists
      if (!data.payment_link_url) {
        const link = `${window.location.origin}/pay/${data.id}`;
        setPaymentLink(link);
      } else {
        setPaymentLink(data.payment_link_url);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentLink = async () => {
    try {
      const link = `${window.location.origin}/pay/${invoice.id}`;
      
      // Save payment link to invoice
      await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_link_url: link })
      });
      
      setPaymentLink(link);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error generating payment link:', error);
    }
  };

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const markAsPaid = async () => {
    if (!confirm('Mark this invoice as paid?')) return;
    
    try {
      await fetch(`/api/payments/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice_id: invoice.id,
          amount: invoice.total_amount,
          payment_method: 'manual'
        })
      });
      
      fetchInvoice();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const markAsUnpaid = async () => {
    if (!confirm('Mark this invoice as unpaid?')) return;
    
    try {
      await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'unpaid', status: 'sent' })
      });
      
      fetchInvoice();
    } catch (error) {
      console.error('Error marking as unpaid:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invoice not found</h2>
          <Link href="/invoices" className="text-blue-600 hover:underline">
            Back to invoices
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = invoice.payment_status === 'paid';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/invoices')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to invoices
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
              <p className="text-gray-600 mt-1">Invoice details and payment status</p>
            </div>
            
            <div className="flex items-center gap-3">
              {isPaid ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Paid
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg font-medium">
                  <Clock className="w-5 h-5" />
                  Unpaid
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600" />
            Payment Options
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {!isPaid && (
              <>
                <button
                  onClick={generatePaymentLink}
                  className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <LinkIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Generate Payment Link</p>
                    <p className="text-sm text-gray-600">Share a secure payment URL</p>
                  </div>
                </button>
                
                <button
                  onClick={markAsPaid}
                  className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all"
                >
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Mark as Paid</p>
                    <p className="text-sm text-gray-600">Record manual payment</p>
                  </div>
                </button>
              </>
            )}
            
            {isPaid && (
              <button
                onClick={markAsUnpaid}
                className="flex items-center gap-3 p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-all"
              >
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Mark as Unpaid</p>
                  <p className="text-sm text-gray-600">Revert payment status</p>
                </div>
              </button>
            )}
          </div>

          {paymentLink && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Payment Link:</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={paymentLink}
                  readOnly
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={copyPaymentLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Share this link with your client for secure online payment
              </p>
            </div>
          )}
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Logo and Branding */}
          {invoice.branding_logo_url && (
            <div className="mb-8">
              <img 
                src={invoice.branding_logo_url} 
                alt="Logo" 
                className="h-16 object-contain"
              />
            </div>
          )}
          
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{invoice.branding_name}</h2>
              {invoice.branding_address && (
                <p className="text-gray-600 whitespace-pre-line">{invoice.branding_address}</p>
              )}
            </div>
            
            <div className="text-right">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h3>
              <p className="text-gray-600">#{invoice.invoice_number}</p>
            </div>
          </div>

          {/* Client and Date Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-2">BILL TO:</p>
              <p className="text-lg font-semibold text-gray-900">{invoice.client_name}</p>
              {invoice.client_email && <p className="text-gray-600">{invoice.client_email}</p>}
              {invoice.client_phone && <p className="text-gray-600">{invoice.client_phone}</p>}
              {invoice.client_address && <p className="text-gray-600">{invoice.client_address}</p>}
            </div>
            
            <div className="text-right">
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-500">Issue Date:</p>
                <p className="text-gray-900">
                  {invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Due Date:</p>
                <p className="text-gray-900">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 text-gray-600 font-semibold">Description</th>
                <th className="text-right py-3 text-gray-600 font-semibold">Qty</th>
                <th className="text-right py-3 text-gray-600 font-semibold">Rate</th>
                <th className="text-right py-3 text-gray-600 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-4 text-gray-900">{item.description}</td>
                  <td className="py-4 text-right text-gray-900">{item.quantity}</td>
                  <td className="py-4 text-right text-gray-900">
                    {invoice.currency} {parseFloat(item.unit_price).toFixed(2)}
                  </td>
                  <td className="py-4 text-right text-gray-900 font-semibold">
                    {invoice.currency} {parseFloat(item.line_total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  {invoice.currency} {parseFloat(invoice.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">GST:</span>
                <span className="font-semibold text-gray-900">
                  {invoice.currency} {parseFloat(invoice.gst_amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-3 bg-gray-50 px-4 rounded-lg mt-2">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">
                  {invoice.currency} {parseFloat(invoice.total_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-500 mb-2">Notes:</p>
              <p className="text-gray-700 whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {invoice.currency} {parseFloat(payment.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.payment_method} • {new Date(payment.paid_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-700">
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Mail className="w-5 h-5" />
            Send via Email
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <MessageSquare className="w-5 h-5" />
            Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
