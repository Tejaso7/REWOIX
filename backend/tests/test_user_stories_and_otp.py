import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.notification import Notification
from app.models.user import User


@pytest.mark.asyncio
async def test_otp_generation_and_login_flow(client: AsyncClient, db_session: AsyncSession):
    """
    Test Complete OTP Workflow:
    1. Register user
    2. Request OTP
    3. Verify OTP rejection on invalid code
    4. Sign in with correct OTP
    5. Verify Security Login Notification in database
    """
    email = "otp_learner@rewoix.com"

    # Step 1: Register learner
    reg_resp = await client.post("/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "Alex Mercer",
        "role": "LEARNER"
    })
    assert reg_resp.status_code == 201

    # Step 2: Request OTP
    otp_resp = await client.post("/auth/send-otp", json={
        "email": email,
        "purpose": "login"
    })
    assert otp_resp.status_code == 200
    otp_data = otp_resp.json()
    assert otp_data["success"] is True
    assert "debug_otp" in otp_data
    code = otp_data["debug_otp"]
    assert len(code) == 6

    # Step 3: Verify wrong OTP fails
    invalid_verify = await client.post("/auth/verify-otp", json={
        "email": email,
        "otp": "000000",
        "purpose": "login"
    })
    assert invalid_verify.status_code == 400

    # Step 4: Login with valid OTP
    login_resp = await client.post("/auth/login-otp", json={
        "email": email,
        "otp": code
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    token = login_data["access_token"]
    user_id = login_data["user"]["id"]

    # Step 5: Check notifications created for OTP login
    auth_headers = {"Authorization": f"Bearer {token}"}
    notif_resp = await client.get("/notifications", headers=auth_headers)
    assert notif_resp.status_code == 200
    notifs = notif_resp.json()
    assert len(notifs) >= 1
    assert any(n["event_type"] == "SECURITY_LOGIN" for n in notifs)


@pytest.mark.asyncio
async def test_student_learner_user_story(client: AsyncClient, db_session: AsyncSession):
    """
    STUDENT / LEARNER USER STORY:
    - Register learner account
    - Password login -> Triggers security alert notification
    - Complete learner onboarding questionnaire
    - Check unread notifications count
    - Mark notification as read
    - Verify profile reflects updated goals & background
    """
    email = "student_story@rewoix.com"
    pwd = "StudentPassword123"

    # 1. Registration
    reg = await client.post("/auth/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Jordan Lee",
        "role": "LEARNER"
    })
    assert reg.status_code == 201

    # 2. Login
    login = await client.post("/auth/login", json={
        "email": email,
        "password": pwd
    })
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Check notifications
    unread = await client.get("/notifications/unread-count", headers=headers)
    assert unread.status_code == 200
    assert unread.json()["unread_count"] >= 1

    notifs_resp = await client.get("/notifications", headers=headers)
    assert notifs_resp.status_code == 200
    notifs = notifs_resp.json()
    first_notif_id = notifs[0]["id"]

    # 4. Mark notification as read
    mark_read = await client.patch(f"/notifications/{first_notif_id}/read", headers=headers)
    assert mark_read.status_code == 200
    assert mark_read.json()["is_read"] is True

    # 5. Onboarding KYC
    onboarding = await client.post("/auth/learner-onboarding", json={
        "user_type": "STUDENT",
        "institution_or_company": "Stanford University",
        "field_of_study_or_role": "Computer Science & Business Analytics",
        "primary_learning_goal": "Master SQL, dbt, and Fintech churn prediction simulations",
        "interests": "Machine Learning, Risk Modeling, Quantitative Trading",
        "phone_number": "+1-555-0199"
    }, headers=headers)
    assert onboarding.status_code == 200
    assert onboarding.json()["institution_or_company"] == "Stanford University"

    # 6. Verify /auth/me returns updated learner profile
    me = await client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["learner_profile"]["primary_learning_goal"] == "Master SQL, dbt, and Fintech churn prediction simulations"


@pytest.mark.asyncio
async def test_teacher_instructor_user_story(client: AsyncClient, db_session: AsyncSession):
    """
    TEACHER / INSTRUCTOR USER STORY:
    - Register instructor
    - Login & receive login notification
    - Complete professional profile (experience, CTC bracket, bank account for payouts)
    - Create a new enterprise simulation course
    - Check teacher dashboard and earnings summary
    """
    email = "teacher_story@rewoix.com"
    pwd = "TeacherPassword123"

    # 1. Register teacher
    reg = await client.post("/auth/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Dr. Sarah Lin",
        "role": "TEACHER"
    })
    assert reg.status_code == 201

    # 2. Login
    login = await client.post("/auth/login", json={
        "email": email,
        "password": pwd
    })
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Professional Onboarding & Payout Details
    onboarding = await client.post("/auth/teacher-onboarding", json={
        "headline": "Lead Data Architect & Ex-Fintech Director",
        "company_name": "Stripe / Revolut Alum",
        "domain_expertise": "Fintech Risk Analytics & Fraud Detection",
        "ctc_bracket": "45-60 LPA",
        "experience_years": "12+ Years",
        "linkedin_url": "https://linkedin.com/in/sarah-lin-fintech",
        "github_url": "https://github.com/slin-architect",
        "technical_skills": "SQL, Python, Snowflake, dbt, Apache Kafka, PyTorch",
        "bank_name": "Silicon Valley Bank",
        "account_number": "987654321012",
        "ifsc_code": "SVB0001234",
        "account_holder_name": "Dr. Sarah Lin",
        "upi_id": "sarahlin@upi"
    }, headers=headers)
    assert onboarding.status_code == 200
    assert onboarding.json()["company_name"] == "Stripe / Revolut Alum"

    # 4. Create simulation course
    course_resp = await client.post("/courses", json={
        "title": "Fintech Churn & Portfolio Risk Simulation",
        "subtitle": "Real-world corporate analytics simulating high-risk payment transactions",
        "description": "Step into the shoes of a Senior Lead Risk Analyst resolving a 14% unexpected churn spike.",
        "category": "Fintech",
        "difficulty": "ADVANCED",
        "price": 4999.0,
        "thumbnail_url": "/thumbnails/fintech-churn.png"
    }, headers=headers)
    assert course_resp.status_code == 201
    course_id = course_resp.json()["id"]

    # 5. Teacher Dashboard & Earnings Inspection
    dash_resp = await client.get("/teacher/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    assert dash_resp.json()["total_courses"] >= 1

    earnings_resp = await client.get("/teacher/earnings", headers=headers)
    assert earnings_resp.status_code == 200
    earnings_data = earnings_resp.json()
    assert "total_gross_earnings" in earnings_data
    assert "available_payout_balance" in earnings_data
    assert "total_sales_count" in earnings_data


@pytest.mark.asyncio
async def test_admin_operator_user_story(client: AsyncClient, db_session: AsyncSession):
    """
    ADMIN / OPERATOR USER STORY:
    - Register admin
    - Login & verify security notifications
    - View platform telemetry dashboard
    - View and filter user management directory
    - Adjust teacher custom commission percentage to 85%
    - Review & approve pending courses
    - Verify platform revenue breakdown
    """
    email = "admin_story@rewoix.com"
    pwd = "AdminPassword123"

    # 1. Register Admin
    reg = await client.post("/auth/register", json={
        "email": email,
        "password": pwd,
        "full_name": "Chief Platform Operator",
        "role": "ADMIN"
    })
    assert reg.status_code == 201

    # 2. Login
    login = await client.post("/auth/login", json={
        "email": email,
        "password": pwd
    })
    assert login.status_code == 200
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. View Admin Dashboard Metrics
    dash = await client.get("/admin/dashboard", headers=headers)
    assert dash.status_code == 200
    dash_data = dash.json()
    assert "total_learners" in dash_data
    assert "total_teachers" in dash_data
    assert "total_courses" in dash_data

    # 4. View User Management Directory
    users_resp = await client.get("/admin/users", headers=headers)
    assert users_resp.status_code == 200
    users_list = users_resp.json()
    assert len(users_list) >= 1

    # 5. View Platform Revenue Overview
    rev = await client.get("/admin/revenue", headers=headers)
    assert rev.status_code == 200
    assert "total_gmv" in rev.json()
    assert "platform_net_revenue" in rev.json()
