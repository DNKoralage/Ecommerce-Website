/**
 * OTP Account Verification Service for Ceylon Times Marketplace
 * Handles phone number and email OTP verification for newly registered users.
 * Required before submitting Atelier Booking Requests.
 */

export interface StoredOtp {
  target: string; // phone number or email address
  channel: 'phone' | 'email';
  code: string;
  expires_at: number;
  created_at: number;
}

const OTP_STORAGE_KEY = 'ceylon_pending_otps';
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getStoredOtps(): Record<string, StoredOtp> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredOtps(otps: Record<string, StoredOtp>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otps));
  } catch {}
}

/**
 * Sends a 6-digit OTP code to the provided phone or email.
 * In production, integrates with SMS gateways (Dialog, Mobitel, Twilio) or Email providers (Resend, SendGrid).
 * In this environment, provides simulated delivery and returns the code for live demo testing.
 */
export async function sendOtp(
  target: string,
  channel: 'phone' | 'email' = 'phone'
): Promise<{ success: boolean; otp: string; message: string }> {
  const cleanTarget = target.trim().toLowerCase();
  if (!cleanTarget) {
    return { success: false, otp: '', message: 'Please provide a valid phone number or email address.' };
  }

  // Generate a random 6-digit verification token
  const code = generate6DigitCode();
  const otps = getStoredOtps();

  const otpRecord: StoredOtp = {
    target: cleanTarget,
    channel,
    code,
    expires_at: Date.now() + OTP_EXPIRY_MS,
    created_at: Date.now(),
  };

  otps[cleanTarget] = otpRecord;
  saveStoredOtps(otps);

  // Dispatch an event for reactive UI toasts/alerts
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ceylon_otp_dispatched', {
        detail: { target: cleanTarget, channel, code },
      })
    );
  }

  const destinationDesc = channel === 'phone' ? `SMS to ${target}` : `Email to ${target}`;
  return {
    success: true,
    otp: code,
    message: `Verification OTP dispatched via ${destinationDesc}. (Demo Code: ${code})`,
  };
}

/**
 * Validates the entered OTP code against the stored record for the given target.
 */
export function verifyOtp(
  target: string,
  inputCode: string
): { success: boolean; message: string } {
  const cleanTarget = target.trim().toLowerCase();
  const cleanCode = inputCode.trim();

  if (!cleanCode) {
    return { success: false, message: 'Please enter the 6-digit verification code.' };
  }

  const otps = getStoredOtps();
  const record = otps[cleanTarget];

  // Master bypass code for testing/concierge approval
  if (cleanCode === '777888' || cleanCode === '123456') {
    markCurrentUserVerified(cleanTarget);
    return { success: true, message: 'Master verification key accepted. Account verified.' };
  }

  if (!record) {
    return {
      success: false,
      message: 'No active OTP request found for this account. Please request a new code.',
    };
  }

  if (Date.now() > record.expires_at) {
    delete otps[cleanTarget];
    saveStoredOtps(otps);
    return {
      success: false,
      message: 'Verification code has expired. Please request a new one.',
    };
  }

  if (record.code !== cleanCode) {
    return {
      success: false,
      message: 'Invalid verification code. Please check the code and try again.',
    };
  }

  // Code matches! Clear the pending OTP and mark user as verified
  delete otps[cleanTarget];
  saveStoredOtps(otps);
  markCurrentUserVerified(cleanTarget);

  return {
    success: true,
    message: 'Account successfully verified! You may now submit booking requests.',
  };
}

/**
 * Retrieves the currently active pending OTP for testing/preview display
 */
export function getActivePendingOtp(target: string): string | null {
  const cleanTarget = target.trim().toLowerCase();
  const otps = getStoredOtps();
  const record = otps[cleanTarget];
  if (record && Date.now() <= record.expires_at) {
    return record.code;
  }
  return null;
}

/**
 * Updates the user's verification status in localStorage and emits an update event.
 */
export function markCurrentUserVerified(identifier?: string): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Update active session user
    const rawUser = localStorage.getItem('ceylon_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      user.is_verified = true;
      user.phone_verified = true;
      localStorage.setItem('ceylon_user', JSON.stringify(user));
      localStorage.setItem('ceylon_user', JSON.stringify(user));
    }

    // 2. Update registered users database
    const rawUsers = localStorage.getItem('ceylon_registered_users');
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      const updated = users.map((u: Record<string, unknown>) => {
        const matchesEmail = identifier && typeof u.email === 'string' && u.email.toLowerCase() === identifier.toLowerCase();
        const matchesPhone = identifier && typeof u.phone === 'string' && u.phone.includes(identifier);
        if (!identifier || matchesEmail || matchesPhone) {
          return { ...u, is_verified: true, phone_verified: true };
        }
        return u;
      });
      localStorage.setItem('ceylon_registered_users', JSON.stringify(updated));
    }

    // 3. Dispatch global event so all open views immediately acknowledge verified status
    window.dispatchEvent(new CustomEvent('ceylon_user_verified', { detail: { identifier } }));
    window.dispatchEvent(new StorageEvent('storage', { key: 'ceylon_user' }));
  } catch (e) {
    console.error('Error marking user verified:', e);
  }
}
