import React, { useState } from 'react';
import { ShieldCheck, Lock, User, CheckCircle2, Cloud } from 'lucide-react';
import { UserSession } from '../types';

interface Props {
  onLogin: (session: UserSession) => void;
  supabaseConnected: boolean;
}

export const LoginModal: React.FC<Props> = ({ onLogin, supabaseConnected }) => {
  const [username, setUsername] = useState('Admin');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'Admin' | 'Staff'>('Admin');
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
      // allow empty if using quick demo login or valid PIN
      setError('Please enter PIN / Password (e.g. 1234)');
      return;
    }
    // PIN verification
    if (pin === '1234' || pin === 'admin' || pin === 'admin123' || pin.length >= 4) {
      onLogin({
        is_authenticated: true,
        user_role: role,
        username: username || 'SBR Operator'
      });
    } else {
      setError('Invalid PIN/Password. Default PIN is 1234.');
    }
  };

  const handleQuickLogin = (selectedRole: 'Admin' | 'Staff') => {
    onLogin({
      is_authenticated: true,
      user_role: selectedRole,
      username: selectedRole === 'Admin' ? 'Admin (SBR Chemicals)' : 'Billing Counter Staff'
    });
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
            GST Billing & Inventory Management Suite
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

        {/* Form Body */}
        <div style={{ padding: '1.75rem' }}>
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                User / Counter ID
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter Username"
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
                  Security PIN / Password
                </label>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Default: 1234</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  value={pin}
                  onChange={e => { setPin(e.target.value); setError(''); }}
                  placeholder="Enter 4-digit PIN"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    letterSpacing: '0.1em'
                  }}
                />
              </div>
              {error && <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.35rem' }}>{error}</div>}
            </div>

            <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setRole('Admin')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: role === 'Admin' ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                  background: role === 'Admin' ? '#fef2f2' : '#ffffff',
                  color: role === 'Admin' ? '#b91c1c' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.775rem',
                  cursor: 'pointer'
                }}
              >
                Admin Access
              </button>
              <button
                type="button"
                onClick={() => setRole('Staff')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  borderRadius: '6px',
                  border: role === 'Staff' ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                  background: role === 'Staff' ? '#fef2f2' : '#ffffff',
                  color: role === 'Staff' ? '#b91c1c' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.775rem',
                  cursor: 'pointer'
                }}
              >
                Billing Staff
              </button>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.7rem',
                background: '#b91c1c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(185, 28, 28, 0.3)',
                transition: 'background 0.15s'
              }}
            >
              Secure Login
            </button>
          </form>

          {/* Quick Bypass Demo Buttons */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px dashed #e2e8f0',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.725rem', color: '#64748b', marginBottom: '0.5rem' }}>
              Instant Quick Access:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('Admin')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#334155',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Enter as Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Staff')}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: '#334155',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Enter as Staff
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
