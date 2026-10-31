import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
import logging
import secrets
from datetime import datetime, timedelta, timezone
from app.core.config import settings

logger = logging.getLogger("rewoix.email")

# In-memory store for OTPs: { "email": { "code": "...", "purpose": "...", "expires_at": datetime, "attempts": 0 } }
_OTP_STORE: Dict[str, Dict[str, Any]] = {}


def generate_otp(length: int = 6) -> str:
    """Generates a cryptographically secure numeric OTP."""
    digits = "0123456789"
    return "".join(secrets.choice(digits) for _ in range(length))


def store_otp(email: str, code: str, purpose: str = "login", ttl_minutes: int = 10) -> None:
    """Stores OTP with an expiry time and reset attempt counter."""
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)
    _OTP_STORE[email.strip().lower()] = {
        "code": str(code).strip(),
        "purpose": purpose,
        "expires_at": expires_at,
        "attempts": 0,
    }


def verify_otp(email: str, code: str, purpose: str = "login", max_attempts: int = 5) -> bool:
    """Verifies whether the submitted OTP matches and is still within TTL."""
    clean_email = email.strip().lower()
    clean_code = str(code).strip()
    entry = _OTP_STORE.get(clean_email)

    if not entry:
        logger.warning(f"OTP verification failed: No record found for {clean_email}")
        return False

    if entry.get("purpose") != purpose:
        logger.warning(f"OTP verification failed: Purpose mismatch for {clean_email} ({entry.get('purpose')} vs {purpose})")
        return False

    if datetime.now(timezone.utc) > entry["expires_at"]:
        logger.warning(f"OTP verification failed: Expired OTP for {clean_email}")
        _OTP_STORE.pop(clean_email, None)
        return False

    entry["attempts"] = entry.get("attempts", 0) + 1
    if entry["attempts"] > max_attempts:
        logger.warning(f"OTP verification failed: Maximum attempts exceeded for {clean_email}")
        _OTP_STORE.pop(clean_email, None)
        return False

    if entry["code"] == clean_code:
        # One-time use: delete immediately upon successful verification
        _OTP_STORE.pop(clean_email, None)
        return True

    return False


async def send_email(
    email_to: str,
    subject: str,
    body_html: str,
    body_text: Optional[str] = None
) -> bool:
    """Sends an email notification via SMTP or logs in development."""
    if not settings.SMTP_HOST:
        logger.info(f"[DEV MOCK EMAIL] To: {email_to} | Subject: {subject}")
        # Dev console log for convenience
        print(f"\n[REWOIX EMAIL SIMULATION] >>> To: {email_to}\nSubject: {subject}\n{body_text or 'HTML Body Generated'}\n")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = email_to

        if body_text:
            msg.attach(MIMEText(body_text, "plain"))
        msg.attach(MIMEText(body_html, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            if settings.SMTP_PORT == 587:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, [email_to], msg.as_string())

        logger.info(f"Successfully sent email to {email_to} via {settings.SMTP_HOST}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}")
        return False


async def send_otp_email(email_to: str, otp: str, purpose: str = "login") -> bool:
    """Sends a styled REWOIX OTP email."""
    subject = f"Your REWOIX Verification Code: {otp}"
    purpose_label = "Account Login / Verification" if purpose == "login" else f"Action: {purpose}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f3f4f6; margin: 0; padding: 24px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .header {{ text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; }}
        .logo {{ font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #00D2FF; }}
        .tagline {{ font-size: 12px; color: #9ca3af; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }}
        .content {{ padding: 28px 0; }}
        .h2 {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }}
        .code-box {{ background: #1e293b; border: 1px solid #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }}
        .otp-code {{ font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #00D2FF; }}
        .notice {{ font-size: 13px; color: #9ca3af; line-height: 1.6; margin-top: 20px; }}
        .footer {{ border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; text-align: center; font-size: 11px; color: #6b7280; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">REWOIX</div>
          <div class="tagline">The Corporate Experience Simulator</div>
        </div>
        <div class="content">
          <div class="h2">Authentication Verification Code</div>
          <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
            Use the one-time code below to complete your <strong>{purpose_label}</strong> on the REWOIX platform.
          </p>
          <div class="code-box">
            <span class="otp-code">{otp}</span>
          </div>
          <p class="notice">
            • This verification code is valid for <strong>10 minutes</strong>.<br>
            • Never share your one-time code with anyone, including REWOIX team members.<br>
            • If you did not request this login attempt, please secure your account immediately.
          </p>
        </div>
        <div class="footer">
          &copy; {datetime.now(timezone.utc).year} REWOIX Technologies Inc. Real-World Industry Experience.<br>
          Automated security message — please do not reply to this email.
        </div>
      </div>
    </body>
    </html>
    """
    text_content = f"REWOIX Verification Code: {otp}\nValid for 10 minutes for {purpose_label}.\nIf you did not request this, please ignore."
    return await send_email(email_to, subject, html_content, text_content)


async def send_login_notification_email(
    email_to: str,
    full_name: str,
    role: str,
    ip: str = "127.0.0.1",
    device: str = "Web Browser / API Client"
) -> bool:
    """Sends a security notification email when an account login occurs."""
    subject = "Security Alert: New Sign-in to Your REWOIX Account"
    now_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f3f4f6; margin: 0; padding: 24px; }}
        .container {{ max-width: 540px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
        .header {{ text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; }}
        .logo {{ font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #00D2FF; }}
        .content {{ padding: 24px 0; }}
        .h2 {{ font-size: 18px; font-weight: 700; color: #10B981; margin-bottom: 8px; }}
        .meta-card {{ background: #1e293b; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #10B981; }}
        .meta-row {{ font-size: 13px; color: #cbd5e1; margin-bottom: 8px; }}
        .meta-row strong {{ color: #ffffff; }}
        .notice {{ font-size: 13px; color: #9ca3af; line-height: 1.6; }}
        .footer {{ border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; text-align: center; font-size: 11px; color: #6b7280; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">REWOIX</div>
        </div>
        <div class="content">
          <div class="h2">Security Notification: New Session Active</div>
          <p style="color: #cbd5e1; font-size: 14px;">
            Hello <strong>{full_name}</strong>, a new login session was authenticated for your REWOIX ({role}) account.
          </p>
          <div class="meta-card">
            <div class="meta-row"><strong>Timestamp:</strong> {now_str}</div>
            <div class="meta-row"><strong>IP Address:</strong> {ip}</div>
            <div class="meta-row"><strong>Client / Device:</strong> {device}</div>
            <div class="meta-row"><strong>Security Status:</strong> Authenticated via Token/Credentials</div>
          </div>
          <p class="notice">
            If this was you, no action is needed. If you do not recognize this activity, please change your password and terminate all active sessions immediately.
          </p>
        </div>
        <div class="footer">
          &copy; {datetime.now(timezone.utc).year} REWOIX Security Defense Systems.
        </div>
      </div>
    </body>
    </html>
    """
    text_content = f"Security Notice: New login session to REWOIX ({role}) at {now_str} from IP {ip}.\nIf not you, secure your account immediately."
    return await send_email(email_to, subject, html_content, text_content)
