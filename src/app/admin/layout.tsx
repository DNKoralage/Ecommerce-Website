'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Settings,
  Users,
  BarChart3,
  ChevronRight,
  Menu,
  Bell,
  Search,
  LogOut,
  Store,
  Ticket,
  ShieldAlert,
  Paintbrush,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
  Sun,
  Moon,
  MessageSquare,
} from 'lucide-react';
import { api } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Order } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',   href: '/admin/dashboard',  icon: LayoutDashboard },
  { label: 'Orders',      href: '/admin/orders',      icon: ShoppingCart },
  { label: 'Live Chat',   href: '/admin/messages',    icon: MessageSquare },
  { label: 'Products',    href: '/admin/products',    icon: Package },
  { label: 'Categories',  href: '/admin/categories',  icon: Tag },
  { label: 'Coupons',     href: '/admin/coupons',     icon: Ticket },
  { label: 'Analytics',   href: '/admin/analytics',   icon: BarChart3 },
  { label: 'Customers',   href: '/admin/customers',   icon: Users },
  { label: 'Team & Admins', href: '/admin/team',      icon: ShieldAlert },
  { label: 'Customize',   href: '/admin/customize',   icon: Paintbrush },
  { label: 'Settings',    href: '/admin/settings',    icon: Settings },
];

const SIDEBAR_W = 256;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ── Theme tokens ── */
  const T = {
    bg:        isLight ? '#F8FAFC'               : '#0F172A',
    sidebarBg: isLight ? '#FFFFFF'               : '#1E293B',
    topbarBg:  isLight ? 'rgba(255,255,255,0.95)': 'rgba(15,23,42,0.95)',
    border:    isLight ? '#E2E8F0'               : '#334155',
    text:      isLight ? '#0F172A'               : '#F1F5F9',
    muted:     isLight ? '#64748B'               : '#94A3B8',
    accent:    '#2563EB',
    accentBg:  isLight ? '#EFF6FF'               : 'rgba(37,99,235,0.12)',
    active:    isLight ? '#EFF6FF'               : 'rgba(37,99,235,0.15)',
    hover:     isLight ? '#F8FAFC'               : 'rgba(255,255,255,0.04)',
    card:      isLight ? '#FFFFFF'               : 'rgba(30,41,59,0.6)',
    shadow:    isLight ? '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)'
                       : '0 1px 3px rgba(0,0,0,0.5)',
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      if (user) router.replace('/account');
      else router.replace('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [isLoading, isAdmin, user, pathname, router]);

  useEffect(() => {
    const refreshData = () => {
      api.getOrders().then((orders) => {
        const pending = orders.filter((o) => o.fulfillment_status === 'pending').length;
        setOrderCount(pending);
        setRecentOrders(orders.slice(0, 5));
      });
    };
    refreshData();
    window.addEventListener('orders_updated', refreshData);
    window.addEventListener('bookings_updated', refreshData);
    window.addEventListener('storage', (e) => {
      if (e.key === 'ceylon_orders' || e.key === 'ceylon_booking_requests') refreshData();
    });
    return () => {
      window.removeEventListener('orders_updated', refreshData);
      window.removeEventListener('bookings_updated', refreshData);
    };
  }, []);

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: T.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, border: `3px solid ${T.border}`,
            borderTopColor: T.accent, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 14px',
          }} />
          <p style={{ color: T.muted, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>Verifying access…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAdmin) return null;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/admin/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isLight ? '/logo-black.png' : '/logo-white.png'}
            alt="Ceylon Times"
            style={{ height: 30, width: 'auto', maxWidth: 88, objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, letterSpacing: '-0.01em', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2 }}>Ceylon Times | Admin Panel</div>
            <div style={{ fontSize: 9.5, color: T.accent, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Management Console</div>
          </div>
        </Link>
        {/* Close button — mobile only */}
        <button
          className="admin-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 4, display: 'none' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                background: isActive ? T.active : 'transparent',
                color: isActive ? T.accent : T.muted,
                textDecoration: 'none', fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease',
                border: isActive ? `1px solid rgba(37,99,235,${isLight ? '0.15' : '0.25'})` : '1px solid transparent',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = T.hover;
                  e.currentTarget.style.color = T.text;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = T.muted;
                }
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.label === 'Orders' && orderCount > 0 && (
                <span style={{
                  background: T.accent, color: '#fff',
                  borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                }}>{orderCount}</span>
              )}
              {isActive && <ChevronRight size={13} style={{ opacity: 0.5 }} />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.border}` }}>
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 12px', borderRadius: 10, marginBottom: 2,
            color: T.muted, textDecoration: 'none', fontSize: 13.5, transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = T.text; e.currentTarget.style.background = T.hover; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = T.muted; e.currentTarget.style.background = 'transparent'; }}
        >
          <Store size={16} />
          <span style={{ flex: 1 }}>View Storefront</span>
          <ExternalLink size={12} />
        </Link>
        <button
          onClick={() => { logout(); router.push('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '9px 12px', borderRadius: 10, width: '100%',
            background: 'none', border: 'none', cursor: 'pointer',
            color: T.muted, fontSize: 13.5, textAlign: 'left', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = T.muted; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, sans-serif' }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        style={{
          width: SIDEBAR_W, flexShrink: 0,
          background: T.sidebarBg,
          borderRight: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, height: '100vh',
          zIndex: 100,
          boxShadow: T.shadow,
          transition: 'background 0.3s, border-color 0.3s',
        }}
        className="admin-sidebar-desktop"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar ── */}
      <>
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
              zIndex: 200, backdropFilter: 'blur(4px)',
            }}
          />
        )}
        <aside
          style={{
            width: SIDEBAR_W,
            background: T.sidebarBg,
            borderRight: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column',
            position: 'fixed', top: 0,
            left: sidebarOpen ? 0 : -SIDEBAR_W,
            height: '100vh', zIndex: 201,
            transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1), background 0.3s',
            boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.15)' : 'none',
          }}
          className="admin-sidebar-mobile"
        >
          <SidebarContent />
        </aside>
      </>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: SIDEBAR_W, minWidth: 0 }}
           className="admin-main-content">

        {/* ── Top Bar ── */}
        <header style={{
          height: 60, padding: '0 24px',
          background: T.topbarBg,
          backdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 14,
          position: 'sticky', top: 0, zIndex: 99,
          boxShadow: T.shadow,
          transition: 'background 0.3s, border-color 0.3s',
        }}>
          {/* Mobile menu button */}
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(true)}
            style={{ background: 'none', border: 'none', color: T.muted, cursor: 'pointer', padding: 6, borderRadius: 8, display: 'none', flexShrink: 0 }}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) router.push(`/admin/orders?q=${encodeURIComponent(searchQuery.trim())}`);
            }}
            style={{ flex: 1, maxWidth: 380, position: 'relative' }}
          >
            <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: T.muted, pointerEvents: 'none' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, products…"
              style={{
                width: '100%', padding: '8px 12px 8px 34px',
                background: isLight ? '#F1F5F9' : 'rgba(51,65,85,0.5)',
                border: `1px solid ${T.border}`,
                borderRadius: 10, color: T.text, fontSize: 13,
                outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#2563EB'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; }}
            />
          </form>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                background: isLight ? '#F1F5F9' : 'rgba(51,65,85,0.5)',
                border: `1px solid ${T.border}`,
                borderRadius: 9, padding: '7px 9px', color: T.muted,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title="Toggle theme"
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} style={{ color: '#FBBF24' }} />}
            </button>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setNotificationsOpen((prev) => !prev); setProfileOpen(false); }}
                style={{
                  background: notificationsOpen ? T.accentBg : (isLight ? '#F1F5F9' : 'rgba(51,65,85,0.5)'),
                  border: `1px solid ${notificationsOpen ? 'rgba(37,99,235,0.35)' : T.border}`,
                  borderRadius: 9, padding: '7px 9px', color: notificationsOpen ? T.accent : T.muted,
                  cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                title="Notifications"
              >
                <Bell size={15} />
                {orderCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 5, right: 5,
                    width: 7, height: 7, background: '#EF4444', borderRadius: '50%',
                    boxShadow: '0 0 6px rgba(239,68,68,0.7)',
                  }} />
                )}
              </button>

              {notificationsOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 340,
                  background: isLight ? '#FFFFFF' : '#1E293B',
                  border: `1px solid ${T.border}`,
                  borderRadius: 14, boxShadow: isLight ? '0 10px 40px rgba(0,0,0,0.12)' : '0 10px 40px rgba(0,0,0,0.5)',
                  zIndex: 1000, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '13px 16px', borderBottom: `1px solid ${T.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Notifications</span>
                      {orderCount > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px',
                          background: T.accentBg, color: T.accent,
                          borderRadius: 20, border: `1px solid rgba(37,99,235,0.25)`,
                        }}>{orderCount} pending</span>
                      )}
                    </div>
                    {orderCount > 0 && (
                      <button onClick={() => setOrderCount(0)} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 11, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                        Clear badge
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {recentOrders.length === 0 ? (
                      <div style={{ padding: '28px 16px', textAlign: 'center', color: T.muted, fontSize: 12 }}>No new notifications</div>
                    ) : (
                      recentOrders.map((ord) => (
                        <div
                          key={ord.id}
                          onClick={() => { setNotificationsOpen(false); router.push('/admin/orders'); }}
                          style={{
                            padding: '11px 16px', borderBottom: `1px solid ${T.border}`,
                            cursor: 'pointer', transition: 'background 0.15s ease',
                            display: 'flex', alignItems: 'flex-start', gap: 11,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = T.hover)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{
                            width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
                            background: ord.fulfillment_status === 'pending' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: ord.fulfillment_status === 'pending' ? '#F59E0B' : '#22C55E',
                          }}>
                            {ord.fulfillment_status === 'pending' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Order {ord.order_number}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>
                                Rs. {ord.total?.toLocaleString('en-LK') || 0}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                              {ord.email || 'Customer'} &bull; {ord.fulfillment_status}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
                    <Link href="/admin/orders" onClick={() => setNotificationsOpen(false)} style={{ fontSize: 12, color: T.accent, textDecoration: 'none', fontWeight: 600 }}>
                      View All Orders →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div
                onClick={() => { setProfileOpen((prev) => !prev); setNotificationsOpen(false); }}
                style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
                  border: profileOpen ? '2px solid #2563EB' : `2px solid ${T.border}`,
                  boxShadow: profileOpen ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
                  transition: 'all 0.2s ease', flexShrink: 0,
                }}
                title="Account Menu"
              >
                {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
              </div>

              {profileOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 240,
                  background: isLight ? '#FFFFFF' : '#1E293B',
                  border: `1px solid ${T.border}`,
                  borderRadius: 14, boxShadow: isLight ? '0 10px 40px rgba(0,0,0,0.12)' : '0 10px 40px rgba(0,0,0,0.5)',
                  zIndex: 1000, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
                    background: isLight ? '#F8FAFC' : 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{user?.full_name || 'Ceylon Times Admin'}</div>
                    <div style={{ fontSize: 11, color: T.muted, marginTop: 2, wordBreak: 'break-all' }}>{user?.email || 'admin@ceylontimes.lk'}</div>
                    <div style={{
                      display: 'inline-block', marginTop: 8, padding: '2px 8px',
                      background: T.accentBg, border: `1px solid rgba(37,99,235,0.25)`,
                      borderRadius: 12, fontSize: 10, fontWeight: 700, color: T.accent,
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>Super Admin</div>
                  </div>

                  <div style={{ padding: '6px 0' }}>
                    {[
                      { href: '/admin/customize', label: 'Site Customizer', icon: Paintbrush },
                      { href: '/admin/settings', label: 'Store Settings', icon: Settings },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
                          color: T.text, fontSize: 13, textDecoration: 'none', transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = T.hover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Icon size={14} style={{ color: T.accent }} />
                        {label}
                      </Link>
                    ))}

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
                        color: T.text, fontSize: 13, textDecoration: 'none', transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = T.hover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Store size={14} style={{ color: T.muted }} />
                      <span style={{ flex: 1 }}>Live Storefront</span>
                      <ExternalLink size={11} style={{ color: T.muted }} />
                    </Link>

                    <div style={{ height: 1, background: T.border, margin: '5px 0' }} />

                    <button
                      onClick={() => { setProfileOpen(false); logout(); router.push('/login'); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
                        width: '100%', background: 'none', border: 'none',
                        color: '#EF4444', fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.07)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main style={{ flex: 1, padding: '28px 28px', overflowY: 'auto', minHeight: 0, transition: 'background 0.3s' }}>
          {children}
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-main-content { margin-left: 0 !important; }
          .admin-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .admin-sidebar-mobile { display: none !important; }
        }
        @media (max-width: 768px) {
          .admin-sidebar-close { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
