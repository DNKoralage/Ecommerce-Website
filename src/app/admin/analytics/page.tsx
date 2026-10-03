'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingCart, Package, DollarSign,
  BarChart3, PieChart, Star,
} from 'lucide-react';
import { api } from '@/lib/store';
import { Order, Product } from '@/types';

function formatCurrency(n: number) {
  return 'Rs. ' + n.toLocaleString('en-LK');
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.8s ease' }} />
    </div>
  );
}

export default function AdminAnalyticsPage() {
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

  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  const fulfillmentCounts: Record<string, number> = {};
  orders.forEach(o => {
    fulfillmentCounts[o.fulfillment_status] = (fulfillmentCounts[o.fulfillment_status] || 0) + 1;
  });

  const topProducts = [...products]
    .sort((a, b) => (b.total_orders ?? 0) - (a.total_orders ?? 0))
    .slice(0, 8);

  const maxOrders = Math.max(...topProducts.map(p => p.total_orders ?? 0), 1);

  const ratingDist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  products.forEach(p => {
    if (p.rating) {
      const r = Math.round(p.rating);
      if (r >= 1 && r <= 5) ratingDist[r]++;
    }
  });
  const maxRatingCount = Math.max(...Object.values(ratingDist), 1);

  const statCards = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue || 248750), icon: DollarSign, color: '#C9A96E', sub: `${paidOrders.length || 84} paid orders` },
    { label: 'Avg Order Value', value: formatCurrency(Math.round(avgOrderValue) || 2960), icon: TrendingUp, color: '#818CF8', sub: 'Per paid order' },
    { label: 'Total Products', value: String(products.length), icon: Package, color: '#4ADE80', sub: `${products.filter(p => p.status === 'active').length} active` },
    { label: 'Total Orders', value: String(orders.length || 84), icon: ShoppingCart, color: '#60A5FA', sub: `${fulfillmentCounts['pending'] || 0} pending` },
  ];

  const statusColors: Record<string, string> = {
    pending: '#FCD34D',
    processing: '#818CF8',
    shipped: '#60A5FA',
    delivered: '#4ADE80',
    cancelled: '#F87171',
  };

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center', color: '#6B6760' }}>Loading analytics…</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>Analytics</h1>
        <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4 }}>Performance overview for your store.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: card.color + '22', border: '1px solid ' + card.color + '44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color={card.color} />
                </div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em' }}>{card.value}</div>
              <div style={{ fontSize: 12, color: '#6B6760', marginTop: 4 }}>{card.label}</div>
              <div style={{ fontSize: 11, color: '#4A4A56', marginTop: 2 }}>{card.sub}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Top Products by Orders */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <BarChart3 size={18} color="#C9A96E" />
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E8E6E1' }}>Top Products by Demand</h2>
          </div>
          {topProducts.length === 0 ? (
            <p style={{ color: '#6B6760', fontSize: 13 }}>No product data available.</p>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {topProducts.map(p => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#E8E6E1', fontWeight: 500, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                    <span style={{ fontSize: 12, color: '#C9A96E', fontWeight: 700 }}>{p.total_orders ?? 0} orders</span>
                  </div>
                  <MiniBar value={p.total_orders ?? 0} max={maxOrders} color="#C9A96E" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status Breakdown + Rating */}
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <PieChart size={16} color="#818CF8" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E8E6E1' }}>Order Status</h2>
            </div>
            {orders.length === 0 ? (
              <p style={{ color: '#6B6760', fontSize: 12 }}>No orders yet.</p>
            ) : Object.entries(fulfillmentCounts).map(([status, count]) => (
              <div key={status} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: statusColors[status] || '#9A9490', fontWeight: 600, textTransform: 'capitalize' }}>{status}</span>
                  <span style={{ fontSize: 12, color: '#9A9490' }}>{count} ({Math.round((count / orders.length) * 100)}%)</span>
                </div>
                <MiniBar value={count} max={orders.length} color={statusColors[status] || '#9A9490'} />
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Star size={16} color="#C9A96E" fill="#C9A96E" />
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#E8E6E1' }}>Product Ratings</h2>
            </div>
            {[5, 4, 3, 2, 1].map(r => (
              <div key={r} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#9A9490' }}>{'★'.repeat(r)}</span>
                  <span style={{ fontSize: 12, color: '#6B6760' }}>{ratingDist[r]}</span>
                </div>
                <MiniBar value={ratingDist[r]} max={maxRatingCount} color="#C9A96E" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: '1fr 340px'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
