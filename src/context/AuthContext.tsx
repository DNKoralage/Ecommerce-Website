'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile, UserRole } from '@/types';
import { sendOtp, verifyOtp } from '@/lib/otp';

export interface SignUpData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisteredUser extends Profile {
  password_hash: string;
}

export interface SecondaryAdminAccount {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  password_hash: string;
  role: 'admin';
  is_primary_admin: false;
  is_verified: true;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isAdmin: boolean;
  isPrimaryAdmin: boolean;
  isVerified: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; message?: string }>;
  loginDemo: (role?: UserRole) => void;
  logout: () => void;
  requestOtp: (channel?: 'phone' | 'email') => Promise<{ success: boolean; otp?: string; message: string }>;
  verifyOtpCode: (code: string) => Promise<{ success: boolean; message: string }>;
  createSecondaryAdmin: (data: { full_name: string; email: string; phone?: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  getSecondaryAdmins: () => SecondaryAdminAccount[];
  deleteSecondaryAdmin: (adminId: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ADMIN: Profile = {
  id: 'usr-admin-1',
  email: 'admin@ceylontimes.lk',
  full_name: 'Ceylon Times Administrator',
  phone: '+94 11 234 5678',
  avatar_url: '/logo.png',
  role: 'admin',
  is_verified: true,
  phone_verified: true,
  is_primary_admin: true,
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
  is_verified: false, // Required to verify via OTP for booking requests
  phone_verified: false,
  is_primary_admin: false,
  created_at: '2024-02-10T00:00:00Z',
  updated_at: '2024-02-10T00:00:00Z',
};

const USERS_STORAGE_KEY = 'ceylon_registered_users';
const SECONDARY_ADMINS_KEY = 'ceylon_secondary_admins';

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

function getStoredSecondaryAdmins(): SecondaryAdminAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SECONDARY_ADMINS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredSecondaryAdmins(admins: SecondaryAdminAccount[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SECONDARY_ADMINS_KEY, JSON.stringify(admins));
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session state from localStorage
  const refreshUserFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('ceylon_user') || localStorage.getItem('luxe_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch (_e) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUserFromStorage();
    setIsLoading(false);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ceylon_user' || e.key === 'luxe_user') {
        refreshUserFromStorage();
      }
    };
    const handleUserVerified = () => {
      refreshUserFromStorage();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ceylon_user_verified', handleUserVerified);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ceylon_user_verified', handleUserVerified);
    };
  }, [refreshUserFromStorage]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    const trimmed = email.trim().toLowerCase();
    const pass = (password || '').trim();

    // ── PRIMARY ADMIN CREDENTIALS ──────────────────────────────────────────────
    const PRIMARY_ADMIN_EMAILS = new Set([
      'admin@ceylontimes.lk',
      'admin@ceylon-times.lk',
      'director@ceylontimes.lk',
    ]);
    const PRIMARY_ADMIN_PASSWORDS = new Set([
      'admin123',
      'ceylon123',
      'ceylontimes2024',
    ]);

    const emailIsPrimaryAdmin = PRIMARY_ADMIN_EMAILS.has(trimmed);
    const passIsPrimaryAdmin = PRIMARY_ADMIN_PASSWORDS.has(pass);

    if (emailIsPrimaryAdmin && passIsPrimaryAdmin) {
      const adminUser: Profile = {
        ...DEMO_ADMIN,
        email: trimmed,
        role: 'admin',
        is_primary_admin: true,
        is_verified: true,
      };
      setUser(adminUser);
      try {
        localStorage.setItem('ceylon_user', JSON.stringify(adminUser));
        localStorage.setItem('luxe_user', JSON.stringify(adminUser));
      } catch (_e) {}
      return { success: true };
    }

    if (emailIsPrimaryAdmin && !passIsPrimaryAdmin) {
      return { success: false, message: 'Invalid administrator passphrase. Access denied.' };
    }

    // ── SECONDARY ADMINISTRATORS ───────────────────────────────────────────────
    const secondaryAdmins = getStoredSecondaryAdmins();
    const matchedSecondary = secondaryAdmins.find((a) => a.email.toLowerCase() === trimmed);
    if (matchedSecondary) {
      if (matchedSecondary.password_hash !== pass) {
        return { success: false, message: 'Invalid administrator password. Access denied.' };
      }
      const secAdminUser: Profile = {
        id: matchedSecondary.id,
        email: matchedSecondary.email,
        full_name: matchedSecondary.full_name,
        phone: matchedSecondary.phone,
        avatar_url: '/logo.png',
        role: 'admin',
        is_primary_admin: false,
        is_verified: true,
        phone_verified: true,
        created_at: matchedSecondary.created_at,
        updated_at: matchedSecondary.updated_at,
      };
      setUser(secAdminUser);
      try {
        localStorage.setItem('ceylon_user', JSON.stringify(secAdminUser));
        localStorage.setItem('luxe_user', JSON.stringify(secAdminUser));
      } catch (_e) {}
      return { success: true };
    }

    // ── REGULAR PATRON LOGIN ───────────────────────────────────────────────────
    if (!trimmed.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

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
        role: 'customer',
        is_verified: Boolean(existing.is_verified),
        phone_verified: Boolean(existing.phone_verified),
        is_primary_admin: false,
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

    // Quick visitor sign-in fallback
    const customerUser: Profile = {
      ...DEMO_CUSTOMER,
      id: `usr-cust-${Date.now()}`,
      email: trimmed,
      full_name: trimmed.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: 'customer',
      is_verified: false,
      is_primary_admin: false,
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

    const PRIMARY_ADMIN_EMAILS = new Set([
      'admin@ceylontimes.lk',
      'admin@ceylon-times.lk',
      'director@ceylontimes.lk',
    ]);
    if (PRIMARY_ADMIN_EMAILS.has(trimmedEmail)) {
      return { success: false, message: 'This email is reserved for system administrators.' };
    }

    const users = getRegisteredUsers();
    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'An account with this email already exists. Please sign in.' };
    }

    const now = new Date().toISOString();
    // New registered patron is unverified by default; requires OTP verification for bookings
    const newCustomer: RegisteredUser = {
      id: `usr-patron-${Date.now()}`,
      email: trimmedEmail,
      full_name: fullName,
      phone: data.phone?.trim() || null,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'customer',
      is_verified: false,
      phone_verified: false,
      is_primary_admin: false,
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
      is_verified: false,
      phone_verified: false,
      is_primary_admin: false,
      created_at: newCustomer.created_at,
      updated_at: newCustomer.updated_at,
    };

    setUser(activeProfile);
    try {
      localStorage.setItem('ceylon_user', JSON.stringify(activeProfile));
      localStorage.setItem('luxe_user', JSON.stringify(activeProfile));
    } catch (_e) {}

    // Automatically trigger OTP dispatch for newly created account
    const target = activeProfile.phone || activeProfile.email;
    const channel = activeProfile.phone ? 'phone' : 'email';
    sendOtp(target, channel).catch(() => {});

    return { success: true };
  };

  const requestOtp = async (channel: 'phone' | 'email' = 'phone'): Promise<{ success: boolean; otp?: string; message: string }> => {
    if (!user) {
      return { success: false, message: 'Please sign in or register before requesting OTP.' };
    }
    const target = channel === 'phone' ? (user.phone || user.email) : user.email;
    const effectiveChannel = channel === 'phone' && !user.phone ? 'email' : channel;
    const res = await sendOtp(target, effectiveChannel);
    return res;
  };

  const verifyOtpCode = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      return { success: false, message: 'Please sign in to verify your account.' };
    }
    const target = user.phone || user.email;
    const res = verifyOtp(target, code);
    if (res.success) {
      const updatedUser: Profile = {
        ...user,
        is_verified: true,
        phone_verified: true,
      };
      setUser(updatedUser);
      try {
        localStorage.setItem('ceylon_user', JSON.stringify(updatedUser));
        localStorage.setItem('luxe_user', JSON.stringify(updatedUser));
      } catch (_e) {}
    }
    return res;
  };

  // ── SECONDARY ADMIN MANAGEMENT ───────────────────────────────────────────────
  const createSecondaryAdmin = async (data: {
    full_name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Only administrators can create secondary admin accounts.' };
    }

    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedPass = data.password.trim();
    const fullName = data.full_name.trim();

    if (!fullName) return { success: false, message: 'Administrator full name is required.' };
    if (!trimmedEmail || !trimmedEmail.includes('@')) return { success: false, message: 'Valid administrator email is required.' };
    if (trimmedPass.length < 6) return { success: false, message: 'Password must be at least 6 characters.' };

    const admins = getStoredSecondaryAdmins();
    if (admins.some((a) => a.email.toLowerCase() === trimmedEmail) || trimmedEmail === DEMO_ADMIN.email.toLowerCase()) {
      return { success: false, message: 'An administrator account with this email already exists.' };
    }

    const now = new Date().toISOString();
    const newAdmin: SecondaryAdminAccount = {
      id: `admin-sec-${Date.now()}`,
      email: trimmedEmail,
      full_name: fullName,
      phone: data.phone?.trim() || null,
      password_hash: trimmedPass,
      role: 'admin',
      is_primary_admin: false,
      is_verified: true,
      created_at: now,
      updated_at: now,
    };

    const updated = [newAdmin, ...admins];
    saveStoredSecondaryAdmins(updated);

    // Dispatch event so team view reacts immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ceylon_admins_updated'));
    }

    return { success: true, message: `Secondary administrator account for ${fullName} created with full site maintenance access.` };
  };

  const getSecondaryAdmins = (): SecondaryAdminAccount[] => {
    return getStoredSecondaryAdmins();
  };

  const deleteSecondaryAdmin = async (adminId: string): Promise<{ success: boolean; message?: string }> => {
    if (!user || user.role !== 'admin') {
      return { success: false, message: 'Unauthorized. Only administrators can manage team accounts.' };
    }

    const admins = getStoredSecondaryAdmins();
    const target = admins.find((a) => a.id === adminId);
    if (!target) {
      return { success: false, message: 'Administrator account not found.' };
    }

    const filtered = admins.filter((a) => a.id !== adminId);
    saveStoredSecondaryAdmins(filtered);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ceylon_admins_updated'));
    }

    return { success: true, message: `Administrator access revoked for ${target.full_name}.` };
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
        isPrimaryAdmin: Boolean(user?.is_primary_admin ?? (user?.role === 'admin' && user?.email === DEMO_ADMIN.email)),
        isVerified: Boolean(user?.is_verified || user?.role === 'admin'),
        isLoading,
        login,
        signUp,
        loginDemo,
        logout,
        requestOtp,
        verifyOtpCode,
        createSecondaryAdmin,
        getSecondaryAdmins,
        deleteSecondaryAdmin,
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
