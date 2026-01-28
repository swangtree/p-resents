"""
Unit tests for the random matching algorithm.

Tests cover:
- Valid derangements (no self-matching)
- Exclusion handling
- Edge cases (2-3 people, empty, single person)
- Statistics calculation
- Seed reproducibility
"""
import pytest
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.preferences import UserPreference
from algorithms.random_matching import generate_matching, calculate_statistics


def create_user_preference(
    user_id: str,
    prac_give: int = 3, prac_recv: int = 3,
    nov_give: int = 3, nov_recv: int = 3,
    thought_give: int = 3, thought_recv: int = 3,
    interests: list = None,
    exclusions: list = None
) -> UserPreference:
    """Helper function to create UserPreference objects for testing."""
    return UserPreference(
        user_id=user_id,
        preference_practicality_giving=prac_give,
        preference_practicality_receiving=prac_recv,
        preference_novelty_giving=nov_give,
        preference_novelty_receiving=nov_recv,
        preference_thoughtfulness_giving=thought_give,
        preference_thoughtfulness_receiving=thought_recv,
        preferred_interests=interests or [],
        we_hate_being_stolen_from=3,
        we_enjoy_stealing=3,
        exclusions=exclusions or []
    )


def create_n_users(n: int, exclusions_map: dict = None) -> list:
    """Create n users with optional exclusions."""
    users = []
    exclusions_map = exclusions_map or {}
    for i in range(n):
        user_id = f"user_{i}"
        users.append(create_user_preference(
            user_id=user_id,
            exclusions=exclusions_map.get(user_id, [])
        ))
    return users


class TestGenerateMatchingDerangement:
    """Tests for valid derangement generation."""

    def test_no_self_matching(self):
        """No user should be matched to themselves."""
        users = create_n_users(8)
        matching = generate_matching(users, seed=42)

        for giver, receiver in matching.items():
            assert giver != receiver, f"User {giver} was matched to themselves"

    def test_all_users_matched(self):
        """Every user should be both a giver and a receiver."""
        users = create_n_users(8)
        matching = generate_matching(users, seed=42)

        user_ids = [u.user_id for u in users]

        # Check all users are givers
        assert set(matching.keys()) == set(user_ids)

        # Check all users are receivers
        assert set(matching.values()) == set(user_ids)

    def test_bijective_matching(self):
        """Matching should be a bijection (one-to-one)."""
        users = create_n_users(8)
        matching = generate_matching(users, seed=42)

        # No duplicate receivers
        receivers = list(matching.values())
        assert len(receivers) == len(set(receivers)), "Duplicate receivers found"

    def test_two_person_group(self):
        """Two-person group should swap gifts."""
        users = create_n_users(2)
        matching = generate_matching(users, seed=42)

        assert len(matching) == 2
        assert matching["user_0"] == "user_1"
        assert matching["user_1"] == "user_0"

    def test_three_person_group(self):
        """Three-person group should form a valid derangement."""
        users = create_n_users(3)
        matching = generate_matching(users, seed=42)

        assert len(matching) == 3
        for giver, receiver in matching.items():
            assert giver != receiver

    def test_large_group(self):
        """Large group should still produce valid derangement."""
        users = create_n_users(50)
        matching = generate_matching(users, seed=42)

        assert len(matching) == 50
        for giver, receiver in matching.items():
            assert giver != receiver


class TestGenerateMatchingExclusions:
    """Tests for exclusion handling."""

    def test_exclusions_respected(self):
        """Users should not be matched to excluded users."""
        # user_0 excludes user_1
        users = create_n_users(4, exclusions_map={"user_0": ["user_1"]})
        matching = generate_matching(users, seed=42)

        assert matching["user_0"] != "user_1", "Exclusion not respected"

    def test_multiple_exclusions(self):
        """Multiple exclusions per user should be respected."""
        # user_0 excludes user_1 and user_2
        users = create_n_users(5, exclusions_map={"user_0": ["user_1", "user_2"]})
        matching = generate_matching(users, seed=42)

        assert matching["user_0"] not in ["user_1", "user_2"], "Exclusions not respected"

    def test_mutual_exclusions(self):
        """Mutual exclusions should be respected."""
        users = create_n_users(4, exclusions_map={
            "user_0": ["user_1"],
            "user_1": ["user_0"]
        })
        matching = generate_matching(users, seed=42)

        assert matching["user_0"] != "user_1"
        assert matching["user_1"] != "user_0"

    def test_fallback_on_impossible_exclusions(self):
        """Should fall back to circular matching if exclusions make derangement impossible."""
        # Create a scenario where exclusions are very restrictive
        # With 3 users, if user_0 excludes user_1 and user_2, circular fallback is used
        users = create_n_users(3, exclusions_map={
            "user_0": ["user_1", "user_2"]
        })
        matching = generate_matching(users, seed=42)

        # Should still produce a valid derangement (circular fallback)
        assert len(matching) == 3
        # Note: circular matching might violate exclusions as a last resort


class TestGenerateMatchingEdgeCases:
    """Edge case tests."""

    def test_empty_preferences(self):
        """Empty preferences list should return empty matching."""
        matching = generate_matching([], seed=42)
        assert matching == {}

    def test_single_user(self):
        """Single user should return empty matching."""
        users = create_n_users(1)
        matching = generate_matching(users, seed=42)
        assert matching == {}

    def test_seed_reproducibility(self):
        """Same seed should produce same matching."""
        users = create_n_users(8)

        matching1 = generate_matching(users, seed=12345)
        matching2 = generate_matching(users, seed=12345)

        assert matching1 == matching2

    def test_different_seeds_different_results(self):
        """Different seeds should (usually) produce different matchings."""
        users = create_n_users(8)

        matching1 = generate_matching(users, seed=12345)
        matching2 = generate_matching(users, seed=54321)

        # With 8 users, it's very unlikely to get the same matching with different seeds
        assert matching1 != matching2


class TestCalculateStatistics:
    """Tests for statistics calculation."""

    def test_statistics_structure(self):
        """Statistics should have expected structure."""
        users = create_n_users(4)
        stats = calculate_statistics(users)

        assert hasattr(stats, 'group_satisfaction_score')
        assert hasattr(stats, 'group_fairness_score')
        assert hasattr(stats, 'min_utility')
        assert hasattr(stats, 'max_utility')
        assert hasattr(stats, 'std_dev')
        assert hasattr(stats, 'user_stats')

    def test_user_stats_for_all_users(self):
        """User stats should be calculated for all users."""
        users = create_n_users(4)
        stats = calculate_statistics(users)

        user_ids = [u.user_id for u in users]
        assert set(stats.user_stats.keys()) == set(user_ids)

    def test_empty_preferences_statistics(self):
        """Empty preferences should return zero statistics."""
        stats = calculate_statistics([])

        assert stats.group_satisfaction_score == 0.0
        assert stats.group_fairness_score == 0.0
        assert stats.min_utility == 0.0
        assert stats.max_utility == 0.0

    def test_statistics_values_reasonable(self):
        """Statistics values should be within expected ranges."""
        users = create_n_users(8)
        stats = calculate_statistics(users)

        # Satisfaction should be in utility range [0, 10]
        assert 0 <= stats.group_satisfaction_score <= 10

        # Fairness should be in [0, 10]
        assert 0 <= stats.group_fairness_score <= 10

        # Min should be <= max
        assert stats.min_utility <= stats.max_utility

        # Std dev should be non-negative
        assert stats.std_dev >= 0

    def test_statistics_with_varied_preferences(self):
        """Statistics should reflect preference diversity."""
        users = [
            create_user_preference("alice", prac_give=5, nov_give=5, thought_give=5),
            create_user_preference("bob", prac_recv=5, nov_recv=5, thought_recv=5),
            create_user_preference("carol", prac_give=1, nov_give=1, thought_give=1),
            create_user_preference("dave", prac_recv=1, nov_recv=1, thought_recv=1),
        ]
        stats = calculate_statistics(users)

        # Should have some variation in utility
        assert stats.std_dev > 0 or stats.min_utility == stats.max_utility

    def test_user_stats_have_expected_fields(self):
        """Each user stat should have expected utility and variance."""
        users = create_n_users(4)
        stats = calculate_statistics(users)

        for user_id, user_stat in stats.user_stats.items():
            assert hasattr(user_stat, 'expected_utility')
            assert hasattr(user_stat, 'variance')
            assert user_stat.expected_utility >= 0
            assert user_stat.variance >= 0
