'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Package } from 'lucide-react';
import { api } from '@/lib/store';
import { Order } from '@/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatCurrency(n: number) {
  return 'Rs. ' + n.toLocaleString('en-LK');
}

interface CustomerSummary {
  email: string;
  name: string;
  orders: Order[];
  totalSpent: number;
  lastOrder: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerSummary | null>(null);

  useEffect(() => {
    api.getOrders().then(orders => {
      const map: Record<string, CustomerSummary> = {};
      orders.forEach(o => {
        const addr = o.shipping_address as { full_name?: string };
        if (!map[o.email]) {
          map[o.email] = { email: o.email, name: addr?.full_name || o.email.split('@')[0], orders: [], totalSpent: 0, lastOrder: o.created_at };
        }
        map[o.email].orders.push(o);
        if (o.payment_status === 'paid') map[o.email].totalSpent += o.total;
        if (o.created_at > map[o.email].lastOrder) map[o.email].lastOrder = o.created_at;
      });
      setCustomers(Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent));
      setLoading(false);
    });
  }, []);

  const filtered = customers.filter(c =>
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>Customers</h1>
        <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4 }}>{customers.length} unique customers from orders.</p>
      </div>

      <div style={{ position: 'relative', maxWidth: 380, marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B6760' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </span>
        <input
          placeholder="Search customer or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 12px 9px 36px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#E8E6E1', fontSize: 13 }}
        />
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6B6760' }}>Loading customers…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Users size={32} style={{ margin: '0 auto 12px', color: '#6B6760' }} />
            <p style={{ color: '#6B6760', fontSize: 13 }}>
              {customers.length === 0
                ? 'No customers yet. Customers appear here after they place orders.'
                : 'No customers match your search.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Customer', 'Email', 'Orders', 'Total Spent', 'Last Order', ''].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#6B6760', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.email}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    onClick={() => setSelected(c)}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A96E, #8B6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0A0A0F', flexShrink: 0 }}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: '#E8E6E1' }}>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#9A9490' }}>{c.email}</td>
                    <td style={{ padding: '14px 20px', color: '#E8E6E1', fontWeight: 600 }}>{c.orders.length}</td>
                    <td style={{ padding: '14px 20px', color: '#C9A96E', fontWeight: 700 }}>{formatCurrency(c.totalSpent)}</td>
                    <td style={{ padding: '14px 20px', color: '#9A9490' }}>{formatDate(c.lastOrder)}</td>
                    <td style={{ padding: '14px 20px', color: '#6B6760' }}>›</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer detail drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'flex-end' }} onClick={() => setSelected(null)}>
          <div style={{ width: '100%', maxWidth: 420, background: '#111118', borderLeft: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#E8E6E1' }}>Customer Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #C9A96E, #8B6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#0A0A0F' }}>
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#E8E6E1' }}>{selected.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B6760' }}>{selected.email}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Total Orders', value: selected.orders.length, icon: Package },
                { label: 'Total Spent', value: formatCurrency(selected.totalSpent), icon: Mail },
              ].map(stat => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14 }}>
                    <Icon size={14} color="#C9A96E" style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#E8E6E1' }}>{stat.value}</div>
                    <div style={{ fontSize: 11, color: '#6B6760', marginTop: 2 }}>{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#6B6760', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px' }}>Order History</h3>
            {selected.orders.map(o => (
              <div key={o.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#C9A96E', fontWeight: 700, fontSize: 13 }}>{o.order_number}</span>
                  <span style={{ color: '#E8E6E1', fontWeight: 700, fontSize: 13 }}>{formatCurrency(o.total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B6760' }}>
                  <span>{formatDate(o.created_at)}</span>
                  <span style={{ textTransform: 'capitalize' }}>{o.fulfillment_status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
