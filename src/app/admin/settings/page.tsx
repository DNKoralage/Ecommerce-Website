'use client';

import React, { useState, useEffect } from 'react';
import { Save, Globe, Bell, CreditCard, Truck, Shield } from 'lucide-react';
import { api } from '@/lib/store';
import { SiteSettings } from '@/types';

type SettingsTab = 'general' | 'shipping' | 'payments' | 'notifications' | 'advanced';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'advanced', label: 'Advanced', icon: Shield },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSiteSettings().then(setSettings);
  }, []);

  const handleChange = (key: keyof SiteSettings, value: unknown) => {
    if (!settings) return;
    setSettings(s => s ? { ...s, [key]: value } : s);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await api.updateSiteSettings(settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
  const sectionTitle: React.CSSProperties = {
    fontSize: 13, fontWeight: 700, color: '#E8E6E1', marginBottom: 16,
    paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)',
  };

  if (!settings) {
    return <div style={{ padding: 48, textAlign: 'center', color: '#6B6760' }}>Loading settings…</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#E8E6E1', letterSpacing: '-0.02em', margin: 0 }}>Settings</h1>
          <p style={{ color: '#6B6760', fontSize: 13, marginTop: 4 }}>Configure your store preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: saved ? 'rgba(74,222,128,0.2)' : 'linear-gradient(135deg, #C9A96E, #8B6914)',
            border: saved ? '1px solid rgba(74,222,128,0.4)' : 'none',
            color: saved ? '#4ADE80' : '#0A0A0F', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            transition: 'all 0.3s',
          }}
        >
          <Save size={15} />
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Tab nav */}
        <nav>
          {TABS.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 4,
                  background: isActive ? 'rgba(201,169,110,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(201,169,110,0.2)' : '1px solid transparent',
                  color: isActive ? '#C9A96E' : '#9A9490',
                  fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>

          {tab === 'general' && (
            <div style={{ display: 'grid', gap: 20 }}>
              <p style={sectionTitle}>Store Information</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Store Name</label>
                  <input value={settings.site_name} onChange={e => handleChange('site_name', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tagline</label>
                  <input value={settings.tagline} onChange={e => handleChange('tagline', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Contact Email</label>
                  <input type="email" value={settings.contact_email} onChange={e => handleChange('contact_email', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Contact Phone</label>
                  <input value={settings.contact_phone} onChange={e => handleChange('contact_phone', e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Business Address</label>
                <input value={settings.business_address} onChange={e => handleChange('business_address', e.target.value)} style={inputStyle} />
              </div>

              <p style={{ ...sectionTitle, marginTop: 8 }}>Currency & Tax</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Currency Code</label>
                  <input value={settings.currency_code} onChange={e => handleChange('currency_code', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Currency Symbol</label>
                  <input value={settings.currency_symbol} onChange={e => handleChange('currency_symbol', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tax Rate (%)</label>
                  <input type="number" value={settings.tax_rate} onChange={e => handleChange('tax_rate', parseFloat(e.target.value))} style={inputStyle} />
                </div>
              </div>

              <p style={{ ...sectionTitle, marginTop: 8 }}>Announcement Bar</p>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: '#9A9490', fontSize: 13 }}>Enabled</span>
                <button onClick={() => handleChange('announcement_bar_active', !settings.announcement_bar_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {settings.announcement_bar_active
                    ? <span style={{ fontSize: 24, color: '#4ADE80' }}>⬤</span>
                    : <span style={{ fontSize: 24, color: '#6B6760' }}>○</span>}
                </button>
              </div>
              <div>
                <label style={labelStyle}>Announcement Text</label>
                <input value={settings.announcement_bar_text || ''} onChange={e => handleChange('announcement_bar_text', e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Announcement Link</label>
                <input value={settings.announcement_bar_link || ''} onChange={e => handleChange('announcement_bar_link', e.target.value)} style={inputStyle} placeholder="/products" />
              </div>
            </div>
          )}

          {tab === 'shipping' && (
            <div>
              <p style={sectionTitle}>Shipping Configuration</p>
              <div style={{ padding: 20, background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 12 }}>
                <p style={{ margin: 0, color: '#C9A96E', fontSize: 13 }}>
                  Shipping methods are currently managed in the seed data. Connect to Supabase to enable dynamic shipping configuration from this panel.
                </p>
              </div>
              <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
                {[
                  { name: 'Standard Delivery', price: 'Rs. 199', days: '5–7 business days' },
                  { name: 'Express Delivery', price: 'Rs. 499', days: '2–3 business days' },
                  { name: 'Next Day Courier', price: 'Rs. 999', days: '1 business day' },
                ].map(s => (
                  <div key={s.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 18px' }}>
                    <div>
                      <div style={{ color: '#E8E6E1', fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                      <div style={{ color: '#6B6760', fontSize: 12, marginTop: 2 }}>{s.days}</div>
                    </div>
                    <div style={{ color: '#C9A96E', fontWeight: 700, fontSize: 16 }}>{s.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'payments' && (
            <div>
              <p style={sectionTitle}>Payment Gateways</p>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { name: 'Razorpay', desc: 'Cards, UPI, Netbanking, Wallets', status: 'configured' },
                  { name: 'Cash on Delivery', desc: 'Pay when you receive', status: 'active' },
                  { name: 'Stripe', desc: 'International payments', status: 'inactive' },
                ].map(gw => (
                  <div key={gw.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px' }}>
                    <div>
                      <div style={{ color: '#E8E6E1', fontWeight: 600 }}>{gw.name}</div>
                      <div style={{ color: '#6B6760', fontSize: 12, marginTop: 2 }}>{gw.desc}</div>
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: gw.status === 'active' || gw.status === 'configured' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                      color: gw.status === 'active' || gw.status === 'configured' ? '#4ADE80' : '#6B6760',
                    }}>
                      {gw.status === 'configured' ? 'Configured' : gw.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div>
              <p style={sectionTitle}>Email Notifications</p>
              {[
                { label: 'New order confirmation (customer)', enabled: true },
                { label: 'Order shipped (customer)', enabled: true },
                { label: 'New order alert (admin)', enabled: true },
                { label: 'Low stock alert (admin)', enabled: false },
                { label: 'Newsletter subscription confirmation', enabled: true },
              ].map(n => (
                <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: '#9A9490', fontSize: 13 }}>{n.label}</span>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: n.enabled ? '#C9A96E' : 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: n.enabled ? 19 : 3, transition: 'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'advanced' && (
            <div>
              <p style={sectionTitle}>Store Mode</p>
              <div style={{ padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#E8E6E1', fontWeight: 600, marginBottom: 4 }}>Maintenance Mode</div>
                    <div style={{ color: '#6B6760', fontSize: 12 }}>Show a coming soon page to non-admin visitors.</div>
                  </div>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: 'rgba(255,255,255,0.1)', position: 'relative', cursor: 'pointer' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: 3, transition: 'left 0.2s' }} />
                  </div>
                </div>
              </div>

              <p style={sectionTitle}>Social Links</p>
              <div style={{ display: 'grid', gap: 14 }}>
                {[
                  { key: 'social_instagram' as keyof SiteSettings, label: 'Instagram URL' },
                  { key: 'social_facebook' as keyof SiteSettings, label: 'Facebook URL' },
                  { key: 'social_twitter' as keyof SiteSettings, label: 'Twitter/X URL' },
                  { key: 'social_youtube' as keyof SiteSettings, label: 'YouTube URL' },
                ].map(field => (
                  <div key={field.key}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                      value={(settings[field.key] as string) || ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      style={inputStyle}
                      placeholder="https://..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          div[style*="gridTemplateColumns: '200px 1fr'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
