import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_waitlist_registration_and_count(client: AsyncClient):
    # 1. Check initial waitlist count
    res_count = await client.get("/waitlist/count")
    assert res_count.status_code == 200
    data_count = res_count.json()
    assert "total_waitlist" in data_count
    initial_total = data_count["total_waitlist"]

    # 2. Join waitlist with camelCase payload
    payload = {
        "name": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "roleStage": "career_switcher",
        "targetDomain": "Fintech",
    }
    res_join = await client.post("/waitlist", json=payload)
    assert res_join.status_code == 201
    join_data = res_join.json()
    assert join_data["success"] is True
    assert join_data["name"] == "Alex Mercer"
    assert join_data["email"] == "alex.mercer@example.com"
    assert join_data["queue_number"] >= 381

    # 3. Duplicate waitlist attempt returns existing record
    res_dup = await client.post("/waitlist", json=payload)
    assert res_dup.status_code == 201
    dup_data = res_dup.json()
    assert dup_data["success"] is True
    assert dup_data["email"] == "alex.mercer@example.com"
    assert dup_data["queue_number"] == join_data["queue_number"]
