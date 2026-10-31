import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_teacher_onboarding_and_profile_update(client: AsyncClient, test_teacher_headers):
    headers, teacher = test_teacher_headers

    onboarding_payload = {
        "headline": "Lead Data Architect at Stripe",
        "company_name": "Stripe",
        "domain_expertise": "Fintech & High-Volume Payments",
        "ctc_bracket": "45-60 LPA",
        "experience_years": "9+ Years",
        "linkedin_url": "https://linkedin.com/in/stripe-architect",
        "github_url": "https://github.com/stripe-dev",
        "technical_skills": "SQL, Python, Snowflake, dbt, Apache Kafka",
        "bank_name": "HDFC Bank",
        "account_number": "50100492819283",
        "ifsc_code": "HDFC0001234",
        "account_holder_name": "Test Teacher",
        "upi_id": "teacher@hdfcbank",
    }

    response = await client.post("/auth/teacher-onboarding", json=onboarding_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "Stripe"
    assert data["bank_name"] == "HDFC Bank"
    assert data["ifsc_code"] == "HDFC0001234"


@pytest.mark.asyncio
async def test_admin_update_teacher_commission(client: AsyncClient, test_admin_headers, test_teacher_headers):
    admin_headers, admin = test_admin_headers
    _, teacher = test_teacher_headers

    commission_payload = {
        "custom_commission_percent": 82.5
    }

    response = await client.put(
        f"/admin/teachers/{teacher.id}/commission",
        json=commission_payload,
        headers=admin_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["custom_commission_percent"] == 82.5


@pytest.mark.asyncio
async def test_admin_audit_logs_telemetry(client: AsyncClient, test_admin_headers):
    admin_headers, admin = test_admin_headers

    # 1. Trigger an audited event by registering a learner with client IP, UA, and geo headers
    reg_resp = await client.post(
        "/auth/register",
        json={
            "email": "telemetry_user@rewoix.com",
            "password": "Password123!",
            "full_name": "Telemetry Learner",
            "role": "LEARNER",
        },
        headers={
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0",
            "cf-ipcity": "Bengaluru",
            "cf-ipcountry": "India",
            "x-forwarded-for": "103.21.244.2",
        },
    )
    assert reg_resp.status_code == 201

    # 2. Query admin audit logs endpoint
    response = await client.get("/admin/audit-logs", headers=admin_headers)
    assert response.status_code == 200
    logs = response.json()
    assert isinstance(logs, list)
    assert len(logs) > 0
    first_log = logs[0]
    assert first_log["action"] == "USER_REGISTERED"
    assert first_log["location"] == "Bengaluru, India"
    assert first_log["ip_address"] == "103.21.244.2"
    assert "Chrome on Windows" in first_log["user_agent"]
    assert first_log["actor_name"] == "Telemetry Learner"
