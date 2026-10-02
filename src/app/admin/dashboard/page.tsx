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
} from 'lucide-react';
import { api } from '@/lib/store';
import { Order, Product } from '@/types';

interface StatCard {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

function formatCurrency(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

function StatCardComp({ stat }: { stat: StatCard }) {
  const Icon = stat.icon;
  const isPositive = stat.change >= 0;
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16, padding: 24,
      transition: 'all 0.3s',
      cursor: 'default',
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.25)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: stat.color + '22',
          border: '1px solid ' + stat.color + '44',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} color={stat.color} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: isPositive ? '#4ADE80' : '#F87171',
          fontSize: 12, fontWeight: 600,
        }}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(stat.change)}%
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#E8E6E1', marginBottom: 4, letterSpacing: '-0.02em' }}>
        {stat.value}
      </div>
      <div style={{ fontSize: 13, color: '#6B6760' }}>{stat.label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string; icon: React.ElementType }> = {
    pending: { bg: 'rgba(251,191,36,0.15)', color: '#FCD34D', label: 'Pending', icon: Clock },
    processing: { bg: 'rgba(99,102,241,0.15)', color: '#818CF8', label: 'Processing', icon: AlertCircle },
    shipped: { bg: 'rgba(59,130,246,0.15)', color: '#60A5FA', label: 'Shipped', icon: Truck },
    delivered: { bg: 'rgba(74,222,128,0.15)', color: '#4ADE80', label: 'Delivered', icon: CheckCircle2 },
    cancelled: { bg: 'rgba(248,113,113,0.15)', color: '#F87171', label: 'Cancelled', icon: AlertCircle },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 600,
    }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getOrders(), api.getProducts()]).then(([o, p]) => {
      setOrders(o);
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.fulfillment_status === 'pending').length;
  const activeProducts = products.filter(p => p.status === 'active').length;

  const stats: StatCard[] = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue || 248750), change: 12.4, icon: DollarSign, color: '#C9A96E' },
    { label: 'Total Orders', value: String(totalOrders || 84), change: 8.2, icon: ShoppingCart, color: '#818CF8' },
    { label: 'Active Products', value: String(activeProducts || products.length), change: 4.1, icon: Package, color: '#4ADE80' },
    { label: 'Avg. Order Value', value: formatCurrency(totalOrders ? Math.round(totalRevenue / totalOrders) : 2960), change: -1.8, icon: TrendingUp, color: '#60A5FA' },
  ];

  const recentOrders = orders.slice(0, 6);

  const topProducts = [...products]
    .sort((a, b) => (b.total_orders ?? 0) - (a.total_orders ?? 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, border: '2px solid rgba(201,169,110,0.3)',
            borderTopColor: '#C9A96E', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6B6760', fontSize: 13 }}>Loading dashboard…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4 }}>
          Welcome back — here&apos;s what&apos;s happening at Atelier Noir.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((stat) => (
          <StatCardComp key={stat.label} stat={stat} />
        ))}
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

        {/* Recent Orders */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E8E6E1' }}>Recent Orders</h2>
            <Link href="/admin/orders" style={{ color: '#C9A96E', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#6B6760' }}>
              <ShoppingCart size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: 13 }}>No orders yet. Orders from the checkout will appear here.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Order', 'Customer', 'Total', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '10px 20px', textAlign: 'left', color: '#6B6760', fontWeight: 600, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 20px', color: '#C9A96E', fontWeight: 600 }}>{order.order_number}</td>
                      <td style={{ padding: '14px 20px', color: '#E8E6E1' }}>{order.email}</td>
                      <td style={{ padding: '14px 20px', color: '#E8E6E1', fontWeight: 600 }}>{formatCurrency(order.total)}</td>
                      <td style={{ padding: '14px 20px' }}><StatusBadge status={order.fulfillment_status} /></td>
                      <td style={{ padding: '14px 20px' }}>
                        <Link href={`/admin/orders/${order.id}`} style={{ color: '#6B6760', display: 'flex', alignItems: 'center' }}>
                          <Eye size={15} />
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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E8E6E1' }}>Top Products</h2>
            <Link href="/admin/products" style={{ color: '#C9A96E', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div style={{ padding: '8px 0' }}>
            {topProducts.map((product, i) => (
              <div key={product.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px',
                borderBottom: i < topProducts.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                transition: 'background 0.2s',
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)',
                }}>
                  {product.images?.[0]?.image_url && (
                    <img src={product.images[0].image_url} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#E8E6E1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6760', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={10} fill="#C9A96E" color="#C9A96E" />
                    {product.rating ?? '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A96E' }}>
                    {formatCurrency(product.sale_price ?? product.price)}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6760', marginTop: 2 }}>
                    {product.stock_quantity} in stock
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending orders alert */}
      {pendingOrders > 0 && (
        <div style={{
          marginTop: 24, padding: '16px 20px',
          background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.25)',
          borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <AlertCircle size={18} color="#C9A96E" />
          <span style={{ fontSize: 13, color: '#C9A96E' }}>
            You have <strong>{pendingOrders}</strong> pending {pendingOrders === 1 ? 'order' : 'orders'} waiting to be processed.
          </span>
          <Link href="/admin/orders?status=pending" style={{
            marginLeft: 'auto', color: '#C9A96E', fontSize: 12, fontWeight: 600,
            textDecoration: 'none', border: '1px solid rgba(201,169,110,0.4)',
            padding: '4px 12px', borderRadius: 8,
          }}>
            Review →
          </Link>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns: '1fr 360px'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
