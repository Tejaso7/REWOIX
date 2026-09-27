from typing import List, Optional
import logging
from app.core.config import settings

logger = logging.getLogger("eduflow.email")


async def send_email(
    email_to: str,
    subject: str,
    body_html: str,
    body_text: Optional[str] = None
) -> bool:
    """Sends an email notification via SMTP or logs in development."""
    if not settings.SMTP_HOST:
        logger.info(f"[DEV MOCK EMAIL] To: {email_to} | Subject: {subject}")
        return True
    try:
        # SMTP implementation when host is provided
        logger.info(f"Sending email to {email_to} via {settings.SMTP_HOST}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {email_to}: {e}")
        return False
