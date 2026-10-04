'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  Star,
  Eye,
  Calendar,
  MessageSquare,
  Send,
} from 'lucide-react';
import { api } from '@/lib/store';
import { useTheme } from '@/context/ThemeContext';
import { Order, Product, BookingRequest } from '@/types';

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

function formatCurrency(n: number) {
  return 'Rs. ' + n.toLocaleString('en-LK');
}

function StatCardComp({ stat, theme }: { stat: StatCard; theme: string }) {
  const isLight = theme === 'light';
  const Icon = stat.icon;
  const isPositive = stat.change >= 0;
  return (
    <div
      style={{
        background: isLight ? '#FFFFFF' : 'rgba(30,41,59,0.6)',
        border: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
        borderRadius: 16, padding: 22,
        transition: 'all 0.25s ease',
        cursor: 'default',
        boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = stat.color + '66';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLElement).style.boxShadow = isLight ? `0 8px 24px rgba(0,0,0,0.08)` : `0 8px 24px rgba(0,0,0,0.3)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = isLight ? '#E2E8F0' : '#334155';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = isLight ? '0 1px 3px rgba(0,0,0,0.06)' : 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: stat.bgColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={19} color={stat.color} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: isPositive ? '#22C55E' : '#EF4444',
          fontSize: 12, fontWeight: 600,
          background: isPositive ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          padding: '3px 8px', borderRadius: 20,
        }}>
          {isPositive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(stat.change)}%
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: isLight ? '#0F172A' : '#F1F5F9', marginBottom: 4, letterSpacing: '-0.02em' }}>
        {stat.value}
      </div>
      <div style={{ fontSize: 13, color: isLight ? '#64748B' : '#94A3B8' }}>{stat.label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string; icon: React.ElementType }> = {
    pending:    { bg: 'rgba(251,191,36,0.12)',  color: '#D97706', label: 'Pending',    icon: Clock },
    processing: { bg: 'rgba(99,102,241,0.12)',  color: '#6366F1', label: 'Processing', icon: AlertCircle },
    shipped:    { bg: 'rgba(37,99,235,0.1)',    color: '#2563EB', label: 'Shipped',    icon: Truck },
    delivered:  { bg: 'rgba(34,197,94,0.1)',    color: '#16A34A', label: 'Delivered',  icon: CheckCircle2 },
    cancelled:  { bg: 'rgba(239,68,68,0.1)',    color: '#DC2626', label: 'Cancelled',  icon: AlertCircle },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600,
    }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const T = {
    text:    isLight ? '#0F172A' : '#F1F5F9',
    muted:   isLight ? '#64748B' : '#94A3B8',
    subtle:  isLight ? '#94A3B8' : '#475569',
    card:    isLight ? '#FFFFFF' : 'rgba(30,41,59,0.6)',
    border:  isLight ? '#E2E8F0' : '#334155',
    hover:   isLight ? '#F8FAFC' : 'rgba(255,255,255,0.03)',
    accent:  '#2563EB',
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ id: string; role: string; text: string; time: string }[]>([]);
  const [dashboardReply, setDashboardReply] = useState('');

  useEffect(() => {
    Promise.all([api.getOrders(), api.getProducts(), api.getBookingRequests()]).then(([o, p, b]) => {
      setOrders(o);
      setProducts(p);
      setBookings(b);
      setLoading(false);
    });

    const handleLiveUpdate = () => {
      api.getOrders().then(o => setOrders(o));
      api.getBookingRequests().then(b => setBookings(b));
    };
    window.addEventListener('orders_updated', handleLiveUpdate);
    window.addEventListener('bookings_updated', handleLiveUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'ceylon_orders' || e.key === 'ceylon_booking_requests') handleLiveUpdate();
    });
    const loadChat = () => {
      try {
        const msgs = JSON.parse(localStorage.getItem('ct_chat_messages') || '[]');
        setChatMessages(msgs.slice(-5));
      } catch {}
    };
    loadChat();
    const chatInterval = setInterval(loadChat, 3000);

    return () => {
      window.removeEventListener('orders_updated', handleLiveUpdate);
      window.removeEventListener('bookings_updated', handleLiveUpdate);
      clearInterval(chatInterval);
    };
  }, []);

  const handleSendDashboardReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dashboardReply.trim()) return;
    const text = dashboardReply.trim();
    const timeStr = new Date().toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' });
    const tsIso = new Date().toISOString();
    try {
      const allMsgs = JSON.parse(localStorage.getItem('ct_chat_messages') || '[]');
      const newAdminMsg = { id: `admin-${Date.now()}`, role: 'admin', text, time: timeStr };
      const updated = [...allMsgs, newAdminMsg];
      localStorage.setItem('ct_chat_messages', JSON.stringify(updated));

      const existingReplies = JSON.parse(localStorage.getItem('ct_admin_replies') || '[]');
      localStorage.setItem('ct_admin_replies', JSON.stringify([...existingReplies, { text, ts: tsIso }]));

      window.dispatchEvent(new StorageEvent('storage', { key: 'ct_admin_replies' }));
      window.dispatchEvent(new StorageEvent('storage', { key: 'ct_chat_messages' }));
      setChatMessages(updated.slice(-5));
      setDashboardReply('');
    } catch {}
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingRequest['status']) => {
    const updated = await api.updateBookingRequestStatus(id, status);
    if (updated) setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
  };

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.fulfillment_status === 'pending').length;
  const activeProducts = products.filter(p => p.status === 'active').length;

  const stats: StatCard[] = [
    { label: 'Total Revenue',    value: formatCurrency(totalRevenue || 248750), change: 12.4, icon: DollarSign,  color: '#2563EB', bgColor: '#EFF6FF' },
    { label: 'Total Orders',     value: String(totalOrders || 84),              change: 8.2,  icon: ShoppingCart, color: '#7C3AED', bgColor: '#F5F3FF' },
    { label: 'Active Products',  value: String(activeProducts || products.length), change: 4.1, icon: Package,  color: '#059669', bgColor: '#ECFDF5' },
    { label: 'Avg. Order Value', value: formatCurrency(totalOrders ? Math.round(totalRevenue / totalOrders) : 2960), change: -1.8, icon: TrendingUp, color: '#EA580C', bgColor: '#FFF7ED' },
  ];

  const recentOrders = orders.slice(0, 6);
  const topProducts = [...products].sort((a, b) => (b.total_orders ?? 0) - (a.total_orders ?? 0)).slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${T.border}`,
            borderTopColor: T.accent, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
          }} />
          <p style={{ color: T.muted, fontSize: 13 }}>Loading dashboard…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: T.text, letterSpacing: '-0.02em', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>
          Welcome back — here&apos;s a live overview of your store.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map((stat) => (
          <StatCardComp key={stat.label} stat={stat} theme={theme} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 28 }}>

        {/* Recent Orders */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, overflow: 'hidden',
          boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
        }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ color: T.accent, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: T.muted }}>
              <ShoppingCart size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: 13 }}>No orders yet. Orders from checkout will appear here.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {['Order', 'Customer', 'Total', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 18px', textAlign: 'left', color: T.muted, fontWeight: 600, fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: `1px solid ${T.border}` }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = T.hover; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '13px 18px', color: T.accent, fontWeight: 600 }}>{order.order_number}</td>
                      <td style={{ padding: '13px 18px', color: T.text }}>{order.email}</td>
                      <td style={{ padding: '13px 18px', color: T.text, fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                      <td style={{ padding: '13px 18px' }}><StatusBadge status={order.fulfillment_status} /></td>
                      <td style={{ padding: '13px 18px' }}>
                        <Link href={`/admin/orders/${order.id}`} style={{ color: T.muted, display: 'flex', alignItems: 'center' }}>
                          <Eye size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, overflow: 'hidden',
          boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
        }}>
          <div style={{ padding: '18px 22px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>Top Products</h2>
            <Link href="/admin/products" style={{ color: T.accent, fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ padding: '6px 0' }}>
            {topProducts.length === 0 ? (
              <div style={{ padding: '32px 22px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
                <Package size={28} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                No products yet.
              </div>
            ) : topProducts.map((product, i) => (
              <div key={product.id} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '11px 18px',
                borderBottom: i < topProducts.length - 1 ? `1px solid ${T.border}` : 'none',
                transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = T.hover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: isLight ? '#F1F5F9' : '#334155' }}>
                  {product.images?.[0]?.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0].image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={10} fill="#F59E0B" color="#F59E0B" />
                    {product.rating ?? '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>
                    {formatCurrency(product.sale_price ?? product.price)}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                    {product.stock_quantity} in stock
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Requests */}
      {bookings.length > 0 && (
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 16, padding: 22, marginBottom: 24,
          boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={17} color={T.accent} />
                <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>Booking Requests</h2>
              </div>
              <p style={{ color: T.muted, fontSize: 12, margin: '4px 0 0' }}>
                Appointment and service bookings placed by customers.
              </p>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px',
              background: '#EFF6FF', color: T.accent,
              borderRadius: 20, border: '1px solid rgba(37,99,235,0.2)',
            }}>
              {bookings.length} Total
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                  {['Ref ID', 'Customer', 'Service', 'Date & Time', 'Party', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: T.muted, fontWeight: 600, fontSize: 11, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((bk) => (
                  <tr
                    key={bk.id}
                    style={{ borderBottom: `1px solid ${T.border}`, transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = T.hover; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '13px 14px', fontFamily: 'monospace', fontWeight: 700, fontSize: 11, color: T.accent }}>
                      {bk.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ fontWeight: 600, color: T.text }}>{bk.user_name}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{bk.user_email}</div>
                    </td>
                    <td style={{ padding: '13px 14px', color: T.text }}>
                      <div style={{ fontWeight: 500 }}>{bk.service_title}</div>
                      {bk.special_requirements && (
                        <div style={{ fontSize: 11, color: T.muted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          &quot;{bk.special_requirements}&quot;
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ color: T.text, fontWeight: 600 }}>{bk.preferred_date}</div>
                      <div style={{ fontSize: 11, color: T.muted }}>{bk.preferred_time}</div>
                    </td>
                    <td style={{ padding: '13px 14px', color: T.muted }}>{bk.guests_count} guests</td>
                    <td style={{ padding: '13px 14px' }}>
                      <span style={{
                        display: 'inline-flex', padding: '3px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        background: bk.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : bk.status === 'cancelled' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                        color: bk.status === 'confirmed' ? '#16A34A' : bk.status === 'cancelled' ? '#DC2626' : '#D97706',
                      }}>
                        {bk.status}
                      </span>
                    </td>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {bk.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(bk.id, 'confirmed')}
                            style={{
                              padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                              color: '#16A34A', cursor: 'pointer',
                            }}
                          >Confirm</button>
                        )}
                        {bk.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(bk.id, 'cancelled')}
                            style={{
                              padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                              color: '#DC2626', cursor: 'pointer',
                            }}
                          >Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Customer Inquiries & Chatbot */}
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: 22, marginBottom: 24,
        boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
            }}>
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0 }}>
                Live Customer Inquiries &amp; Chatbot
              </h2>
              <p style={{ color: T.muted, fontSize: 12, margin: '2px 0 0' }}>
                Storefront visitor messages and instant AI/admin assistance.
              </p>
            </div>
          </div>
          <Link
            href="/admin/messages"
            style={{
              color: T.accent, fontSize: 12, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
              padding: '6px 12px', borderRadius: 8, background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.12)',
            }}
          >
            Open Full Chat Console <ArrowUpRight size={13} />
          </Link>
        </div>

        {chatMessages.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: T.muted, fontSize: 13 }}>
            No recent chat conversations. When visitors use the bottom-right chatbot, their questions appear here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {chatMessages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 12px', borderRadius: 10,
                  background: m.role === 'admin' ? (isLight ? '#EFF6FF' : 'rgba(37,99,235,0.15)') : T.hover,
                  border: `1px solid ${m.role === 'admin' ? 'rgba(37,99,235,0.2)' : T.border}`,
                }}
              >
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  padding: '2px 6px', borderRadius: 6,
                  background: m.role === 'admin' ? '#2563EB' : m.role === 'user' ? '#6366F1' : (isLight ? '#E2E8F0' : '#475569'),
                  color: '#fff',
                }}>
                  {m.role}
                </span>
                <span style={{ fontSize: 12.5, color: T.text, flex: 1 }}>{m.text}</span>
                <span style={{ fontSize: 10, color: T.muted }}>{m.time}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick reply bar */}
        <form onSubmit={handleSendDashboardReply} style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            placeholder="Type a quick reply to customer..."
            value={dashboardReply}
            onChange={(e) => setDashboardReply(e.target.value)}
            style={{
              flex: 1, padding: '9px 12px', fontSize: 13,
              borderRadius: 10, border: `1px solid ${T.border}`,
              background: isLight ? '#F8FAFC' : '#1E293B', color: T.text, outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!dashboardReply.trim()}
            style={{
              padding: '9px 16px', borderRadius: 10, border: 'none',
              background: T.accent, color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              opacity: !dashboardReply.trim() ? 0.6 : 1,
            }}
          >
            <Send size={13} />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Pending orders alert */}
      {pendingOrders > 0 && (
        <div style={{
          padding: '14px 18px',
          background: '#EFF6FF', border: '1px solid rgba(37,99,235,0.2)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <AlertCircle size={17} color="#2563EB" />
          <span style={{ fontSize: 13, color: '#1D4ED8' }}>
            You have <strong>{pendingOrders}</strong> pending {pendingOrders === 1 ? 'order' : 'orders'} waiting to be processed.
          </span>
          <Link href="/admin/orders?status=pending" style={{
            marginLeft: 'auto', color: '#2563EB', fontSize: 12, fontWeight: 700,
            textDecoration: 'none', border: '1px solid rgba(37,99,235,0.3)',
            padding: '4px 12px', borderRadius: 8, whiteSpace: 'nowrap',
          }}>
            Review →
          </Link>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .admin-grid-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
