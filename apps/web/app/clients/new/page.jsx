'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function NewClientPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [validatedContacts, setValidatedContacts] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
    notes: '',
    id_type: '',
    id_number: '',
    id_expiry_date: '',
    nationality: '',
    occupation: '',
    source_of_funds: '',
    is_pep: false
  });
  const [idDocument, setIdDocument] = useState(null);
  const [addressVerification, setAddressVerification] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file, type) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to upload file');
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload documents if provided
      let idDocumentUrl = null;
      let addressVerificationUrl = null;
      
      if (idDocument) {
        idDocumentUrl = await handleFileUpload(idDocument, 'id_document');
      }
      
      if (addressVerification) {
        addressVerificationUrl = await handleFileUpload(addressVerification, 'address_verification');
      }

      const customFieldsObj = {};
      customFields.forEach((field) => {
        if (field.name && field.value) {
          customFieldsObj[field.name] = field.value;
        }
      });

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          professional_id: user?.id || 1,
          custom_fields: customFieldsObj,
          id_document_url: idDocumentUrl,
          address_verification_url: addressVerificationUrl
        })
      });

      if (!response.ok) throw new Error('Failed to create client');
      
      const client = await response.json();
      router.push(`/clients/${client.id}`);
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { id: Date.now(), name: '', value: '' }]);
  };

  const updateCustomField = (id, field, value) => {
    setCustomFields(customFields.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const removeCustomField = (id) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleGoogleContacts = async () => {
    try {
      setImporting(true);
      
      // Request access to Google Contacts using Google People API
      const response = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,addresses', {
        headers: {
          'Authorization': 'Bearer ' + await getGoogleAccessToken()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Google contacts. Please ensure you have granted access.');
      }

      const data = await response.json();
      const contacts = parseGoogleContacts(data.connections || []);
      
      await validateAndShowContacts(contacts);
    } catch (error) {
      console.error('Error importing Google contacts:', error);
      alert('Failed to import Google contacts. Please ensure you have granted permission and try again.');
    } finally {
      setImporting(false);
    }
  };

  const getGoogleAccessToken = async () => {
    return new Promise((resolve, reject) => {
      // Initialize Google OAuth2
      const client = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        scope: 'https://www.googleapis.com/auth/contacts.readonly',
        callback: (response) => {
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error('Failed to get access token'));
          }
        },
      });
      
      if (client) {
        client.requestAccessToken();
      } else {
        reject(new Error('Google client not initialized'));
      }
    });
  };

  const parseGoogleContacts = (connections) => {
    return connections.map(person => {
      const name = person.names?.[0]?.displayName || '';
      const email = person.emailAddresses?.[0]?.value || '';
      const phone = person.phoneNumbers?.[0]?.value || '';
      const address = person.addresses?.[0]?.formattedValue || '';
      const city = person.addresses?.[0]?.city || '';
      const country = person.addresses?.[0]?.country || '';

      return {
        full_name: name,
        email,
        phone,
        address,
        city,
        country
      };
    }).filter(contact => contact.full_name); // Only include contacts with names
  };

  const handlePhoneContacts = async () => {
    try {
      setImporting(true);

      // Check if Contact Picker API is supported
      if (!('contacts' in navigator && 'ContactsManager' in window)) {
        alert('Contact import is not supported on this device/browser. Please use Chrome on Android or try Google Contacts import.');
        setImporting(false);
        return;
      }

      const props = ['name', 'email', 'tel', 'address'];
      const opts = { multiple: true };

      const contacts = await navigator.contacts.select(props, opts);
      const parsedContacts = contacts.map(contact => ({
        full_name: contact.name?.[0] || '',
        email: contact.email?.[0] || '',
        phone: contact.tel?.[0] || '',
        address: contact.address?.[0]?.addressLine?.join(', ') || '',
        city: contact.address?.[0]?.city || '',
        country: contact.address?.[0]?.country || ''
      })).filter(contact => contact.full_name);

      await validateAndShowContacts(parsedContacts);
    } catch (error) {
      console.error('Error importing phone contacts:', error);
      if (error.name === 'AbortError') {
        // User cancelled - do nothing
      } else {
        alert('Failed to import contacts from your phone. Please try again or use Google Contacts import.');
      }
    } finally {
      setImporting(false);
    }
  };

  const validateAndShowContacts = async (contacts) => {
    try {
      const response = await fetch('/api/clients/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts,
          professional_id: user?.id || 1
        })
      });

      if (!response.ok) throw new Error('Failed to validate contacts');
      
      const result = await response.json();
      setValidatedContacts(result);
      setSelectedContacts(result.new.map((_, i) => i)); // Select all new contacts by default
      setShowImportModal(true);
    } catch (error) {
      console.error('Error validating contacts:', error);
      alert('Failed to validate contacts. Please try again.');
    }
  };

  const handleImportSelected = async () => {
    if (!validatedContacts || selectedContacts.length === 0) return;

    try {
      setImporting(true);
      const contactsToImport = selectedContacts.map(idx => validatedContacts.new[idx]);

      const response = await fetch('/api/clients/import-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: contactsToImport,
          professional_id: user?.id || 1
        })
      });

      if (!response.ok) throw new Error('Failed to import contacts');
      
      const result = await response.json();
      setImportResults(result);
      
      // Close modal and refresh or redirect
      setTimeout(() => {
        setShowImportModal(false);
        if (result.imported > 0) {
          router.push('/clients');
        }
      }, 2000);
    } catch (error) {
      console.error('Error importing contacts:', error);
      alert('Failed to import contacts. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const toggleContactSelection = (index) => {
    if (selectedContacts.includes(index)) {
      setSelectedContacts(selectedContacts.filter(i => i !== index));
    } else {
      setSelectedContacts([...selectedContacts, index]);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
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

          <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-sm rounded-xl transition-all">
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <button 
              onClick={() => router.push('/clients')}
              className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-2"
            >
              <i className="ph-light ph-arrow-left"></i>
              Back to Clients
            </button>
          </div>

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-clash text-4xl font-semibold text-slate-900 mb-2">Add New Client</h1>
                <p className="text-slate-600">Enter client information to add them to your database</p>
              </div>
              
              {/* Import Contacts Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handlePhoneContacts}
                  disabled={importing}
                  className="px-5 py-3 bg-white border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <i className="ph-light ph-device-mobile text-lg"></i>
                  {importing ? 'Importing...' : 'Import from Phone'}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleContacts}
                  disabled={importing}
                  className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <i className="ph-light ph-google-logo text-lg"></i>
                  {importing ? 'Importing...' : 'Import from Google'}
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-8">
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className="font-semibold text-xl text-slate-900 mb-4 flex items-center gap-2">
                <i className="ph-light ph-user text-brand-600"></i>
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="e.g. Sarah Martinez"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="sarah@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="+501 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8 pt-8 border-t border-slate-200">
              <h2 className="font-semibold text-xl text-slate-900 mb-4 flex items-center gap-2">
                <i className="ph-light ph-map-pin text-brand-600"></i>
                Address Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="Belize City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="Belize"
                  />
                </div>
              </div>
            </div>

            {/* KYC/AML Information */}
            <div className="mb-8 pt-8 border-t border-slate-200">
              <h2 className="font-semibold text-xl text-slate-900 mb-4 flex items-center gap-2">
                <i className="ph-light ph-identification-card text-brand-600"></i>
                KYC / AML Verification
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ID Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_type"
                    value={formData.id_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select ID Type</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="social_security">Social Security Card</option>
                    <option value="national_id">National ID Card</option>
                  </select>
                </div>

                {/* ID Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="e.g. A1234567"
                  />
                </div>

                {/* ID Expiry Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ID Expiry Date
                  </label>
                  <input
                    type="date"
                    name="id_expiry_date"
                    value={formData.id_expiry_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nationality <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="e.g. Belizean"
                  />
                </div>

                {/* Occupation */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="e.g. Business Owner"
                  />
                </div>

                {/* Source of Funds */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Source of Funds
                  </label>
                  <select
                    name="source_of_funds"
                    value={formData.source_of_funds}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Source</option>
                    <option value="employment">Employment/Salary</option>
                    <option value="business">Business Income</option>
                    <option value="investments">Investments</option>
                    <option value="inheritance">Inheritance</option>
                    <option value="savings">Savings</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* PEP Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
                    <input
                      type="checkbox"
                      name="is_pep"
                      checked={formData.is_pep}
                      onChange={(e) => setFormData({ ...formData, is_pep: e.target.checked })}
                      className="w-5 h-5 text-brand-600 border-slate-300 rounded focus:ring-2 focus:ring-brand-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Politically Exposed Person (PEP)</div>
                      <div className="text-sm text-slate-600">Check if client holds or has held a prominent public position</div>
                    </div>
                  </label>
                </div>

                {/* ID Document Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    ID Document (Scan/Photo) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setIdDocument(e.target.files[0])}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {idDocument && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                      <i className="ph-fill ph-check-circle"></i>
                      {idDocument.name}
                    </p>
                  )}
                </div>

                {/* Address Verification Upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Address Verification (Utility Bill) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setAddressVerification(e.target.files[0])}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {addressVerification && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                      <i className="ph-fill ph-check-circle"></i>
                      {addressVerification.name}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">Upload a recent utility bill (water, electricity, internet) for address verification</p>
                </div>
              </div>

              {/* AML Compliance Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <i className="ph-light ph-info text-xl text-blue-600 mt-0.5"></i>
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">AML Compliance Information</p>
                    <p className="text-blue-700">
                      All information collected is used for Anti-Money Laundering (AML) and Know Your Customer (KYC) compliance purposes.
                      Documents must be clear, valid, and show the client's full name and address.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Notes */}
            <div className="mb-8 pt-8 border-t border-slate-200">
              <h2 className="font-semibold text-xl text-slate-900 mb-4 flex items-center gap-2">
                <i className="ph-light ph-note text-brand-600"></i>
                Case Notes
              </h2>
              
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Add any relevant notes about this client..."
              />
            </div>

            {/* Custom Fields */}
            <div className="mb-8 pt-8 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-xl text-slate-900 flex items-center gap-2">
                  <i className="ph-light ph-plus-circle text-brand-600"></i>
                  Custom Fields
                </h2>
                <button
                  type="button"
                  onClick={addCustomField}
                  className="px-4 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold text-sm rounded-lg transition-all"
                >
                  + Add Field
                </button>
              </div>

              {customFields.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No custom fields added yet. Click "Add Field" to create one.</p>
              ) : (
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <div key={field.id} className="flex gap-3">
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                        placeholder="Field name (e.g. Tax ID)"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                        placeholder="Field value"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomField(field.id)}
                        className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                      >
                        <i className="ph-light ph-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 px-6 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 disabled:shadow-none"
              >
                {uploading ? 'Uploading documents...' : saving ? 'Saving...' : 'Add Client'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/clients')}
                disabled={saving || uploading}
                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Import Contacts Modal */}
      {showImportModal && validatedContacts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-clash text-2xl font-semibold text-slate-900">Import Contacts</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Review and select contacts to import • {validatedContacts.summary.newContactsCount} new • {validatedContacts.summary.duplicatesCount} duplicates
                  </p>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <i className="ph-light ph-x text-2xl text-slate-600"></i>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Import Results */}
              {importResults && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <i className="ph-light ph-check-circle text-2xl text-emerald-600"></i>
                    <div>
                      <p className="font-semibold text-emerald-900">Import Successful!</p>
                      <p className="text-sm text-emerald-700">
                        {importResults.imported} contact{importResults.imported !== 1 ? 's' : ''} imported successfully
                        {importResults.failed > 0 && ` • ${importResults.failed} failed`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-700">{validatedContacts.summary.newContactsCount}</div>
                  <div className="text-sm text-emerald-600 mt-1">New Contacts</div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-3xl font-bold text-amber-700">{validatedContacts.summary.duplicatesCount}</div>
                  <div className="text-sm text-amber-600 mt-1">Duplicates</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-3xl font-bold text-slate-700">{validatedContacts.summary.invalidCount}</div>
                  <div className="text-sm text-slate-600 mt-1">Invalid</div>
                </div>
              </div>

              {/* New Contacts List */}
              {validatedContacts.new.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-center gap-2">
                    <i className="ph-light ph-check-circle text-emerald-600"></i>
                    New Contacts ({validatedContacts.new.length})
                  </h3>
                  <div className="space-y-2">
                    {validatedContacts.new.map((contact, index) => (
                      <div
                        key={index}
                        onClick={() => toggleContactSelection(index)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedContacts.includes(index)
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedContacts.includes(index)
                              ? 'border-brand-600 bg-brand-600'
                              : 'border-slate-300'
                          }`}>
                            {selectedContacts.includes(index) && (
                              <i className="ph-bold ph-check text-xs text-white"></i>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{contact.full_name}</p>
                            <div className="flex gap-4 mt-1 text-sm text-slate-600">
                              {contact.email && <span>{contact.email}</span>}
                              {contact.phone && <span>{contact.phone}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicates */}
              {validatedContacts.duplicates.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-center gap-2">
                    <i className="ph-light ph-warning text-amber-600"></i>
                    Duplicate Contacts ({validatedContacts.duplicates.length})
                  </h3>
                  <div className="space-y-2">
                    {validatedContacts.duplicates.map((contact, index) => (
                      <div key={index} className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50">
                        <div className="flex items-start gap-3">
                          <i className="ph-light ph-warning-circle text-xl text-amber-600 mt-0.5"></i>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{contact.full_name}</p>
                            <div className="text-sm text-slate-600 mt-1">
                              {contact.email && <div>Email: {contact.email}</div>}
                              {contact.phone && <div>Phone: {contact.phone}</div>}
                            </div>
                            <p className="text-xs text-amber-700 mt-2">
                              Matches existing client: {contact.duplicateMatch?.full_name}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invalid Contacts */}
              {validatedContacts.invalid.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-3 flex items-center gap-2">
                    <i className="ph-light ph-x-circle text-red-600"></i>
                    Invalid Contacts ({validatedContacts.invalid.length})
                  </h3>
                  <div className="space-y-2">
                    {validatedContacts.invalid.map((contact, index) => (
                      <div key={index} className="p-4 rounded-xl border-2 border-red-200 bg-red-50">
                        <div className="flex items-start gap-3">
                          <i className="ph-light ph-x-circle text-xl text-red-600 mt-0.5"></i>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">{contact.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-red-700 mt-1">Missing required information (name, email, or phone)</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-6 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportSelected}
                    disabled={selectedContacts.length === 0 || importing}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-500/20 disabled:shadow-none"
                  >
                    {importing ? 'Importing...' : `Import ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
