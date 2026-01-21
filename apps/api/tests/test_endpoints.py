"""
Basic endpoint tests.

Tests the API endpoints with sample data to ensure everything is wired correctly.
"""
from fastapi.testclient import TestClient
from main import app
from tests.test_data import (
    SAMPLE_RECALCULATE_REQUEST,
    SAMPLE_FINALIZE_RANDOM,
    SAMPLE_FINALIZE_MAX_UTILITY,
    SAMPLE_FINALIZE_MAX_FAIRNESS,
    SAMPLE_FINALIZE_WHITE_ELEPHANT,
    SAMPLE_PREFERENCES_1_USER
)

client = TestClient(app)


def test_root():
    """Test root endpoint returns API info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "P-resents API"
    assert data["status"] == "running"


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_recalculate_success():
    """Test /recalculate endpoint with valid data."""
    response = client.post("/recalculate", json=SAMPLE_RECALCULATE_REQUEST)
    assert response.status_code == 200
    data = response.json()

    # Check response structure
    assert "group_id" in data
    assert data["group_id"] == "test_group_001"
    assert "rulesets" in data

    # Check all rulesets are present
    rulesets = data["rulesets"]
    assert "Random Matching" in rulesets
    assert "Max Utility" in rulesets
    assert "Max Fairness" in rulesets
    assert "White Elephant" in rulesets

    # Check each ruleset has required fields
    for ruleset_name, stats in rulesets.items():
        assert "group_satisfaction_score" in stats
        assert "group_fairness_score" in stats
        assert "std_dev" in stats


def test_recalculate_too_few_users():
    """Test /recalculate fails with only 1 user."""
    invalid_request = {
        "group_id": "test_group_002",
        "preferences": SAMPLE_PREFERENCES_1_USER
    }
    response = client.post("/recalculate", json=invalid_request)
    # Pydantic validation returns 422 for min_length violations
    assert response.status_code == 422


def test_finalize_random_matching():
    """Test /finalize_group with Random Matching ruleset."""
    response = client.post("/finalize_group", json=SAMPLE_FINALIZE_RANDOM)
    assert response.status_code == 200
    data = response.json()

    assert data["group_id"] == "test_group_001"
    assert data["ruleset"] == "Random Matching"
    assert "pairings" in data
    assert data["pairings"] is not None
    assert len(data["pairings"]) == 8  # 8 users


def test_finalize_max_utility():
    """Test /finalize_group with Max Utility ruleset."""
    response = client.post("/finalize_group", json=SAMPLE_FINALIZE_MAX_UTILITY)
    assert response.status_code == 200
    data = response.json()

    assert data["ruleset"] == "Max Utility"
    assert "pairings" in data


def test_finalize_max_fairness():
    """Test /finalize_group with Max Fairness ruleset."""
    response = client.post("/finalize_group", json=SAMPLE_FINALIZE_MAX_FAIRNESS)
    assert response.status_code == 200
    data = response.json()

    assert data["ruleset"] == "Max Fairness"
    assert "pairings" in data


def test_finalize_white_elephant():
    """Test /finalize_group with White Elephant ruleset."""
    response = client.post("/finalize_group", json=SAMPLE_FINALIZE_WHITE_ELEPHANT)
    assert response.status_code == 200
    data = response.json()

    assert data["ruleset"] == "White Elephant"
    assert "play_order" in data
    assert data["play_order"] is not None
    assert len(data["play_order"]) == 8  # 8 users


def test_finalize_invalid_ruleset():
    """Test /finalize_group fails with invalid ruleset."""
    invalid_request = SAMPLE_FINALIZE_RANDOM.copy()
    invalid_request["ruleset"] = "Invalid Ruleset"

    response = client.post("/finalize_group", json=invalid_request)
    assert response.status_code == 400


if __name__ == "__main__":
    # Run tests manually
    import pytest
    pytest.main([__file__, "-v"])
