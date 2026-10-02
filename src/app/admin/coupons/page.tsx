'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, ToggleLeft, ToggleRight, Ticket } from 'lucide-react';
import { api } from '@/lib/store';
import { Coupon } from '@/types';

const LOCAL_KEY = 'luxe_coupons';
function saveCoupons(coupons: Coupon[]) {
  if (typeof window !== 'undefined') localStorage.setItem(LOCAL_KEY, JSON.stringify(coupons));
}

function CouponForm({ onClose, onSave }: { onClose: () => void; onSave: (c: Coupon) => void }) {
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', min_order: '', limit: '', valid_to: '',
  });

  const handleSave = () => {
    if (!form.code || !form.value) return;
    const coupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: form.code.toUpperCase(),
      type: form.type as 'percentage' | 'fixed',
      value: parseFloat(form.value),
      min_order_amount: parseFloat(form.min_order) || 0,
      usage_limit: form.limit ? parseInt(form.limit) : null,
      per_customer_limit: null,
      times_used: 0,
      valid_from: new Date().toISOString(),
      valid_to: form.valid_to || null,
      is_active: true,
    };
    onSave(coupon);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#E8E6E1', fontSize: 13,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#6B6760', letterSpacing: '0.08em',
    textTransform: 'uppercase', display: 'block', marginBottom: 6,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 500, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#E8E6E1' }}>Create Coupon</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: 24, display: 'grid', gap: 14 }}>
          <div>
            <label style={labelStyle}>Coupon Code</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} style={inputStyle} placeholder="e.g. SAVE20" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="percentage" style={{ background: '#111118' }}>Percentage (%)</option>
                <option value="fixed" style={{ background: '#111118' }}>Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Discount Value</label>
              <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} style={inputStyle} placeholder={form.type === 'percentage' ? '20' : '500'} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Min Order Amount (₹)</label>
              <input type="number" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} style={inputStyle} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Usage Limit</label>
              <input type="number" value={form.limit} onChange={e => setForm(f => ({ ...f, limit: e.target.value }))} style={inputStyle} placeholder="Unlimited" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Valid Until</label>
            <input type="date" value={form.valid_to} onChange={e => setForm(f => ({ ...f, valid_to: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9A9490', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleSave} style={{ flex: 2, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #C9A96E, #8B6914)', border: 'none', color: '#0A0A0F', fontWeight: 700, cursor: 'pointer' }}>Create Coupon</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    api.getCoupons().then(c => {
      setCoupons(c);
      saveCoupons(c);
      setLoading(false);
    });
  }, []);

  const handleSave = (c: Coupon) => {
    setCoupons(prev => { const next = [c, ...prev]; saveCoupons(next); return next; });
  };

  const handleToggle = (coupon: Coupon) => {
    setCoupons(prev => {
      const next = prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c);
      saveCoupons(next); return next;
    });
  };

  const handleDelete = (id: string) => {
    setCoupons(prev => { const next = prev.filter(c => c.id !== id); saveCoupons(next); return next; });
    setDeleteId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>Coupons</h1>
          <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4 }}>Manage promotional codes and discounts.</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #C9A96E, #8B6914)', border: 'none', color: '#0A0A0F', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={16} /> New Coupon
        </button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6B6760' }}>Loading…</div>
        ) : coupons.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Ticket size={32} style={{ margin: '0 auto 12px', color: '#6B6760' }} />
            <p style={{ color: '#6B6760', fontSize: 13 }}>No coupons yet. Create your first one.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Code', 'Type', 'Value', 'Min Order', 'Used / Limit', 'Valid Until', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#6B6760', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: '#C9A96E' }}>{c.code}</td>
                    <td style={{ padding: '14px 20px', color: '#9A9490' }}>{c.type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                    <td style={{ padding: '14px 20px', color: '#E8E6E1', fontWeight: 600 }}>{c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}</td>
                    <td style={{ padding: '14px 20px', color: '#9A9490' }}>
                      ₹{((c.min_order_amount ?? c.min_order_value ?? 0)).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#9A9490' }}>
                      {c.times_used ?? c.uses_count ?? 0} / {c.usage_limit ?? c.max_uses ?? '∞'}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#9A9490' }}>
                      {(c.valid_to || c.expires_at) ? new Date(String(c.valid_to || c.expires_at)).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => handleToggle(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {c.is_active ? <ToggleRight size={22} color="#4ADE80" /> : <ToggleLeft size={22} color="#6B6760" />}
                        <span style={{ fontSize: 11, color: c.is_active ? '#4ADE80' : '#6B6760' }}>{c.is_active ? 'Active' : 'Off'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button onClick={() => setDeleteId(c.id)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: 0 }}><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && <CouponForm onClose={() => setShowForm(false)} onSave={handleSave} />}

      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#111118', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 16, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <AlertCircle size={34} color="#F87171" style={{ margin: '0 auto 14px' }} />
            <h3 style={{ color: '#E8E6E1', margin: '0 0 8px', fontSize: 16 }}>Delete Coupon?</h3>
            <p style={{ color: '#6B6760', fontSize: 13, margin: '0 0 22px' }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#9A9490', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', color: '#F87171', fontWeight: 700, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
