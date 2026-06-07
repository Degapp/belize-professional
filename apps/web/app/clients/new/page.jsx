'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function NewClientPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [customFields, setCustomFields] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
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
          custom_fields: customFieldsObj
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
            <h1 className="font-clash text-4xl font-semibold text-slate-900 mb-2">Add New Client</h1>
            <p className="text-slate-600">Enter client information to add them to your database</p>
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
                disabled={saving}
                className="flex-1 px-6 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 disabled:shadow-none"
              >
                {saving ? 'Saving...' : 'Add Client'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/clients')}
                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
