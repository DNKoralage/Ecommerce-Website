import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/send-otp
 * Sends a 6-digit OTP code via email using Resend.
 * Body: { target: string, channel: 'email' | 'phone', code: string, name?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { target, channel, code, name } = await req.json();

    if (!target || !code) {
      return NextResponse.json({ success: false, error: 'Missing target or code' }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    // ── EMAIL via Resend ────────────────────────────────────────────────────────
    if (channel === 'email') {
      if (!RESEND_API_KEY || RESEND_API_KEY === 'your-resend-api-key') {
        // Resend not configured — fall back gracefully (code is shown in UI)
        console.warn('[OTP] RESEND_API_KEY not set — email not sent');
        return NextResponse.json({ success: true, delivered: false, reason: 'resend_not_configured' });
      }

      const displayName = name || 'Valued Customer';
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Ceylon Times — Verify Your Account</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;border:1px solid #E2E8F0;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0F172A 0%,#1E293B 100%);padding:32px 40px;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:-0.02em;">Ceylon Times</div>
            <div style="font-size:11px;color:#94A3B8;letter-spacing:0.15em;text-transform:uppercase;margin-top:4px;">ceylon-times.lk</div>
          </td>
        </tr>
        
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0F172A;letter-spacing:-0.01em;">Verify Your Account</p>
            <p style="margin:0 0 28px;font-size:15px;color:#64748B;line-height:1.6;">
              Hello ${displayName}, your one-time verification code for Ceylon Times is below. This code expires in <strong>10 minutes</strong>.
            </p>
            
            <!-- OTP Box -->
            <div style="background:#F8FAFC;border:2px dashed #2563EB;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
              <div style="font-size:13px;color:#64748B;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Verification Code</div>
              <div style="font-size:48px;font-weight:800;color:#0F172A;letter-spacing:0.2em;font-family:monospace;">${code}</div>
            </div>
            
            <p style="margin:0 0 6px;font-size:13px;color:#94A3B8;line-height:1.7;">
              If you did not request this, you can safely ignore this email. Do not share this code with anyone.
            </p>
          </td>
        </tr>
        
        <!-- Footer -->
        <tr>
          <td style="background:#F8FAFC;padding:20px 40px;border-top:1px solid #E2E8F0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94A3B8;">
              © ${new Date().getFullYear()} Ceylon Times · 42 Galle Face Promenade, Colombo 03, Sri Lanka
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'Ceylon Times <onboarding@resend.dev>',
          to: [target],
          subject: `${code} — Your Ceylon Times Verification Code`,
          html,
        }),
      });

      const resendData = await resendRes.json();

      if (!resendRes.ok) {
        console.error('[OTP] Resend error:', resendData);
        return NextResponse.json({ success: false, error: resendData?.message || 'Failed to send email' }, { status: 500 });
      }

      return NextResponse.json({ success: true, delivered: true, id: resendData.id });
    }

    // ── SMS (future: Twilio / Dialog) ──────────────────────────────────────────
    if (channel === 'phone') {
      const TWILIO_SID    = process.env.TWILIO_ACCOUNT_SID;
      const TWILIO_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
      const TWILIO_FROM   = process.env.TWILIO_PHONE_NUMBER;

      if (!TWILIO_SID || TWILIO_SID === 'your-twilio-sid' || !TWILIO_TOKEN || !TWILIO_FROM) {
        console.warn('[OTP] Twilio not configured — SMS not sent');
        return NextResponse.json({ success: true, delivered: false, reason: 'sms_not_configured' });
      }

      const body = `Your Ceylon Times verification code is: ${code}\n\nValid for 10 minutes. Do not share this code.`;

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ From: TWILIO_FROM, To: target, Body: body }).toString(),
        }
      );

      const twilioData = await twilioRes.json();

      if (!twilioRes.ok) {
        console.error('[OTP] Twilio error:', twilioData);
        return NextResponse.json({ success: false, error: twilioData?.message || 'Failed to send SMS' }, { status: 500 });
      }

      return NextResponse.json({ success: true, delivered: true, sid: twilioData.sid });
    }

    return NextResponse.json({ success: false, error: 'Unsupported channel' }, { status: 400 });

  } catch (err) {
    console.error('[OTP] Unexpected error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
