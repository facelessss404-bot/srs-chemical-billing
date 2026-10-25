import React, { useState } from 'react';
import { CompanyProfile, SupabaseConfig } from '../types';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, testSupabaseConnection } from '../services/supabase';
import { Building2, Landmark, Cloud, Download, Upload, CheckCircle2, AlertCircle, Copy, X, KeyRound } from 'lucide-react';

interface Props {
  company: CompanyProfile;
  onSaveCompany: (company: CompanyProfile) => Promise<void>;
  onClose: () => void;
  onRefreshData: () => Promise<void>;
}

export const SettingsModal: React.FC<Props> = ({ company, onSaveCompany, onClose, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'Company' | 'Bank' | 'Security' | 'Cloud' | 'Backup'>('Company');
  const [formCompany, setFormCompany] = useState<CompanyProfile>({ ...company });

  // Cloud Config state
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSaveCompany(formCompany);
      notify('success', 'Settings updated successfully!');
    } catch (err: any) {
      notify('error', err?.message || 'Failed to save settings');
    }
  };

  const handleTestCloud = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anon_key) {
      setTestResult({ success: false, message: 'Please provide both Supabase URL and Anon Key!' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.anon_key);
    setIsTesting(false);
    setTestResult(res);
    if (res.success) {
      saveStoredSupabaseConfig({ url: supabaseConfig.url, anon_key: supabaseConfig.anon_key });
      notify('success', 'Supabase Cloud connected and credentials saved!');
      await onRefreshData();
    }
  };

  const handleSaveCloudCredentials = () => {
    saveStoredSupabaseConfig({ url: supabaseConfig.url, anon_key: supabaseConfig.anon_key });
    notify('success', 'Supabase Cloud configuration saved!');
  };

  const handleBackupExport = () => {
    window.open('/api/backup/export', '_blank');
  };

  const handleBackupImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      if (res.ok) {
        notify('success', 'Database backup imported and restored successfully!');
        await onRefreshData();
      } else {
        notify('error', 'Import failed on server');
      }
    } catch (err: any) {
      notify('error', 'Invalid JSON backup file: ' + err?.message);
    }
  };

  const copySqlSchema = () => {
    const sql = `-- SBR CHEMICALS SUPABASE TABLES
CREATE TABLE IF NOT EXISTS public.parties (id TEXT PRIMARY KEY, party_name TEXT NOT NULL, party_code TEXT, party_group TEXT, address TEXT, city_town TEXT, postal_code TEXT, phone TEXT, email TEXT, gstin TEXT, is_interstate BOOLEAN, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.items (id TEXT PRIMARY KEY, item_name TEXT NOT NULL, item_code TEXT, uom TEXT DEFAULT 'Ltrs', selling_price NUMERIC(12,2), gst_applicable BOOLEAN, gst_name TEXT, gst_rate NUMERIC(5,2), hsn_sac_code TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.invoices (id TEXT PRIMARY KEY, invoice_no TEXT UNIQUE, invoice_date DATE, party_id TEXT, party_name TEXT, billing_address TEXT, shipping_address TEXT, party_gstin TEXT, party_phone TEXT, gst_type TEXT, order_no_date TEXT, vehicle_no TEXT, lr_rr_no TEXT, payment_terms TEXT, destination TEXT, notes TEXT, items JSONB, total_entries INTEGER, sub_total NUMERIC, grand_total NUMERIC, freight_charges NUMERIC, cgst_total NUMERIC, sgst_total NUMERIC, igst_total NUMERIC, round_off NUMERIC, net_total NUMERIC, amount_in_words TEXT, status TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.settings (key TEXT PRIMARY KEY, value JSONB, updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.sequences (name TEXT PRIMARY KEY, current_value BIGINT DEFAULT 75);
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Parties" ON public.parties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Items" ON public.items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Sequences" ON public.sequences FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#b91c1c',
          color: '#ffffff',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Company & Cloud Database Settings</h3>
            <p style={{ fontSize: '0.725rem', opacity: 0.9 }}>
              Configure company profile, Canara bank details, and Supabase cloud sync
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 1rem'
        }}>
          {[
            { id: 'Company', label: 'Company Profile', icon: Building2 },
            { id: 'Bank', label: 'Bank Details', icon: Landmark },
            { id: 'Security', label: 'Logins & Security', icon: KeyRound },
            { id: 'Cloud', label: 'Supabase Cloud DB', icon: Cloud },
            { id: 'Backup', label: 'Backup & Restore', icon: Download }
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '3px solid #b91c1c' : '3px solid transparent',
                  color: active ? '#b91c1c' : '#64748b',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer'
                }}
              >
                <Icon size={15} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Notifications */}
        {notification && (
          <div style={{
            margin: '0.75rem 1.25rem 0',
            padding: '0.6rem 0.85rem',
            borderRadius: '4px',
            background: notification.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${notification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: notification.type === 'success' ? '#166534' : '#991b1b',
            fontSize: '0.8rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            {notification.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {activeTab === 'Company' && (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                  Company Name (Prints as Header)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formCompany.company_name}
                  onChange={e => setFormCompany({ ...formCompany, company_name: e.target.value })}
                  style={{ fontWeight: 700, color: '#991b1b' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                  Tagline / Business Nature
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formCompany.tagline}
                  onChange={e => setFormCompany({ ...formCompany, tagline: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                  Address
                </label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={formCompany.address}
                  onChange={e => setFormCompany({ ...formCompany, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                    Mobile Numbers
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formCompany.phones}
                    onChange={e => setFormCompany({ ...formCompany, phones: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={formCompany.email}
                    onChange={e => setFormCompany({ ...formCompany, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                    Company GSTIN
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formCompany.gstin}
                    onChange={e => setFormCompany({ ...formCompany, gstin: e.target.value.toUpperCase() })}
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                    State & Code
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={`${formCompany.state} (${formCompany.state_code})`}
                    disabled
                    style={{ background: '#f8fafc' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                  Starting Invoice Sequence Number
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formCompany.starting_invoice_no}
                  onChange={e => setFormCompany({ ...formCompany, starting_invoice_no: parseInt(e.target.value) || 1 })}
                  style={{ maxWidth: '200px' }}
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: '#b91c1c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Company Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === 'Bank' && (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                  Bank Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formCompany.bank_name}
                  onChange={e => setFormCompany({ ...formCompany, bank_name: e.target.value })}
                  placeholder="e.g. Canara Bank"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                  Account Number
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formCompany.account_no}
                  onChange={e => setFormCompany({ ...formCompany, account_no: e.target.value })}
                  placeholder="e.g. 6038281090014"
                  style={{ fontFamily: 'monospace', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formCompany.ifsc_code}
                    onChange={e => setFormCompany({ ...formCompany, ifsc_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CNRB0006038"
                    style={{ fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                    Branch Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formCompany.branch}
                    onChange={e => setFormCompany({ ...formCompany, branch: e.target.value })}
                    placeholder="e.g. Saravanampatti"
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: '#b91c1c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Bank Details
                </button>
              </div>
            </form>
          )}

          {activeTab === 'Security' && (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.85rem'
              }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Role-Based Security & Passwords
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                  Maintain separate, independent passwords for the Owner/Admin and Counter Staff. Staff credentials cannot be used to access administrative controls, edit bank details, or delete bills.
                </p>
              </div>

              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 800, color: '#b91c1c', fontSize: '0.9rem' }}>🛡️ Admin / Owner Password</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#7f1d1d', marginBottom: '0.65rem' }}>
                  Allows full access to company settings, Canara bank accounts, deleting records, changing prices, and cloud sync.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                    Admin Password
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formCompany.admin_password || 'admin@9842'}
                    onChange={e => setFormCompany({ ...formCompany, admin_password: e.target.value })}
                    style={{ maxWidth: '320px', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>
                    Default: <code>admin@9842</code>
                  </span>
                </div>
              </div>

              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem' }}>🧾 Billing Staff Counter PIN</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#14532d', marginBottom: '0.65rem' }}>
                  Used by counter operators for daily billing and printing. Cannot delete past records or modify bank details.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                    Staff PIN (4 Digits)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    maxLength={10}
                    value={formCompany.staff_pin || '1234'}
                    onChange={e => setFormCompany({ ...formCompany, staff_pin: e.target.value })}
                    style={{ maxWidth: '200px', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.2rem' }}>
                    Default: <code>1234</code>
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    background: '#b91c1c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Passwords & Security Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === 'Cloud' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.85rem'
              }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Supabase Cloud PostgreSQL Connection
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                  Connect your online Supabase database. When configured, your master party, items, and invoices will sync directly to the cloud and remain accessible from any computer or mobile device.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseConfig.url}
                  onChange={e => setSupabaseConfig({ ...supabaseConfig, url: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                  Supabase Anon / Public Key
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseConfig.anon_key}
                  onChange={e => setSupabaseConfig({ ...supabaseConfig, anon_key: e.target.value })}
                />
              </div>

              {testResult && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '4px',
                  background: testResult.success ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${testResult.success ? '#bbf7d0' : '#fecaca'}`,
                  color: testResult.success ? '#166534' : '#991b1b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleTestCloud}
                  disabled={isTesting}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {isTesting ? 'Testing Connection...' : 'Test Connection'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveCloudCredentials}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Save Credentials
                </button>
              </div>

              {/* SQL Setup Helper */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                    Supabase SQL Schema Script (1-Click Table Setup)
                  </span>
                  <button
                    type="button"
                    onClick={copySqlSchema}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '3px',
                      fontSize: '0.725rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Copy size={12} /> {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}
                  </button>
                </div>
                <div style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: '0.65rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontFamily: 'monospace',
                  maxHeight: '110px',
                  overflowY: 'auto'
                }}>
                  Also saved in project root as <code>supabase_schema.sql</code>. Paste and click Run in Supabase SQL editor.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Backup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '1rem'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Full Database Export
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.85rem' }}>
                  Download a complete JSON snapshot containing all parties, items, invoices, and company settings.
                </p>
                <button
                  type="button"
                  onClick={handleBackupExport}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={15} /> Download Full JSON Backup
                </button>
              </div>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '1rem'
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Restore Database from Backup
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.85rem' }}>
                  Restore records and settings from a previously downloaded JSON backup file.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleBackupImport}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          textAlign: 'right'
        }}>
          <button
            type="button"
            className="master-btn"
            onClick={onClose}
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
