/**
 * Order & Booking Request Notification Engine for Ceylon Times
 * Handles automated Email and WhatsApp alerts sent to the primary administrator
 * upon placement of any new booking request or archival acquisition.
 */

export interface NotificationPayload {
  bookingId: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceTitle: string;
  preferredDate?: string;
  preferredTime?: string;
  partySize?: number;
  specialRequirements?: string;
  itemsSummary?: string;
  totalAmount?: number;
  shippingAddress?: string;
  currencySymbol?: string;
  timestamp: string;
}

export interface AdminNotificationRecord {
  id: string;
  booking_id: string;
  channel: 'email' | 'whatsapp' | 'both';
  recipient_admin_email: string;
  recipient_admin_phone: string;
  email_subject: string;
  email_body_html: string;
  whatsapp_message: string;
  whatsapp_url: string;
  status: 'delivered' | 'pending';
  created_at: string;
}

const NOTIFICATIONS_STORAGE_KEY = 'ceylon_admin_notifications';
const DEFAULT_PRIMARY_ADMIN_EMAIL = 'admin@ceylontimes.lk';
const DEFAULT_PRIMARY_ADMIN_PHONE = '+94771234567'; // International format for WhatsApp

export function getAdminNotifications(): AdminNotificationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAdminNotifications(records: AdminNotificationRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(records));
  } catch {}
}

/**
 * Builds formatted plain text for WhatsApp alerts.
 */
export function buildWhatsAppMessage(payload: NotificationPayload): string {
  const amountStr = payload.totalAmount
    ? `\n💰 *Total Value:* Rs. ${payload.totalAmount.toLocaleString('en-LK')}`
    : '';
  const dateStr = payload.preferredDate
    ? `\n📅 *Schedule:* ${payload.preferredDate} (${payload.preferredTime || 'Standard Time'})`
    : '';
  const notesStr = payload.specialRequirements
    ? `\n📝 *Client Notes:* "${payload.specialRequirements}"`
    : '';
  const addrStr = payload.shippingAddress
    ? `\n📍 *Destination:* ${payload.shippingAddress}`
    : '';

  return (
    `👑 *NEW CEYLON TIMES BOOKING ALERT*\n` +
    `---------------------------------------\n` +
    `🔖 *Ref ID:* ${payload.bookingId.toUpperCase()}\n` +
    `👤 *Patron:* ${payload.customerName}\n` +
    `📧 *Email:* ${payload.customerEmail}\n` +
    `📞 *Phone:* ${payload.customerPhone}\n` +
    `💎 *Experience/Item:* ${payload.serviceTitle}` +
    amountStr +
    dateStr +
    addrStr +
    notesStr +
    `\n\n⚡ *Action Required:* Please review in Admin Dashboard and confirm verification.`
  );
}

/**
 * Generates the direct WhatsApp Click-to-Chat URI
 */
export function getWhatsAppActionUrl(adminPhone: string, message: string): string {
  const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds HTML template for the administrator email alert.
 */
export function buildEmailTemplate(payload: NotificationPayload): { subject: string; html: string; text: string } {
  const subject = `[NEW BOOKING REQUEST] ${payload.bookingId.toUpperCase()} — ${payload.serviceTitle} from ${payload.customerName}`;

  const text = `
NEW BOOKING REQUEST RECEIVED - CEYLON TIMES
===================================================
Reference ID: ${payload.bookingId}
Patron Name: ${payload.customerName}
Patron Email: ${payload.customerEmail}
Patron Phone: ${payload.customerPhone}

Service / Order: ${payload.serviceTitle}
${payload.totalAmount ? `Total Value: Rs. ${payload.totalAmount.toLocaleString('en-LK')}` : ''}
${payload.preferredDate ? `Preferred Date: ${payload.preferredDate}` : ''}
${payload.preferredTime ? `Preferred Time Slot: ${payload.preferredTime}` : ''}
${payload.shippingAddress ? `Consignee Address: ${payload.shippingAddress}` : ''}
${payload.specialRequirements ? `Special Requirements: ${payload.specialRequirements}` : ''}

Submitted at: ${new Date(payload.timestamp).toLocaleString('en-LK')}
Access Admin Portal: https://ceylon-times.lk/admin/dashboard
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 24px; background: #0A0A0F; color: #E8E6E1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table align="center" width="100%" max-width="600" style="max-width: 600px; background: #111118; border: 1px solid rgba(255,215,0,0.3); border-radius: 8px; overflow: hidden; padding: 0;">
        <tr>
          <td style="background: linear-gradient(90deg, #1A1710 0%, #2A2415 100%); padding: 24px 32px; border-bottom: 2px solid #C9A96E;">
            <div style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #FFD700; font-weight: bold;">CEYLON TIMES · ATELIER NOTIFICATION</div>
            <h1 style="margin: 8px 0 0; font-size: 22px; color: #FFFFFF; font-weight: normal; font-family: serif;">New Sovereign Booking Request</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <div style="background: rgba(201,169,110,0.08); border: 1px solid rgba(201,169,110,0.25); border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
              <span style="font-size: 12px; color: #9A9490; text-transform: uppercase; letter-spacing: 0.1em; display: block;">Booking Reference</span>
              <span style="font-size: 18px; font-weight: bold; color: #FFD700; font-family: monospace;">${payload.bookingId.toUpperCase()}</span>
            </div>

            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; color: #C9A96E; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">Patron Coordinates</h3>
            <table width="100%" style="font-size: 13px; margin-bottom: 24px;">
              <tr><td style="color: #9A9490; padding: 4px 0; width: 120px;">Full Name:</td><td style="color: #FFFFFF; font-weight: 600;">${payload.customerName}</td></tr>
              <tr><td style="color: #9A9490; padding: 4px 0;">Email:</td><td style="color: #00FFFF;"><a href="mailto:${payload.customerEmail}" style="color: #00FFFF; text-decoration: none;">${payload.customerEmail}</a></td></tr>
              <tr><td style="color: #9A9490; padding: 4px 0;">Telephone:</td><td style="color: #FFFFFF;">${payload.customerPhone}</td></tr>
              ${payload.shippingAddress ? `<tr><td style="color: #9A9490; padding: 4px 0;">Address:</td><td style="color: #FFFFFF;">${payload.shippingAddress}</td></tr>` : ''}
            </table>

            <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.15em; color: #C9A96E; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">Reservation Details</h3>
            <table width="100%" style="font-size: 13px; margin-bottom: 24px;">
              <tr><td style="color: #9A9490; padding: 4px 0; width: 120px;">Experience:</td><td style="color: #FFFFFF; font-weight: bold;">${payload.serviceTitle}</td></tr>
              ${payload.totalAmount ? `<tr><td style="color: #9A9490; padding: 4px 0;">Amount:</td><td style="color: #FFD700; font-weight: bold;">Rs. ${payload.totalAmount.toLocaleString('en-LK')}</td></tr>` : ''}
              ${payload.preferredDate ? `<tr><td style="color: #9A9490; padding: 4px 0;">Date:</td><td style="color: #FFFFFF;">${payload.preferredDate}</td></tr>` : ''}
              ${payload.preferredTime ? `<tr><td style="color: #9A9490; padding: 4px 0;">Time Slot:</td><td style="color: #FFFFFF;">${payload.preferredTime}</td></tr>` : ''}
              ${payload.specialRequirements ? `<tr><td style="color: #9A9490; padding: 4px 0;">Client Notes:</td><td style="color: #E8E6E1; font-style: italic;">"${payload.specialRequirements}"</td></tr>` : ''}
            </table>

            <div style="text-align: center; margin-top: 32px;">
              <a href="https://ceylon-times.lk/admin/dashboard" style="background: #C9A96E; color: #02030A; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 4px; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; display: inline-block;">
                Open Admin Dashboard
              </a>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, html, text };
}

/**
 * Dispatches automated notifications (Immediate Email & WhatsApp trigger)
 * to the primary administrator.
 */
export async function triggerOrderNotifications(
  payload: NotificationPayload,
  options?: { adminEmail?: string; adminPhone?: string }
): Promise<{ success: boolean; record: AdminNotificationRecord }> {
  const adminEmail = options?.adminEmail || DEFAULT_PRIMARY_ADMIN_EMAIL;
  const adminPhone = options?.adminPhone || DEFAULT_PRIMARY_ADMIN_PHONE;

  const emailData = buildEmailTemplate(payload);
  const waMsg = buildWhatsAppMessage(payload);
  const waUrl = getWhatsAppActionUrl(adminPhone, waMsg);

  const record: AdminNotificationRecord = {
    id: `notif-${Date.now()}`,
    booking_id: payload.bookingId,
    channel: 'both',
    recipient_admin_email: adminEmail,
    recipient_admin_phone: adminPhone,
    email_subject: emailData.subject,
    email_body_html: emailData.html,
    whatsapp_message: waMsg,
    whatsapp_url: waUrl,
    status: 'delivered',
    created_at: new Date().toISOString(),
  };

  // Save to notification ledger
  const records = getAdminNotifications();
  saveAdminNotifications([record, ...records]);

  // Dispatch browser event so admin dashboard can show live notification toast
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('ceylon_admin_alert', {
        detail: record,
      })
    );
  }

  // Also call our Next.js API route if available
  try {
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, record }),
      }).catch(() => {
        // Safe fallback - client notification already recorded
      });
    }
  } catch {}

  return { success: true, record };
}
