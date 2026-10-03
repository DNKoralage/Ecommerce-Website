'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth, DEMO_ADMIN, SecondaryAdminAccount } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function AdminTeamPage() {
  const { user, isPrimaryAdmin, createSecondaryAdmin, getSecondaryAdmins, deleteSecondaryAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [secondaryAdmins, setSecondaryAdmins] = useState<SecondaryAdminAccount[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for New Secondary Admin
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const loadAdmins = () => {
    setSecondaryAdmins(getSecondaryAdmins());
  };

  useEffect(() => {
    loadAdmins();
    const handleUpdate = () => loadAdmins();
    window.addEventListener('ceylon_admins_updated', handleUpdate);
    return () => window.removeEventListener('ceylon_admins_updated', handleUpdate);
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill in all required administrator fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passphrases do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setFormError('Passphrase must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createSecondaryAdmin({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password: password.trim(),
      });

      if (res.success) {
        success(res.message || 'Secondary administrator account created successfully.');
        setModalOpen(false);
        setFullName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        loadAdmins();
      } else {
        setFormError(res.message || 'Failed to create secondary administrator account.');
      }
    } catch {
      setFormError('An unexpected error occurred while creating administrator credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, name: string) => {
    if (!confirm(`Are you sure you wish to revoke administrative access for ${name}?`)) {
      return;
    }

    const res = await deleteSecondaryAdmin(adminId);
    if (res.success) {
      success(res.message || 'Administrative credentials revoked.');
      loadAdmins();
    } else {
      toastError(res.message || 'Could not revoke administrator.');
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#C9A96E', padding: '3px 8px', borderRadius: 4,
              background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)',
            }}>
              Sovereign Access Control
            </span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>
            Administrator &amp; Team Management
          </h1>
          <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4, margin: '4px 0 0' }}>
            Authorize secondary administrator accounts with full site maintenance access, orders oversight, and catalog control.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setModalOpen(true);
          }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 8,
            background: 'linear-gradient(135deg, #C9A96E 0%, #8B6914 100%)',
            color: '#0A0A0F', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em',
            textTransform: 'uppercase', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(201,169,110,0.25)',
          }}
        >
          <UserPlus size={16} />
          <span>Add Secondary Administrator</span>
        </button>
      </div>

      {/* Role Privilege Banner */}
      <div style={{
        background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <ShieldCheck size={24} color="#C9A96E" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#9A9490', lineHeight: 1.5 }}>
          <strong style={{ color: '#E8E6E1' }}>Full Site Maintenance Privilege:</strong> Secondary administrators receive full permissions across Ceylon Times, including managing live orders, updating booking requests, product catalogs, coupon codes, and store settings. Only the primary administrator can provision or revoke administrative accounts.
        </div>
      </div>

      {/* Admins Table */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#E8E6E1', margin: 0 }}>
            Active System Administrators ({1 + secondaryAdmins.length})
          </h2>
          <span style={{ fontSize: 12, color: '#6B6760' }}>
            Primary Director + {secondaryAdmins.length} Secondary
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Administrator', 'Email & Contact', 'Authority Level', 'Privilege Scope', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left', color: '#6B6760',
                    fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 1. Primary Admin (Immutable) */}
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(201,169,110,0.03)' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'rgba(201,169,110,0.2)', border: '1px solid #C9A96E',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFD700', fontWeight: 700, fontSize: 14,
                    }}>
                      CT
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#E8E6E1', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{DEMO_ADMIN.full_name}</span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 6px',
                          background: '#C9A96E', color: '#0A0A0F', borderRadius: 10,
                        }}>
                          ROOT
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#6B6760' }}>Sovereign Platform Creator</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ color: '#C9A96E', fontWeight: 500, fontFamily: 'monospace' }}>{DEMO_ADMIN.email}</div>
                  <div style={{ fontSize: 11, color: '#6B6760' }}>{DEMO_ADMIN.phone}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px', borderRadius: 20,
                    background: 'rgba(201,169,110,0.15)', color: '#FFD700',
                    fontSize: 11, fontWeight: 700, border: '1px solid rgba(201,169,110,0.3)',
                  }}>
                    <Shield size={12} />
                    Primary Administrator
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: '#9A9490', fontSize: 12 }}>
                  Full Sovereign Authority &amp; Team Provisioning
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                    background: 'rgba(74,222,128,0.15)', color: '#4ADE80',
                    border: '1px solid rgba(74,222,128,0.3)',
                  }}>
                    PERMANENT
                  </span>
                </td>
                <td style={{ padding: '16px 20px', color: '#6B6760', fontSize: 11, fontStyle: 'italic' }}>
                  System Root
                </td>
              </tr>

              {/* 2. Secondary Admins */}
              {secondaryAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 20px', textAlign: 'center', color: '#6B6760' }}>
                    <User size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: 13 }}>No secondary administrator accounts created yet.</p>
                    <p style={{ margin: '4px 0 0', fontSize: 11 }}>Click &quot;Add Secondary Administrator&quot; above to invite team members.</p>
                  </td>
                </tr>
              ) : (
                secondaryAdmins.map((admin) => (
                  <tr
                    key={admin.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#00FFFF', fontWeight: 700, fontSize: 13,
                        }}>
                          {admin.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#E8E6E1' }}>{admin.full_name}</div>
                          <div style={{ fontSize: 11, color: '#6B6760' }}>
                            Created {new Date(admin.created_at).toLocaleDateString('en-LK')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ color: '#00FFFF', fontFamily: 'monospace' }}>{admin.email}</div>
                      <div style={{ fontSize: 11, color: '#6B6760' }}>{admin.phone || 'No direct phone'}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 20,
                        background: 'rgba(0,255,255,0.1)', color: '#00FFFF',
                        fontSize: 11, fontWeight: 700, border: '1px solid rgba(0,255,255,0.25)',
                      }}>
                        <ShieldCheck size={12} />
                        Secondary Admin
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#9A9490', fontSize: 12 }}>
                      Full Site Maintenance Access
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700,
                        background: 'rgba(74,222,128,0.15)', color: '#4ADE80',
                        border: '1px solid rgba(74,222,128,0.3)',
                      }}>
                        ACTIVE
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id, admin.full_name)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '5px 10px', borderRadius: 6,
                          background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                          color: '#F87171', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Revoke</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Secondary Admin Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 3000,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: '#111118', border: '1px solid rgba(201,169,110,0.35)',
            borderRadius: 16, width: '100%', maxWidth: 520, overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 30px rgba(201,169,110,0.1)',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(201,169,110,0.08) 0%, transparent 100%)',
            }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', color: '#C9A96E', textTransform: 'uppercase' }}>
                  Provision Credentials
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E8E6E1', margin: '2px 0 0' }}>
                  Create Secondary Administrator
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateAdmin} style={{ padding: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A96E', marginBottom: 6 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Jayawardena"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', background: '#08080C',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                      color: '#E8E6E1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#00FFFF', marginBottom: 6 }}>
                    Administrator Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. curator@ceylontimes.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', background: '#08080C',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                      color: '#E8E6E1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9A9490', marginBottom: 6 }}>
                    Direct Contact Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +94 71 987 6543"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px', background: '#08080C',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                      color: '#E8E6E1', fontSize: 13, outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A96E', marginBottom: 6 }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', background: '#08080C',
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                        color: '#E8E6E1', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#C9A96E', marginBottom: 6 }}>
                      Confirm Pass *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat pass"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%', padding: '10px 14px', background: '#08080C',
                        border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                        color: '#E8E6E1', fontSize: 13, outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Assigned Privileges Description */}
                <div style={{
                  padding: 12, borderRadius: 8, background: 'rgba(0,255,255,0.04)',
                  border: '1px solid rgba(0,255,255,0.2)', fontSize: 11, color: '#9A9490',
                }}>
                  <span style={{ color: '#00FFFF', fontWeight: 700, display: 'block', marginBottom: 2 }}>
                    Assigned Role: Secondary Administrator
                  </span>
                  Grants full site maintenance access, orders administration, booking request management, and inventory modifications.
                </div>

                {formError && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)', color: '#F87171', fontSize: 12,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <AlertCircle size={14} />
                    <span>{formError}</span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '10px 16px', borderRadius: 8, background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)', color: '#9A9490',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 20px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #C9A96E 0%, #8B6914 100%)',
                    color: '#0A0A0F', fontSize: 12, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none',
                    cursor: 'pointer', opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? 'Creating...' : 'Create Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
