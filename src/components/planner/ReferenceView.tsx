import React, { useState } from 'react';
import { Database, Building2, Users, Key, CreditCard, Globe, Plus, Trash2, Save } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface PasswordEntry {
  id: string;
  platform: string;
  username: string;
  hint: string;
}

interface DigitalAsset {
  id: string;
  type: string;
  name: string;
  details: string;
}

export const ReferenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'business' | 'contacts' | 'passwords' | 'financial' | 'digital'>('business');
  
  // Business Identity
  const [business, setBusiness] = useState({
    name: '',
    ein: '',
    duns: '',
    address: '',
    registrationInfo: ''
  });

  // Contacts
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: '', role: 'Accountant', phone: '', email: '' },
    { id: '2', name: '', role: 'Lawyer', phone: '', email: '' },
    { id: '3', name: '', role: 'Bank Contact', phone: '', email: '' },
  ]);

  // Passwords
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [newPassword, setNewPassword] = useState({ platform: '', username: '', hint: '' });

  // Digital Assets
  const [digitalAssets, setDigitalAssets] = useState<DigitalAsset[]>([]);
  const [newAsset, setNewAsset] = useState({ type: 'domain', name: '', details: '' });

  const addContact = () => {
    setContacts([...contacts, { id: Date.now().toString(), name: '', role: '', phone: '', email: '' }]);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts(contacts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const addPassword = () => {
    if (!newPassword.platform) return;
    setPasswords([...passwords, { id: Date.now().toString(), ...newPassword }]);
    setNewPassword({ platform: '', username: '', hint: '' });
  };

  const deletePassword = (id: string) => {
    setPasswords(passwords.filter(p => p.id !== id));
  };

  const addDigitalAsset = () => {
    if (!newAsset.name) return;
    setDigitalAssets([...digitalAssets, { id: Date.now().toString(), ...newAsset }]);
    setNewAsset({ type: 'domain', name: '', details: '' });
  };

  const tabs = [
    { id: 'business', label: 'Business Identity', icon: <Building2 size={18} /> },
    { id: 'contacts', label: 'Contacts', icon: <Users size={18} /> },
    { id: 'passwords', label: 'Passwords', icon: <Key size={18} /> },
    { id: 'financial', label: 'Financial', icon: <CreditCard size={18} /> },
    { id: 'digital', label: 'Digital Assets', icon: <Globe size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Database size={28} className="text-amber-500" />
          Reference Vault
        </h2>
        <p className="text-zinc-400 mt-1">Secure storage for critical business information.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Business Identity */}
      {activeTab === 'business' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Business Identity</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Business Name</label>
              <input
                type="text"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">EIN</label>
              <input
                type="text"
                value={business.ein}
                onChange={(e) => setBusiness({ ...business, ein: e.target.value })}
                placeholder="XX-XXXXXXX"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">DUNS Number</label>
              <input
                type="text"
                value={business.duns}
                onChange={(e) => setBusiness({ ...business, duns: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Registration Info</label>
              <input
                type="text"
                value={business.registrationInfo}
                onChange={(e) => setBusiness({ ...business, registrationInfo: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Business Address</label>
            <textarea
              value={business.address}
              onChange={(e) => setBusiness({ ...business, address: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Contacts */}
      {activeTab === 'contacts' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Important Contacts</h3>
            <button
              onClick={addContact}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-colors"
            >
              <Plus size={16} />
              Add Contact
            </button>
          </div>

          <div className="space-y-4">
            {contacts.map(contact => (
              <div key={contact.id} className="bg-zinc-800 rounded-lg p-4">
                <div className="grid md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContact(contact.id, { name: e.target.value })}
                    placeholder="Name"
                    className="bg-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={contact.role}
                    onChange={(e) => updateContact(contact.id, { role: e.target.value })}
                    placeholder="Role"
                    className="bg-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={contact.phone}
                    onChange={(e) => updateContact(contact.id, { phone: e.target.value })}
                    placeholder="Phone"
                    className="bg-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(contact.id, { email: e.target.value })}
                      placeholder="Email"
                      className="flex-1 bg-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="p-2 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Passwords */}
      {activeTab === 'passwords' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Password & Access Index</h3>
          <p className="text-zinc-400 text-sm">Store hints only - never store actual passwords.</p>

          {/* Add New */}
          <div className="grid md:grid-cols-4 gap-3">
            <input
              type="text"
              value={newPassword.platform}
              onChange={(e) => setNewPassword({ ...newPassword, platform: e.target.value })}
              placeholder="Platform"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newPassword.username}
              onChange={(e) => setNewPassword({ ...newPassword, username: e.target.value })}
              placeholder="Username/Email"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newPassword.hint}
              onChange={(e) => setNewPassword({ ...newPassword, hint: e.target.value })}
              placeholder="Password Hint"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={addPassword}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              <Plus size={18} className="mx-auto" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Platform</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Username</th>
                  <th className="text-left py-3 px-4 text-zinc-400 font-medium">Hint</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {passwords.map(p => (
                  <tr key={p.id} className="border-b border-zinc-800">
                    <td className="py-3 px-4 text-white">{p.platform}</td>
                    <td className="py-3 px-4 text-zinc-300">{p.username}</td>
                    <td className="py-3 px-4 text-zinc-400">{p.hint}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => deletePassword(p.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {passwords.length === 0 && (
              <p className="text-zinc-500 text-center py-8">No entries yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Financial */}
      {activeTab === 'financial' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white">Financial Snapshot</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-amber-400 mb-3">Bank Accounts</h4>
              <textarea
                placeholder="List your bank accounts..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                rows={4}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-400 mb-3">Credit Cards</h4>
              <textarea
                placeholder="List your credit cards..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                rows={4}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-400 mb-3">Loans</h4>
              <textarea
                placeholder="List any loans..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                rows={4}
              />
            </div>
            <div>
              <h4 className="text-sm font-medium text-amber-400 mb-3">Subscriptions</h4>
              <textarea
                placeholder="List recurring subscriptions..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>
      )}

      {/* Digital Assets */}
      {activeTab === 'digital' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Digital Assets Inventory</h3>

          {/* Add New */}
          <div className="grid md:grid-cols-4 gap-3">
            <select
              value={newAsset.type}
              onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="domain">Domain</option>
              <option value="hosting">Hosting</option>
              <option value="email">Email</option>
              <option value="software">Software</option>
              <option value="api">API</option>
              <option value="marketplace">Marketplace</option>
            </select>
            <input
              type="text"
              value={newAsset.name}
              onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
              placeholder="Name/URL"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <input
              type="text"
              value={newAsset.details}
              onChange={(e) => setNewAsset({ ...newAsset, details: e.target.value })}
              placeholder="Details/Notes"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={addDigitalAsset}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-medium rounded-lg transition-colors"
            >
              <Plus size={18} className="mx-auto" />
            </button>
          </div>

          {/* Assets List */}
          <div className="space-y-2">
            {digitalAssets.map(asset => (
              <div key={asset.id} className="flex items-center gap-4 bg-zinc-800 rounded-lg p-3">
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded uppercase">
                  {asset.type}
                </span>
                <span className="text-white flex-1">{asset.name}</span>
                <span className="text-zinc-400 text-sm">{asset.details}</span>
                <button
                  onClick={() => setDigitalAssets(digitalAssets.filter(a => a.id !== asset.id))}
                  className="p-1 hover:bg-red-500/20 rounded transition-colors"
                >
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            ))}
            {digitalAssets.length === 0 && (
              <p className="text-zinc-500 text-center py-8">No digital assets tracked yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
