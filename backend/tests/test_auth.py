import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    # Register Learner
    reg_payload = {
        "email": "newlearner@example.com",
        "password": "securepassword123",
        "full_name": "New Learner",
        "role": "LEARNER",
    }
    response = await client.post("/auth/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newlearner@example.com"
    assert "LEARNER" in data["roles"]

    # Login Learner
    login_payload = {
        "email": "newlearner@example.com",
        "password": "securepassword123",
    }
    login_res = await client.post("/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["email"] == "newlearner@example.com"


@pytest.mark.asyncio
async def test_invalid_login_credentials(client: AsyncClient):
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "wrongpassword",
    }
    response = await client.post("/auth/login", json=login_payload)
    assert response.status_code == 401
