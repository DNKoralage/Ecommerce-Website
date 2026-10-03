'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Eye, X, Package } from 'lucide-react';
import { api } from '@/lib/store';
import { Order, FulfillmentStatus } from '@/types';
import { Suspense } from 'react';

function formatCurrency(n: number) {
  return 'Rs. ' + n.toLocaleString('en-LK');
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', year: 'numeric' });
}

const FULFILLMENT_STATUSES: { value: FulfillmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#FCD34D', label: 'Pending' },
    processing: { bg: 'rgba(99,102,241,0.15)', color: '#818CF8', label: 'Processing' },
    shipped: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA', label: 'Shipped' },
    delivered: { bg: 'rgba(74,222,128,0.15)', color: '#4ADE80', label: 'Delivered' },
    cancelled: { bg: 'rgba(248,113,113,0.15)', color: '#F87171', label: 'Cancelled' },
    paid: { bg: 'rgba(74,222,128,0.15)', color: '#4ADE80', label: 'Paid' },
    unpaid: { bg: 'rgba(248,113,113,0.15)', color: '#F87171', label: 'Unpaid' },
    refunded: { bg: 'rgba(251,191,36,0.15)', color: '#FCD34D', label: 'Refunded' },
  };
  const cfg = map[status] || { bg: 'rgba(255,255,255,0.08)', color: '#9A9490', label: status };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600,
    }}>{cfg.label}</span>
  );
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: (order: Order) => void;
}

function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
  const [status, setStatus] = useState<FulfillmentStatus>(order.fulfillment_status);
  const [tracking, setTracking] = useState(order.tracking_number || '');
  const [carrier, setCarrier] = useState(order.tracking_carrier || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updated = await api.updateOrderStatus(order.id, {
      fulfillment_status: status,
      tracking_number: tracking || null,
      tracking_carrier: carrier || null,
    });
    setSaving(false);
    if (updated) onUpdate(updated);
    onClose();
  };

  const addr = order.shipping_address as { full_name?: string; address_line1?: string; city?: string; state?: string; zip?: string };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div
        style={{
          background: '#111118', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, width: '100%', maxWidth: 640, maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#E8E6E1' }}>{order.order_number}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B6760' }}>{formatDate(order.created_at)}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6B6760', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Customer */}
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#6B6760', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Customer</h3>
            <p style={{ margin: 0, color: '#E8E6E1', fontSize: 14 }}>{order.email}</p>
            {addr?.full_name && <p style={{ margin: '4px 0 0', color: '#9A9490', fontSize: 13 }}>{addr.full_name}</p>}
            {addr?.address_line1 && (
              <p style={{ margin: '4px 0 0', color: '#9A9490', fontSize: 13 }}>
                {addr.address_line1}, {addr.city}, {addr.state} {addr.zip}
              </p>
            )}
          </section>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: '#6B6760', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Items</h3>
              {order.items.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {item.image && (
                    <img src={item.image} alt={item.title} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: '#E8E6E1', fontSize: 13, fontWeight: 500 }}>{item.title}</p>
                    <p style={{ margin: '2px 0 0', color: '#6B6760', fontSize: 12 }}>Qty: {item.quantity}</p>
                  </div>
                  <p style={{ margin: 0, color: '#C9A96E', fontWeight: 600, fontSize: 13 }}>{formatCurrency(item.line_total)}</p>
                </div>
              ))}
            </section>
          )}

          {/* Financials */}
          <section style={{ marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}>
            {[
              ['Subtotal', formatCurrency(order.subtotal)],
              ['Shipping', formatCurrency(order.shipping_cost)],
              order.discount_amount > 0 ? ['Discount', `-${formatCurrency(order.discount_amount)}`] : null,
              ['Tax (GST)', formatCurrency(order.tax_amount)],
            ].filter((x): x is string[] => x !== null).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#9A9490' }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: 15, fontWeight: 700, color: '#E8E6E1' }}>
              <span>Total</span><span style={{ color: '#C9A96E' }}>{formatCurrency(order.total)}</span>
            </div>
          </section>

          {/* Status update */}
          <section style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: '#6B6760', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 12px' }}>Update Fulfillment</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as FulfillmentStatus)}
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#E8E6E1', fontSize: 13, cursor: 'pointer',
                }}
              >
                {FULFILLMENT_STATUSES.filter(s => s.value !== 'all').map(s => (
                  <option key={s.value} value={s.value} style={{ background: '#111118' }}>{s.label}</option>
                ))}
              </select>
              <input
                placeholder="Tracking number (optional)"
                value={tracking}
                onChange={e => setTracking(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#E8E6E1', fontSize: 13,
                }}
              />
              <input
                placeholder="Carrier (e.g. Kapruka VIP, Prompt Xpress, DHL)"
                value={carrier}
                onChange={e => setCarrier(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#E8E6E1', fontSize: 13,
                }}
              />
            </div>
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '12px',
              background: saving ? 'rgba(201,169,110,0.4)' : 'linear-gradient(135deg, #C9A96E, #8B6914)',
              border: 'none', borderRadius: 10,
              color: '#0A0A0F', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusFilter = (searchParams.get('status') || 'all') as FulfillmentStatus | 'all';

  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  useEffect(() => {
    api.getOrders().then(o => { setOrders(o); setLoading(false); });

    // Live listener: refresh orders when a new order is placed (same-tab or cross-tab)
    const handleOrdersUpdate = () => {
      api.getOrders().then(o => setOrders(o));
    };
    window.addEventListener('orders_updated', handleOrdersUpdate);
    window.addEventListener('bookings_updated', handleOrdersUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'luxe_orders' || e.key === 'luxe_booking_requests') handleOrdersUpdate();
    });
    return () => {
      window.removeEventListener('orders_updated', handleOrdersUpdate);
      window.removeEventListener('bookings_updated', handleOrdersUpdate);
    };
  }, []);

  const setStatusFilter = useCallback((val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === 'all') params.delete('status'); else params.set('status', val);
    router.push('?' + params.toString());
  }, [router, searchParams]);

  const filtered = orders.filter(o => {
    if (statusFilter !== 'all' && o.fulfillment_status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.order_number.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>Orders</h1>
        <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4 }}>Manage and fulfill customer orders.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B6760' }} />
          <input
            placeholder="Search order or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '9px 12px 9px 36px', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, color: '#E8E6E1', fontSize: 13,
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FULFILLMENT_STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: '1px solid',
                borderColor: statusFilter === s.value ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.08)',
                background: statusFilter === s.value ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.03)',
                color: statusFilter === s.value ? '#C9A96E' : '#9A9490',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#6B6760' }}>Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Package size={32} style={{ margin: '0 auto 12px', color: '#6B6760' }} />
            <p style={{ color: '#6B6760', fontSize: 13 }}>No orders found.</p>
            <p style={{ color: '#4A4A50', fontSize: 12 }}>Complete a checkout on the storefront to see orders here.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Order #', 'Date', 'Customer', 'Total', 'Payment', 'Fulfillment', ''].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: '#6B6760', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td style={{ padding: '14px 20px', color: '#C9A96E', fontWeight: 700 }}>{order.order_number}</td>
                    <td style={{ padding: '14px 20px', color: '#9A9490', whiteSpace: 'nowrap' }}>{formatDate(order.created_at)}</td>
                    <td style={{ padding: '14px 20px', color: '#E8E6E1' }}>{order.email}</td>
                    <td style={{ padding: '14px 20px', color: '#E8E6E1', fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={order.payment_status} /></td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={order.fulfillment_status} /></td>
                    <td style={{ padding: '14px 20px' }}>
                      <Eye size={15} color="#6B6760" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={(updated) => setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))}
        />
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
