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
  User,
  ExternalLink,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { api } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Tag },
  { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Customize', href: '/admin/customize', icon: Paintbrush },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      if (user) {
        router.replace('/account');
      } else {
        router.replace('/login?redirect=' + encodeURIComponent(pathname));
      }
    }
  }, [isLoading, isAdmin, user, pathname, router]);

  useEffect(() => {
    api.getOrders().then((orders) => {
      const pending = orders.filter((o) => o.fulfillment_status === 'pending').length;
      setOrderCount(pending);
      setRecentOrders(orders.slice(0, 5));
    });
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0A0A0F', color: '#FFD700', fontFamily: "'Cinzel', serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, letterSpacing: '0.2em', marginBottom: 12 }}>CEYLON TIMES</div>
          <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#9A9490', fontFamily: "'Inter', sans-serif" }}>VERIFYING SOVEREIGN ACCESS...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0F', color: '#E8E6E1', fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: 'linear-gradient(180deg, #111118 0%, #0D0D14 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? 0 : -260,
          height: '100vh',
          zIndex: 1000,
          transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
        className="admin-sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-white.png" alt="Ceylon Times" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: '#FFD700', fontFamily: 'var(--font-cinzel)' }}>CEYLON TIMES</div>
              <div style={{ fontSize: 10, color: '#00FFFF', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-rajdhani)' }}>Master Control</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10, marginBottom: 4,
                  background: isActive ? 'rgba(201,169,110,0.12)' : 'transparent',
                  color: isActive ? '#C9A96E' : '#9A9490',
                  textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s',
                  border: isActive ? '1px solid rgba(201,169,110,0.2)' : '1px solid transparent',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = '#E8E6E1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#9A9490';
                  }
                }}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.label === 'Orders' && orderCount > 0 && (
                  <span style={{
                    background: '#C9A96E', color: '#0A0A0F',
                    borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700,
                  }}>{orderCount}</span>
                )}
                {isActive && <ChevronRight size={14} style={{ opacity: 0.6 }} />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href="/"
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              color: '#9A9490', textDecoration: 'none', fontSize: 13,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#E8E6E1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9490'; }}
          >
            <Store size={16} />
            <span>View Storefront</span>
          </Link>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10, width: '100%',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9A9490', fontSize: 13, textAlign: 'left',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#FF2D55'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#9A9490'; }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 999, backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Main */}
      <div className="admin-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 260 }}>
        {/* Top bar */}
        <header style={{
          height: 64, padding: '0 28px',
          background: 'rgba(13,13,20,0.9)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 16,
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <button
            className="admin-menu-btn"
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none', border: 'none', color: '#9A9490', cursor: 'pointer',
              padding: 6, borderRadius: 8, display: 'none',
            }}
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/admin/orders?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            style={{ flex: 1, maxWidth: 400, position: 'relative' }}
          >
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6B6760' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, products... (Press Enter)"
              style={{
                width: '100%', padding: '8px 12px 8px 38px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, color: '#E8E6E1', fontSize: 13,
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'rgba(201,169,110,0.4)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
          </form>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification Bell Dropdown */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                style={{
                  background: notificationsOpen ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.04)',
                  border: notificationsOpen ? '1px solid rgba(201,169,110,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '7px 10px', color: notificationsOpen ? '#C9A96E' : '#9A9490',
                  cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
                title="Notifications"
              >
                <Bell size={16} />
                {orderCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 7, height: 7, background: '#C9A96E', borderRadius: '50%',
                    boxShadow: '0 0 8px #C9A96E',
                  }} />
                )}
              </button>

              {notificationsOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 340,
                  background: '#111118', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  zIndex: 1000, overflow: 'hidden', animation: 'fadeIn 0.15s ease-out',
                }}>
                  <div style={{
                    padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#E8E6E1' }}>Notifications</span>
                      {orderCount > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px',
                          background: 'rgba(201,169,110,0.15)', color: '#C9A96E',
                          borderRadius: 20, border: '1px solid rgba(201,169,110,0.3)',
                        }}>
                          {orderCount} pending
                        </span>
                      )}
                    </div>
                    {orderCount > 0 && (
                      <button
                        onClick={() => setOrderCount(0)}
                        style={{
                          background: 'none', border: 'none', color: '#6B6760', fontSize: 11,
                          cursor: 'pointer', textDecoration: 'underline', padding: 0,
                        }}
                      >
                        Clear badge
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                    {recentOrders.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B6760', fontSize: 12 }}>
                        No new notifications
                      </div>
                    ) : (
                      recentOrders.map((ord) => (
                        <div
                          key={ord.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            router.push('/admin/orders');
                          }}
                          style={{
                            padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.03)',
                            cursor: 'pointer', transition: 'background 0.15s ease',
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                          <div style={{
                            width: 30, height: 30, borderRadius: 8,
                            background: ord.fulfillment_status === 'pending' ? 'rgba(201,169,110,0.1)' : 'rgba(74,222,128,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: ord.fulfillment_status === 'pending' ? '#C9A96E' : '#4ADE80',
                            flexShrink: 0, marginTop: 2,
                          }}>
                            {ord.fulfillment_status === 'pending' ? <Clock size={15} /> : <CheckCircle2 size={15} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                              <span style={{ fontSize: 12, fontWeight: 600, color: '#E8E6E1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Order {ord.order_number}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#C9A96E' }}>
                                ₹{ord.total?.toLocaleString('en-IN') || 0}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: '#9A9490', marginTop: 2 }}>
                              {ord.email || 'Customer Order'} &bull; {ord.fulfillment_status}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{
                    padding: '10px 16px', background: 'rgba(255,255,255,0.02)',
                    borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center',
                  }}>
                    <Link
                      href="/admin/orders"
                      onClick={() => setNotificationsOpen(false)}
                      style={{ fontSize: 12, color: '#C9A96E', textDecoration: 'none', fontWeight: 600 }}
                    >
                      View All Orders &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <div
                onClick={() => {
                  setProfileOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C9A96E, #8B6914)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: '#0A0A0F', cursor: 'pointer',
                  border: profileOpen ? '2px solid #E8E6E1' : '2px solid transparent',
                  boxShadow: profileOpen ? '0 0 12px rgba(201,169,110,0.5)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                title="Account Menu"
              >
                {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
              </div>

              {profileOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)', width: 250,
                  background: '#111118', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  zIndex: 1000, overflow: 'hidden', animation: 'fadeIn 0.15s ease-out',
                }}>
                  {/* User Profile Info */}
                  <div style={{
                    padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#E8E6E1' }}>
                      {user?.full_name || 'Ceylon Times Admin'}
                    </div>
                    <div style={{ fontSize: 11, color: '#9A9490', marginTop: 2, wordBreak: 'break-all' }}>
                      {user?.email || 'admin@ceylontimes.lk'}
                    </div>
                    <div style={{
                      display: 'inline-block', marginTop: 8, padding: '2px 8px',
                      background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)',
                      borderRadius: 12, fontSize: 10, fontWeight: 700, color: '#C9A96E',
                      letterSpacing: '0.05em', textTransform: 'uppercase',
                    }}>
                      Super Admin
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div style={{ padding: '8px 0' }}>
                    <Link
                      href="/admin/customize"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        color: '#E8E6E1', fontSize: 13, textDecoration: 'none', transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Paintbrush size={15} color="#C9A96E" />
                      <span>Site Customizer</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        color: '#E8E6E1', fontSize: 13, textDecoration: 'none', transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Settings size={15} color="#9A9490" />
                      <span>Store Settings</span>
                    </Link>

                    <Link
                      href="/"
                      target="_blank"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        color: '#E8E6E1', fontSize: 13, textDecoration: 'none', transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Store size={15} color="#9A9490" />
                      <span style={{ flex: 1 }}>Live Storefront</span>
                      <ExternalLink size={12} color="#6B6760" />
                    </Link>

                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />

                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        router.push('/login');
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
                        width: '100%', background: 'none', border: 'none',
                        color: '#F87171', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { left: -260px !important; }
          .admin-sidebar.open { left: 0 !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .admin-sidebar { left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
