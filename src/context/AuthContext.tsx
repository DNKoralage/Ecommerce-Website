'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types';

export interface SignUpData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisteredUser extends Profile {
  password_hash: string;
}

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; message?: string }>;
  loginDemo: (role?: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ADMIN: Profile = {
  id: 'usr-admin-1',
  email: 'admin@ceylontimes.lk',
  full_name: 'Ceylon Times Administrator',
  phone: '+94 11 234 5678',
  avatar_url: '/logo.png',
  role: 'admin',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const DEMO_CUSTOMER: Profile = {
  id: 'usr-cust-1',
  email: 'patron@ceylontimes.lk',
  full_name: 'Ceylon Patron',
  phone: '+94 77 123 4567',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  role: 'customer',
  created_at: '2024-02-10T00:00:00Z',
  updated_at: '2024-02-10T00:00:00Z',
};

const USERS_STORAGE_KEY = 'ceylon_registered_users';

function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: RegisteredUser[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ceylon_user') || localStorage.getItem('luxe_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Regular/anonymous visitors have NO admin session by default, keeping the Admin option strictly private
        setUser(null);
      }
    } catch (_e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const trimmed = email.trim().toLowerCase();
    const pass = (password || '').trim();

    // ── ADMIN CREDENTIALS ──────────────────────────────────────────────────────
    // Requires BOTH a recognised admin email AND a valid passphrase.
    // Do not relax these checks — they are the sole access gate for the dashboard.
    const ADMIN_EMAILS = new Set([
      'admin@ceylontimes.lk',
      'admin@ceylon-times.lk',
      'director@ceylontimes.lk',
    ]);
    const ADMIN_PASSWORDS = new Set([
      'admin123',
      'ceylon123',
      'ceylontimes2024',
    ]);

    const emailIsAdmin = ADMIN_EMAILS.has(trimmed);
    const passIsAdmin  = ADMIN_PASSWORDS.has(pass);

    if (emailIsAdmin && passIsAdmin) {
      const adminUser: Profile = {
        ...DEMO_ADMIN,
        email: trimmed,
        role: 'admin',
      };
      setUser(adminUser);
      try {
        localStorage.setItem('ceylon_user', JSON.stringify(adminUser));
        localStorage.setItem('luxe_user', JSON.stringify(adminUser));
      } catch (_e) {}
      return { success: true };
    }

    // Wrong credentials for an admin e-mail → reject immediately
    if (emailIsAdmin && !passIsAdmin) {
      return { success: false, message: 'Invalid passphrase. Access denied.' };
    }

    // ── REGULAR PATRON LOGIN ───────────────────────────────────────────────────
    if (!trimmed.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Check user database
    const users = getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === trimmed);

    if (existing) {
      if (pass && existing.password_hash !== pass) {
        return { success: false, message: 'Invalid password. Please check your credentials.' };
      }
      const customerProfile: Profile = {
        id: existing.id,
        email: existing.email,
        full_name: existing.full_name,
        phone: existing.phone,
        avatar_url: existing.avatar_url,
        role: 'customer', // strictly customer
        created_at: existing.created_at,
        updated_at: existing.updated_at,
      };
      setUser(customerProfile);
      try {
        localStorage.setItem('ceylon_user', JSON.stringify(customerProfile));
        localStorage.setItem('luxe_user', JSON.stringify(customerProfile));
      } catch (_e) {}
      return { success: true };
    }

    // Demo customer fallback or quick visitor patron sign-in
    const customerUser: Profile = {
      ...DEMO_CUSTOMER,
      id: `usr-cust-${Date.now()}`,
      email: trimmed,
      full_name: trimmed.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: 'customer', // strictly customer
    };
    setUser(customerUser);
    try {
      localStorage.setItem('ceylon_user', JSON.stringify(customerUser));
      localStorage.setItem('luxe_user', JSON.stringify(customerUser));
    } catch (_e) {}
    return { success: true };
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; message?: string }> => {
    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedPass = data.password.trim();
    const fullName = data.full_name.trim();

    if (!fullName) {
      return { success: false, message: 'Please enter your full name.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    if (trimmedPass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    const ADMIN_EMAILS = new Set([
      'admin@ceylontimes.lk',
      'admin@ceylon-times.lk',
      'director@ceylontimes.lk',
    ]);
    if (ADMIN_EMAILS.has(trimmedEmail)) {
      return { success: false, message: 'This email is reserved for system administrators.' };
    }

    const users = getRegisteredUsers();
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    const now = new Date().toISOString();
    const newCustomer: RegisteredUser = {
      id: `usr-patron-${Date.now()}`,
      email: trimmedEmail,
      full_name: fullName,
      phone: data.phone?.trim() || null,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'customer', // Normal user is always customer, completely separated from admin
      password_hash: trimmedPass,
      created_at: now,
      updated_at: now,
    };

    const updatedUsers = [newCustomer, ...users];
    saveRegisteredUsers(updatedUsers);

    const activeProfile: Profile = {
      id: newCustomer.id,
      email: newCustomer.email,
      full_name: newCustomer.full_name,
      phone: newCustomer.phone,
      avatar_url: newCustomer.avatar_url,
      role: 'customer',
      created_at: newCustomer.created_at,
      updated_at: newCustomer.updated_at,
    };

    setUser(activeProfile);
    try {
      localStorage.setItem('ceylon_user', JSON.stringify(activeProfile));
      localStorage.setItem('luxe_user', JSON.stringify(activeProfile));
    } catch (_e) {}

    return { success: true };
  };

  const loginDemo = (role: UserRole = 'admin') => {
    const targetUser = role === 'admin' ? DEMO_ADMIN : DEMO_CUSTOMER;
    setUser(targetUser);
    try {
      localStorage.setItem('ceylon_user', JSON.stringify(targetUser));
      localStorage.setItem('luxe_user', JSON.stringify(targetUser));
    } catch (_e) {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('ceylon_user');
      localStorage.removeItem('luxe_user');
    } catch (_e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'customer',
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        signUp,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
