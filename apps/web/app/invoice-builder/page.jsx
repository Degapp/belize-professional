"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";

export default function InvoiceBuilderPage() {
  const router = useRouter();
  const invoiceRef = useRef(null);
  
  // Professional/Client data
  const [professionals, setProfessionals] = useState([]);
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Invoice metadata
  const [invoiceNumber, setInvoiceNumber] = useState("INV-0001");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  
  // Time entries and line items
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedTimeEntries, setSelectedTimeEntries] = useState([]);
  const [lineItems, setLineItems] = useState([]);
  
  // GST settings
  const [gstPercent, setGstPercent] = useState(12.5);
  const [showGst, setShowGst] = useState(true);
  
  // Logo
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In production, get from auth context
        const professionalId = 1;
        
        // Fetch clients
        const clientsRes = await fetch(`/api/clients?professional_id=${professionalId}`);
        if (clientsRes.ok) {
          const clientsData = await clientsRes.json();
          setClients(clientsData.clients || []);
        }
        
        // Fetch templates
        const templatesRes = await fetch(`/api/invoice-templates?professional_id=${professionalId}`);
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData);
          
          // Set default template
          const defaultTemplate = templatesData.find(t => t.is_default);
          if (defaultTemplate) {
            setSelectedTemplate(defaultTemplate);
            setGstPercent(defaultTemplate.show_gst ? 12.5 : 0);
            setShowGst(defaultTemplate.show_gst);
          }
        }
        
        // Mock professional data (in production, fetch from API)
        const mockProfessional = {
          id: 1,
          display_name: "John Doe",
          firm_name: "Doe Legal Services",
          email: "john@doelegal.com",
          phone: "+501-223-4567",
          address: "123 Main Street, Belize City, Belize",
          logo_url: "",
          gst_percent: 12.5
        };
        
        setSelectedProfessional(mockProfessional);
        setLogoUrl(mockProfessional.logo_url || "");
        setGstPercent(mockProfessional.gst_percent || 12.5);
        
        // Generate next invoice number
        const invoicesRes = await fetch(`/api/invoices?professional_id=${professionalId}`);
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          const invoices = invoicesData.invoices || [];
          
          if (invoices.length > 0) {
            const lastInvoice = invoices[0];
            const lastNum = parseInt(lastInvoice.invoice_number.split("-")[1]);
            setInvoiceNumber(`INV-${String(lastNum + 1).padStart(4, "0")}`);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Load time entries when client is selected
  useEffect(() => {
    if (!selectedClient) return;
    
    const fetchTimeEntries = async () => {
      try {
        const res = await fetch(
          `/api/time-entries?professional_id=1&client_id=${selectedClient.id}&invoiced=false`
        );
        
        if (res.ok) {
          const data = await res.json();
          setTimeEntries(data);
        }
      } catch (error) {
        console.error("Error fetching time entries:", error);
      }
    };
    
    fetchTimeEntries();
  }, [selectedClient]);
  
  // Add new line item
  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now(),
        description: "",
        quantity: 1,
        unit_price: 0
      }
    ]);
  };
  
  // Update line item
  const updateLineItem = (id, field, value) => {
    setLineItems(
      lineItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };
  
  // Remove line item
  const removeLineItem = (id) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };
  
  // Toggle time entry selection
  const toggleTimeEntry = (entryId) => {
    setSelectedTimeEntries(prev =>
      prev.includes(entryId)
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };
  
  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    
    // Add selected time entries
    const selectedEntries = timeEntries.filter(e => selectedTimeEntries.includes(e.id));
    selectedEntries.forEach(entry => {
      subtotal += parseFloat(entry.total_amount || 0);
    });
    
    // Add line items
    lineItems.forEach(item => {
      const lineTotal = parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
      subtotal += lineTotal;
    });
    
    const gstAmount = showGst ? (subtotal * gstPercent) / 100 : 0;
    const total = subtotal + gstAmount;
    
    return {
      subtotal: subtotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      total: total.toFixed(2)
    };
  };
  
  const totals = calculateTotals();
  
  // Handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingLogo(true);
      
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogoUrl(data.url);
      } else {
        alert("Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };
  
  // Save invoice
  const handleSave = async () => {
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professional_id: 1,
          client_id: selectedClient.id,
          time_entry_ids: selectedTimeEntries,
          custom_items: lineItems.map(item => ({
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit_price: parseFloat(item.unit_price)
          })),
          template_id: selectedTemplate?.id,
          issue_date: issueDate,
          due_date: dueDate,
          notes: notes
        })
      });
      
      if (response.ok) {
        const invoice = await response.json();
        alert(`Invoice ${invoice.invoice_number} saved successfully!`);
        router.push("/invoicing");
      } else {
        alert("Failed to save invoice");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };
  
  // Download invoice as image
  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: "#ffffff"
      });
      
      const link = document.createElement("a");
      link.download = `${invoiceNumber}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice");
    }
  };
  
  // Send invoice
  const handleSend = async () => {
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }
    
    // First save the invoice
    await handleSave();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice builder...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoice Builder</h1>
              <p className="text-gray-600 mt-1">Create professional invoices with time entries and custom items</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/invoicing")}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDownload}
                disabled={!selectedClient}
                className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={!selectedClient || saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Invoice"}
              </button>
              
              <button
                onClick={handleSend}
                disabled={!selectedClient || saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Invoice Builder */}
          <div className="lg:col-span-1 space-y-6">
            {/* Client Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Client
                  </label>
                  <select
                    value={selectedClient?.id || ""}
                    onChange={(e) => {
                      const client = clients.find(c => c.id === parseInt(e.target.value));
                      setSelectedClient(client);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedClient && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                    <p className="text-gray-900 font-medium">{selectedClient.full_name}</p>
                    <p className="text-gray-600">{selectedClient.email}</p>
                    <p className="text-gray-600">{selectedClient.phone}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Invoice Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Additional notes or payment terms..."
                  />
                </div>
              </div>
            </div>
            
            {/* Logo Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Branding</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                
                {logoUrl ? (
                  <div className="space-y-3">
                    <img
                      src={logoUrl}
                      alt="Company logo"
                      className="h-20 object-contain bg-gray-50 rounded-lg p-2 border border-gray-200"
                    />
                    <button
                      onClick={() => setLogoUrl("")}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove logo
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="block w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      {uploadingLogo ? (
                        <span className="text-gray-600">Uploading...</span>
                      ) : (
                        <span className="text-gray-600">
                          Click to upload logo
                        </span>
                      )}
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            {/* GST Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Include GST
                  </label>
                  <button
                    onClick={() => setShowGst(!showGst)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showGst ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showGst ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                
                {showGst && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Time Entries */}
            {selectedClient && timeEntries.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Unbilled Time Entries
                </h3>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {timeEntries.map(entry => (
                    <label
                      key={entry.id}
                      className="flex items-start p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTimeEntries.includes(entry.id)}
                        onChange={() => toggleTimeEntry(entry.id)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {entry.description || "Time Entry"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {entry.hours_worked}h × BZ${entry.hourly_rate}/hr = BZ${entry.total_amount}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(entry.started_at).toLocaleDateString()}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            {/* Line Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Custom Line Items</h3>
                <button
                  onClick={addLineItem}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + Add Item
                </button>
              </div>
              
              {lineItems.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No custom items yet. Click "Add Item" to create one.
                </p>
              ) : (
                <div className="space-y-4">
                  {lineItems.map(item => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                          placeholder="Description"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="ml-3 text-red-600 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Qty</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(item.id, "unit_price", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Total</label>
                          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium">
                            BZ${(item.quantity * item.unit_price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Panel - Live Invoice Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 sticky top-8">
              <div ref={invoiceRef} className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between pb-8 border-b-2 border-gray-200">
                  <div>
                    {logoUrl && (
                      <img
                        src={logoUrl}
                        alt="Company logo"
                        className="h-16 mb-4 object-contain"
                      />
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedProfessional?.firm_name || selectedProfessional?.display_name || "Your Company"}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {selectedProfessional?.address || "Your Address"}
                    </p>
                    <p className="text-gray-600">{selectedProfessional?.email}</p>
                    <p className="text-gray-600">{selectedProfessional?.phone}</p>
                  </div>
                  
                  <div className="text-right">
                    <h1 className="text-4xl font-bold text-gray-900">INVOICE</h1>
                    <p className="text-lg text-gray-600 mt-2">{invoiceNumber}</p>
                  </div>
                </div>
                
                {/* Invoice Info & Client */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">BILL TO:</h3>
                    {selectedClient ? (
                      <div className="text-gray-900">
                        <p className="font-semibold">{selectedClient.full_name}</p>
                        <p className="text-sm">{selectedClient.email}</p>
                        <p className="text-sm">{selectedClient.phone}</p>
                        {selectedClient.address && (
                          <p className="text-sm">{selectedClient.address}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No client selected</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-600">Issue Date: </span>
                        <span className="font-medium">{new Date(issueDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Due Date: </span>
                        <span className="font-medium">{new Date(dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Items Table */}
                <div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-3 text-sm font-semibold text-gray-700">DESCRIPTION</th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-700 w-20">QTY</th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-700 w-28">RATE</th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-700 w-28">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Selected Time Entries */}
                      {timeEntries
                        .filter(e => selectedTimeEntries.includes(e.id))
                        .map(entry => (
                          <tr key={`time-${entry.id}`} className="border-b border-gray-200">
                            <td className="py-3 text-gray-900">
                              {entry.description || "Time Entry"}
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(entry.started_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="text-right text-gray-900">{entry.hours_worked}h</td>
                            <td className="text-right text-gray-900">BZ${entry.hourly_rate}</td>
                            <td className="text-right text-gray-900 font-medium">BZ${entry.total_amount}</td>
                          </tr>
                        ))}
                      
                      {/* Custom Line Items */}
                      {lineItems.map(item => (
                        <tr key={`item-${item.id}`} className="border-b border-gray-200">
                          <td className="py-3 text-gray-900">{item.description || "Item"}</td>
                          <td className="text-right text-gray-900">{item.quantity}</td>
                          <td className="text-right text-gray-900">BZ${parseFloat(item.unit_price).toFixed(2)}</td>
                          <td className="text-right text-gray-900 font-medium">
                            BZ${(item.quantity * item.unit_price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Empty state */}
                      {selectedTimeEntries.length === 0 && lineItems.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400 italic">
                            No items added yet. Select time entries or add custom line items.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-80 space-y-3">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span className="font-medium">BZ${totals.subtotal}</span>
                    </div>
                    
                    {showGst && (
                      <div className="flex justify-between text-gray-700">
                        <span>GST ({gstPercent}%):</span>
                        <span className="font-medium">BZ${totals.gstAmount}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300">
                      <span>Total:</span>
                      <span>BZ${totals.total}</span>
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                {notes && (
                  <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">NOTES:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{notes}</p>
                  </div>
                )}
                
                {/* Footer */}
                <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                  <p>Thank you for your business!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
