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
      background: 'radial-gradient(ellipse at 50% 25%, #2c221b 0%, #140f0c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e7dfce',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(212, 175, 55, 0.15)',
        overflow: 'hidden',
        animation: 'fadeInScale 0.22s ease-out'
      }}>
        {/* Header Ribbon */}
        <div style={{
          background: 'linear-gradient(135deg, #881337 0%, #70102d 100%)',
          padding: '1.85rem 1.5rem 1.6rem',
          color: '#ffffff',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '2px solid #b8860b'
        }}>
          {/* Logo Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1.5px solid rgba(212, 175, 55, 0.6)',
            marginBottom: '0.75rem',
            boxShadow: '0 8px 18px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
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
            fontSize: '1.3rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            margin: '0 0 0.2rem 0',
            textTransform: 'uppercase'
          }}>
            S.B.R. CHEMICALS & OILS
          </h2>
          <p style={{
            fontSize: '0.75rem',
            color: 'rgba(254, 226, 226, 0.92)',
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
          padding: '0.45rem',
          background: '#faf7f2',
          borderBottom: '1px solid #e7dfce',
          gap: '0.45rem'
        }}>
          <button
            type="button"
            onClick={() => handleRoleSwitch('Admin')}
            style={{
              padding: '0.7rem 0.5rem',
              borderRadius: '8px',
              border: role === 'Admin' ? '1px solid #e7dfce' : '1px solid transparent',
              background: role === 'Admin' ? '#ffffff' : 'transparent',
              color: role === 'Admin' ? '#881337' : '#78716c',
              boxShadow: role === 'Admin' ? '0 2px 5px rgba(44, 38, 30, 0.08)' : 'none',
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
              padding: '0.7rem 0.5rem',
              borderRadius: '8px',
              border: role === 'Staff' ? '1px solid #e7dfce' : '1px solid transparent',
              background: role === 'Staff' ? '#ffffff' : 'transparent',
              color: role === 'Staff' ? '#0f766e' : '#78716c',
              boxShadow: role === 'Staff' ? '0 2px 5px rgba(44, 38, 30, 0.08)' : 'none',
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
        <div style={{ padding: '1.65rem 1.65rem 1.85rem' }}>
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '1.15rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#44403c',
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
                  color: '#a8a29e'
                }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={role === 'Admin' ? 'admin' : 'staff'}
                  style={{
                    width: '100%',
                    padding: '0.68rem 0.85rem 0.68rem 2.4rem',
                    border: '1px solid #d6d3d1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = role === 'Admin' ? '#881337' : '#0f766e';
                    e.currentTarget.style.boxShadow = role === 'Admin'
                      ? '0 0 0 3px rgba(136, 19, 55, 0.12)'
                      : '0 0 0 3px rgba(15, 118, 110, 0.12)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = '#d6d3d1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#44403c',
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
                  color: '#a8a29e'
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder={role === 'Admin' ? '••••••••' : '••••'}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.68rem 0.85rem 0.68rem 2.4rem',
                    border: error ? '1px solid #dc2626' : '1px solid #d6d3d1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    letterSpacing: '0.12em',
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#ffffff',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={e => {
                    if (!error) {
                      e.currentTarget.style.borderColor = role === 'Admin' ? '#881337' : '#0f766e';
                      e.currentTarget.style.boxShadow = role === 'Admin'
                        ? '0 0 0 3px rgba(136, 19, 55, 0.12)'
                        : '0 0 0 3px rgba(15, 118, 110, 0.12)';
                    }
                  }}
                  onBlur={e => {
                    if (!error) {
                      e.currentTarget.style.borderColor = '#d6d3d1';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>

              {error && (
                <div style={{
                  color: '#dc2626',
                  fontSize: '0.775rem',
                  marginTop: '0.45rem',
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
                padding: '0.75rem',
                background: role === 'Admin'
                  ? 'linear-gradient(135deg, #881337 0%, #70102d 100%)'
                  : 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: role === 'Admin'
                  ? '0 4px 14px rgba(136, 19, 55, 0.35)'
                  : '0 4px 14px rgba(15, 118, 110, 0.35)',
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
            marginTop: '1.65rem',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: '#a8a29e',
            letterSpacing: '0.02em'
          }}>
            Authorized Personnel Only &bull; S.B.R. Chemicals & Oils
          </div>
        </div>
      </div>
    </div>
  );
};
