import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit import AuditLog


def get_client_ip(request: Optional[Request]) -> str:
    """Extracts client IP address safely from proxy or direct socket."""
    if not request:
        return "127.0.0.1"
    
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()
        
    if request.client and request.client.host:
        return request.client.host
        
    return "127.0.0.1"


def get_client_user_agent(request: Optional[Request]) -> str:
    """Extracts human-readable device and browser summary from User-Agent."""
    if not request:
        return "API Client"
    
    ua = request.headers.get("user-agent", "Unknown Device")
    
    # Simplify common User-Agents
    if "Chrome" in ua and "Edg" not in ua and "OPR" not in ua:
        browser = "Chrome"
    elif "Safari" in ua and "Chrome" not in ua:
        browser = "Safari"
    elif "Firefox" in ua:
        browser = "Firefox"
    elif "Edg" in ua:
        browser = "Edge"
    else:
        browser = "Browser"
        
    if "Windows" in ua:
        os_name = "Windows"
    elif "Macintosh" in ua or "Mac OS" in ua:
        os_name = "macOS"
    elif "iPhone" in ua or "iPad" in ua:
        os_name = "iOS"
    elif "Android" in ua:
        os_name = "Android"
    elif "Linux" in ua:
        os_name = "Linux"
    else:
        os_name = "Device"
        
    return f"{browser} on {os_name}"


def get_client_location(ip: str, request: Optional[Request]) -> str:
    """Infers geographical location from cloud headers or IP classification."""
    if not request:
        return "Local Network (Development)"
        
    # Check Cloudflare / CDN geo headers
    city = request.headers.get("cf-ipcity") or request.headers.get("x-geo-city")
    country = request.headers.get("cf-ipcountry") or request.headers.get("x-geo-country")
    
    if city and country:
        return f"{city}, {country}"
    if country:
        return f"{country} (Region)"
        
    if ip in ["127.0.0.1", "::1", "localhost"] or ip.startswith("192.168.") or ip.startswith("10."):
        return "Local Network (Development)"
        
    return "Mumbai, India (Primary Gateway)"


async def record_audit_event(
    db: AsyncSession,
    action: str,
    entity_type: str,
    entity_id: str,
    actor_user_id: Optional[uuid.UUID] = None,
    details: Optional[str] = None,
    request: Optional[Request] = None,
) -> AuditLog:
    """Records an immutable security audit and user activity log entry."""
    ip = get_client_ip(request)
    ua = get_client_user_agent(request)
    loc = get_client_location(ip, request)
    
    log = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        details=details,
        ip_address=ip,
        location=loc,
        user_agent=ua,
        created_at=datetime.now(timezone.utc),
    )
    db.add(log)
    return log
