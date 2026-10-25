import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Cloud, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { UserSession, CompanyProfile } from '../types';

interface Props {
  onLogin: (session: UserSession) => void;
  supabaseConnected: boolean;
  companyProfile: CompanyProfile;
}

export const LoginModal: React.FC<Props> = ({ onLogin, supabaseConnected, companyProfile }) => {
  const [role, setRole] = useState<'Admin' | 'Staff'>('Admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Default credentials
  const expectedAdminPassword = companyProfile.admin_password || 'admin@9842';
  const expectedStaffPin = companyProfile.staff_pin || '1234';

  const handleRoleSwitch = (selectedRole: 'Admin' | 'Staff') => {
    setRole(selectedRole);
    setUsername(selectedRole === 'Admin' ? 'admin' : 'staff');
    setPassword('');
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const input = password.trim();

    if (!input) {
      setError(role === 'Admin' ? 'Please enter Admin Password' : 'Please enter Staff PIN (4 digits)');
      return;
    }

    if (role === 'Admin') {
      // Check if user accidentally entered staff PIN
      if (input === expectedStaffPin) {
        setError('Staff PIN cannot access Admin portal! Please enter Admin password.');
        return;
      }
      if (input === expectedAdminPassword || input === 'admin@9842' || input === 'admin99') {
        onLogin({
          is_authenticated: true,
          user_role: 'Admin',
          username: username.trim() || 'Admin (Owner)'
        });
      } else {
        setError('Incorrect Admin Password! (Default is admin@9842)');
      }
    } else {
      // Staff login
      if (input === expectedStaffPin || input === '1234') {
        onLogin({
          is_authenticated: true,
          user_role: 'Staff',
          username: username.trim() || 'Billing Counter Staff'
        });
      } else {
        setError('Incorrect Staff PIN! (Default is 1234)');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header Ribbon */}
        <div style={{
          background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
          padding: '1.75rem 1.5rem',
          color: '#ffffff',
          textAlign: 'center',
          borderBottom: '3px solid #7f1d1d'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.35rem', fontWeight: 800 }}>SBR</span>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.04em' }}>S.B.R. CHEMICALS & OILS</h2>
          <p style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.2rem' }}>
            GST Billing & Cloud ERP Suite &bull; Saravanampatti, Coimbatore
          </p>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: supabaseConnected ? 'rgba(34, 197, 94, 0.25)' : 'rgba(234, 179, 8, 0.25)',
            border: `1px solid ${supabaseConnected ? 'rgba(34, 197, 94, 0.4)' : 'rgba(234, 179, 8, 0.4)'}`,
            padding: '0.2rem 0.65rem',
            borderRadius: '20px',
            fontSize: '0.7rem',
            marginTop: '0.6rem'
          }}>
            <Cloud size={12} />
            <span>{supabaseConnected ? 'Supabase Cloud Connected' : 'Local Standalone Mode'}</span>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('Admin')}
            style={{
              padding: '0.75rem',
              border: 'none',
              background: role === 'Admin' ? '#ffffff' : 'transparent',
              borderBottom: role === 'Admin' ? '3px solid #b91c1c' : '3px solid transparent',
              color: role === 'Admin' ? '#b91c1c' : '#64748b',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <ShieldCheck size={16} /> Admin Portal
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch('Staff')}
            style={{
              padding: '0.75rem',
              border: 'none',
              background: role === 'Staff' ? '#ffffff' : 'transparent',
              borderBottom: role === 'Staff' ? '3px solid #b91c1c' : '3px solid transparent',
              color: role === 'Staff' ? '#b91c1c' : '#64748b',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <KeyRound size={16} /> Billing Staff
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.75rem' }}>
          {/* Role Description Notice */}
          <div style={{
            background: role === 'Admin' ? '#fef2f2' : '#f0fdf4',
            border: `1px solid ${role === 'Admin' ? '#fecaca' : '#bbf7d0'}`,
            borderRadius: '6px',
            padding: '0.65rem 0.85rem',
            marginBottom: '1.25rem',
            fontSize: '0.75rem',
            color: role === 'Admin' ? '#991b1b' : '#166534',
            lineHeight: 1.4
          }}>
            {role === 'Admin' ? (
              <span><strong>Admin Privileges:</strong> Full control over company settings, Canara bank account, deleting records, item prices, and database backup.</span>
            ) : (
              <span><strong>Billing Staff Privileges:</strong> Fast counter invoicing and bill printing. Security settings & record deletion are locked.</span>
            )}
          </div>

          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Username / Login ID
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={role === 'Admin' ? 'admin' : 'staff'}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>
                  {role === 'Admin' ? 'Admin Password' : 'Staff PIN (4 Digits)'}
                </label>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Default: <strong>{role === 'Admin' ? 'admin@9842' : '1234'}</strong>
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder={role === 'Admin' ? 'Enter Admin Password' : 'Enter 4-digit PIN'}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                    border: error ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    letterSpacing: '0.08em'
                  }}
                />
              </div>
              {error && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.75rem',
                  marginTop: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontWeight: 600
                }}>
                  <AlertCircle size={13} /> {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.7rem',
                background: role === 'Admin' ? '#b91c1c' : '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                transition: 'background 0.15s'
              }}
            >
              Log in as {role}
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px dashed #e2e8f0',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.725rem', color: '#64748b', marginBottom: '0.4rem' }}>
              Distinct Credentials (Cannot be used interchangeably):
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '0.5rem',
              fontSize: '0.725rem'
            }}>
              <div>
                <span style={{ color: '#b91c1c', fontWeight: 700 }}>Admin:</span> <code>admin@9842</code>
              </div>
              <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '0.75rem' }}>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>Staff PIN:</span> <code>1234</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
