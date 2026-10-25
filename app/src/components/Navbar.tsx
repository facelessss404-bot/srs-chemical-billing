import React from 'react';
import { FileText, Users, Package, Settings, LogOut, Cloud, CloudOff, PlusCircle } from 'lucide-react';
import { UserSession } from '../types';

interface Props {
  currentTab: 'billing' | 'invoices' | 'parties' | 'items';
  onSelectTab: (tab: 'billing' | 'invoices' | 'parties' | 'items') => void;
  onOpenSettings: () => void;
  supabaseConnected: boolean;
  userSession: UserSession | null;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  supabaseConnected,
  userSession,
  onLogout
}) => {
  return (
    <header className="sbr-topbar no-print">
      <div className="sbr-topbar-inner">
        {/* Brand Group */}
        <div className="sbr-brand">
          <div className="sbr-logo-badge">
            S.B.R
          </div>
          <div className="sbr-title-group">
            <h1>S.B.R. CHEMICALS & OILS</h1>
            <p>Wholesale & Retail Supplier &bull; Saravanampatti, Coimbatore &bull; GST Billing</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="sbr-nav-links">
          <button
            type="button"
            className={`sbr-nav-btn ${currentTab === 'billing' ? 'active' : ''}`}
            onClick={() => onSelectTab('billing')}
          >
            <PlusCircle size={15} /> New Bill
          </button>

          <button
            type="button"
            className={`sbr-nav-btn ${currentTab === 'invoices' ? 'active' : ''}`}
            onClick={() => onSelectTab('invoices')}
          >
            <FileText size={15} /> Invoices Register
          </button>

          <button
            type="button"
            className={`sbr-nav-btn ${currentTab === 'parties' ? 'active' : ''}`}
            onClick={() => onSelectTab('parties')}
          >
            <Users size={15} /> Master Party
          </button>

          <button
            type="button"
            className={`sbr-nav-btn ${currentTab === 'items' ? 'active' : ''}`}
            onClick={() => onSelectTab('items')}
          >
            <Package size={15} /> Item Master
          </button>
        </nav>

        {/* Right Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Cloud Badge */}
          <div
            onClick={onOpenSettings}
            title={supabaseConnected ? 'Supabase Cloud: Connected & Syncing' : 'Operating in Local Mode. Click to configure Supabase Cloud URL & Key.'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '20px',
              fontSize: '0.725rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: supabaseConnected ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${supabaseConnected ? '#bbf7d0' : '#fde68a'}`,
              color: supabaseConnected ? '#166534' : '#b45309'
            }}
          >
            {supabaseConnected ? <Cloud size={13} /> : <CloudOff size={13} />}
            <span>{supabaseConnected ? 'Cloud Sync' : 'Local Mode'}</span>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              cursor: 'pointer'
            }}
            title="Company, Bank & Cloud Settings"
          >
            <Settings size={16} />
          </button>

          {/* User Role Pill */}
          {userSession && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              paddingLeft: '0.5rem',
              borderLeft: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                {userSession.username}
              </span>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
                title="Logout"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
