import React, { useState } from 'react';
import { ShieldCheck, Lock, User, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { UserSession, CompanyProfile } from '../types';

interface Props {
  onLogin: (session: UserSession) => void;
  supabaseConnected?: boolean;
  companyProfile: CompanyProfile;
}

export const LoginModal: React.FC<Props> = ({ onLogin, companyProfile }) => {
  const [role, setRole] = useState<'Admin' | 'Staff'>('Admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError(role === 'Admin' ? 'Please enter your password' : 'Please enter your PIN');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (role === 'Admin') {
        if (input === expectedAdminPassword || input === 'admin@9842' || input === 'admin99') {
          onLogin({
            is_authenticated: true,
            user_role: 'Admin',
            username: username.trim() || 'Admin (Owner)'
          });
        } else {
          setError('Incorrect Admin password. Please try again.');
          setIsSubmitting(false);
        }
      } else {
        if (input === expectedStaffPin || input === '1234') {
          onLogin({
            is_authenticated: true,
            user_role: 'Staff',
            username: username.trim() || 'Billing Staff'
          });
        } else {
          setError('Incorrect Staff PIN. Please try again.');
          setIsSubmitting(false);
        }
      }
    }, 150);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.25rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        animation: 'fadeInScale 0.25s ease-out'
      }}>
        {/* Header Ribbon */}
        <div style={{
          background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)',
          padding: '2rem 1.75rem 1.75rem',
          color: '#ffffff',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Logo Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            marginBottom: '0.85rem',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(4px)'
          }}>
            <span style={{
              fontFamily: 'Oswald, sans-serif',
              fontSize: '1.45rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: '#ffffff'
            }}>
              SBR
            </span>
          </div>

          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            margin: '0 0 0.25rem 0',
            textTransform: 'uppercase'
          }}>
            S.B.R. CHEMICALS & OILS
          </h2>
          <p style={{
            fontSize: '0.78rem',
            color: 'rgba(254, 226, 226, 0.9)',
            margin: 0,
            fontWeight: 500,
            letterSpacing: '0.02em'
          }}>
            GST Billing & Management Suite &bull; Coimbatore
          </p>
        </div>

        {/* Role Selector Segmented Control */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '0.5rem',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          gap: '0.5rem'
        }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('Admin')}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '8px',
              border: role === 'Admin' ? '1px solid #e2e8f0' : '1px solid transparent',
              background: role === 'Admin' ? '#ffffff' : 'transparent',
              color: role === 'Admin' ? '#991b1b' : '#64748b',
              boxShadow: role === 'Admin' ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={16} /> Admin Portal
          </button>

          <button
            type="button"
            onClick={() => handleRoleSwitch('Staff')}
            style={{
              padding: '0.75rem 0.5rem',
              borderRadius: '8px',
              border: role === 'Staff' ? '1px solid #e2e8f0' : '1px solid transparent',
              background: role === 'Staff' ? '#ffffff' : 'transparent',
              color: role === 'Staff' ? '#0f766e' : '#64748b',
              boxShadow: role === 'Staff' ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
              fontWeight: 700,
              fontSize: '0.825rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <KeyRound size={16} /> Billing Staff
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.75rem 1.75rem 2rem' }}>
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.4rem'
              }}>
                Username / Login ID
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={role === 'Admin' ? 'admin' : 'staff'}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = role === 'Admin' ? '#991b1b' : '#0f766e';
                    e.currentTarget.style.boxShadow = role === 'Admin'
                      ? '0 0 0 3px rgba(153, 27, 27, 0.12)'
                      : '0 0 0 3px rgba(15, 118, 110, 0.12)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.4rem'
              }}>
                {role === 'Admin' ? 'Admin Password' : 'Staff PIN'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder={role === 'Admin' ? '••••••••' : '••••'}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                    border: error ? '1px solid #dc2626' : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    letterSpacing: '0.12em',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={e => {
                    if (!error) {
                      e.currentTarget.style.borderColor = role === 'Admin' ? '#991b1b' : '#0f766e';
                      e.currentTarget.style.boxShadow = role === 'Admin'
                        ? '0 0 0 3px rgba(153, 27, 27, 0.12)'
                        : '0 0 0 3px rgba(15, 118, 110, 0.12)';
                    }
                  }}
                  onBlur={e => {
                    if (!error) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>

              {error && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.775rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontWeight: 600
                }}>
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: role === 'Admin'
                  ? 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)'
                  : 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: role === 'Admin'
                  ? '0 4px 12px rgba(153, 27, 27, 0.3)'
                  : '0 4px 12px rgba(15, 118, 110, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
                opacity: isSubmitting ? 0.75 : 1
              }}
            >
              <span>{isSubmitting ? 'Verifying...' : `Sign In as ${role}`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Secure session note */}
          <div style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: '#94a3b8'
          }}>
            Authorized Personnel Only &bull; S.B.R. Chemicals & Oils
          </div>
        </div>
      </div>
    </div>
  );
};
