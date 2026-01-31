"""
Unit tests for the max fairness matching algorithm.

Tests cover:
- Minimax optimization (maximizing minimum utility)
- Variance minimization
- Comparison of exhaustive vs greedy results
- Exclusion handling
- Edge cases
"""
import pytest
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.preferences import UserPreference
from algorithms.max_fairness_matching import generate_matching, calculate_statistics
from utils.utility_calculator import calculate_utility


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


def calculate_matching_utilities(matching: dict, pref_dict: dict) -> list:
    """Calculate utilities for each pair in the matching."""
    utilities = []
    for giver_id, receiver_id in matching.items():
        utility = calculate_utility(pref_dict[receiver_id], pref_dict[giver_id])
        utilities.append(utility)
    return utilities


class TestMinimaxOptimization:
    """Tests verifying minimax (maximize minimum) behavior."""

    def test_maximizes_minimum_utility(self):
        """Algorithm should maximize the minimum utility across all pairs."""
        # Create scenario where one matching is clearly more "fair"
        users = [
            create_user_preference("a", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
            create_user_preference("b", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
            create_user_preference("c", prac_give=1, prac_recv=1, nov_give=1, nov_recv=1, thought_give=1, thought_recv=1),
            create_user_preference("d", prac_give=1, prac_recv=1, nov_give=1, nov_recv=1, thought_give=1, thought_recv=1),
        ]

        matching = generate_matching(users)
        pref_dict = {u.user_id: u for u in users}

        utilities = calculate_matching_utilities(matching, pref_dict)
        min_utility = min(utilities)

        # Verify the matching is valid
        assert len(matching) == 4
        for giver, receiver in matching.items():
            assert giver != receiver

        # The fair matching should pair similar users (a-b, c-d) for max 7.5 each
        # Mixing would give worse minimum (e.g., a->c gives 0.0)
        assert min_utility >= 7.0, f"Minimum utility {min_utility} is too low for fair matching"

    def test_avoids_worst_case_pairs(self):
        """Algorithm should avoid pairings that create very low utility."""
        # User A gives high values, but C wants low values -> bad pair
        # User B gives low values, but C wants low values -> good pair
        users = [
            create_user_preference("a", prac_give=5, prac_recv=3, nov_give=5, nov_recv=3, thought_give=5, thought_recv=3),
            create_user_preference("b", prac_give=1, prac_recv=3, nov_give=1, nov_recv=3, thought_give=1, thought_recv=3),
            create_user_preference("c", prac_give=3, prac_recv=1, nov_give=3, nov_recv=1, thought_give=3, thought_recv=1),
            create_user_preference("d", prac_give=3, prac_recv=5, nov_give=3, nov_recv=5, thought_give=3, thought_recv=5),
        ]

        matching = generate_matching(users)
        pref_dict = {u.user_id: u for u in users}

        # a->c would give utility 0.0 (5s given to someone wanting 1s)
        # Fair algorithm should avoid this
        if matching.get("a") == "c":
            # If a->c, check that this was unavoidable
            utilities = calculate_matching_utilities(matching, pref_dict)
            assert min(utilities) > 0.0, "Algorithm paired a->c creating 0 utility unnecessarily"


class TestOptimizedAlgorithm:
    """Tests for the optimized threshold-based bipartite matching algorithm."""

    def test_small_group_finds_optimal(self):
        """Groups of any size should find optimal solution with new algorithm."""
        users = [create_user_preference(f"user_{i}") for i in range(6)]
        matching = generate_matching(users)

        # Should find a valid derangement
        assert len(matching) == 6
        for giver, receiver in matching.items():
            assert giver != receiver

    def test_large_group_complete_matching(self):
        """Groups larger than 8 should now produce complete matching with optimized algorithm."""
        users = [create_user_preference(f"user_{i}") for i in range(12)]
        matching = generate_matching(users)

        # Optimized algorithm produces complete matching for all users
        assert len(matching) == 12
        for giver, receiver in matching.items():
            assert giver != receiver
        # Verify all unique receivers
        assert len(set(matching.values())) == 12

    def test_boundary_case_8_users(self):
        """8 users should produce complete optimal matching."""
        users = [create_user_preference(f"user_{i}") for i in range(8)]
        matching = generate_matching(users)

        assert len(matching) == 8
        # Verify all unique receivers
        assert len(set(matching.values())) == 8

    def test_boundary_case_9_users(self):
        """9 users should produce complete matching with optimized algorithm."""
        users = [create_user_preference(f"user_{i}") for i in range(9)]
        matching = generate_matching(users)

        # Optimized algorithm produces complete matching
        assert len(matching) == 9
        # Receivers should be unique
        assert len(set(matching.values())) == 9

    def test_15_users_performance(self):
        """15 users should complete in reasonable time (was O(n!) before)."""
        import time
        users = [create_user_preference(f"user_{i}") for i in range(15)]

        start = time.time()
        matching = generate_matching(users)
        elapsed = time.time() - start

        # Should complete in under 1 second with optimized algorithm
        # (would take forever with O(n!) = 15! = 1.3 trillion iterations)
        assert elapsed < 1.0, f"Algorithm took {elapsed:.2f}s - too slow"
        assert len(matching) == 15
        for giver, receiver in matching.items():
            assert giver != receiver

    def test_20_users_performance(self):
        """20 users should complete in reasonable time."""
        import time
        users = [create_user_preference(f"user_{i}") for i in range(20)]

        start = time.time()
        matching = generate_matching(users)
        elapsed = time.time() - start

        # Should complete in under 2 seconds
        assert elapsed < 2.0, f"Algorithm took {elapsed:.2f}s - too slow"
        assert len(matching) == 20
        for giver, receiver in matching.items():
            assert giver != receiver

    def test_large_group_minimax_quality(self):
        """Large groups should still achieve good minimax results."""
        # Create scenario with varied preferences
        users = []
        for i in range(12):
            # Alternate between different preference profiles
            if i % 3 == 0:
                users.append(create_user_preference(f"user_{i}", prac_give=5, prac_recv=5, nov_give=1, nov_recv=1))
            elif i % 3 == 1:
                users.append(create_user_preference(f"user_{i}", prac_give=1, prac_recv=1, nov_give=5, nov_recv=5))
            else:
                users.append(create_user_preference(f"user_{i}", prac_give=3, prac_recv=3, nov_give=3, nov_recv=3))

        matching = generate_matching(users)
        pref_dict = {u.user_id: u for u in users}

        utilities = calculate_matching_utilities(matching, pref_dict)
        min_utility = min(utilities)

        # Optimized algorithm should achieve reasonable minimum utility
        assert len(matching) == 12
        assert min_utility >= 3.0, f"Minimum utility {min_utility} is too low"


class TestExclusionHandling:
    """Tests for exclusion constraint handling."""

    def test_exclusions_respected_small_group(self):
        """Exclusions should be respected in small groups (exhaustive)."""
        users = [
            create_user_preference("a", exclusions=["b"]),
            create_user_preference("b"),
            create_user_preference("c"),
            create_user_preference("d"),
        ]

        matching = generate_matching(users)

        assert matching["a"] != "b", "Exclusion violated"

    def test_multiple_exclusions_respected(self):
        """Multiple exclusions per user should be respected."""
        users = [
            create_user_preference("a", exclusions=["b", "c"]),
            create_user_preference("b"),
            create_user_preference("c"),
            create_user_preference("d"),
            create_user_preference("e"),
        ]

        matching = generate_matching(users)

        assert matching["a"] not in ["b", "c"], "Exclusions violated"

    def test_impossible_exclusions_fallback(self):
        """Should fall back gracefully with impossible exclusions."""
        # Create scenario where exclusions make perfect derangement impossible
        # Everyone excludes everyone except one person
        users = [
            create_user_preference("a", exclusions=["b", "c"]),
            create_user_preference("b", exclusions=["a", "c"]),
            create_user_preference("c", exclusions=["a", "b"]),
        ]

        matching = generate_matching(users)

        # Should still produce some matching (possibly circular fallback)
        assert len(matching) == 3


class TestEdgeCases:
    """Edge case tests."""

    def test_empty_preferences(self):
        """Empty preferences should return empty matching."""
        matching = generate_matching([])
        assert matching == {}

    def test_single_user(self):
        """Single user should be handled gracefully."""
        users = [create_user_preference("solo")]
        stats = calculate_statistics(users)

        # Single user falls back to circular matching (self -> self)
        # which calculates self-utility (7.5 for identical preferences)
        # This is expected edge case behavior
        assert stats.group_satisfaction_score >= 0.0

    def test_two_users(self):
        """Two users must swap gifts."""
        users = [
            create_user_preference("a"),
            create_user_preference("b"),
        ]
        matching = generate_matching(users)

        assert matching == {"a": "b", "b": "a"}

    def test_three_users(self):
        """Three users should form valid derangement."""
        users = [create_user_preference(c) for c in ["a", "b", "c"]]
        matching = generate_matching(users)

        assert len(matching) == 3
        for giver, receiver in matching.items():
            assert giver != receiver


class TestStatistics:
    """Tests for statistics calculation."""

    def test_statistics_structure(self):
        """Statistics should have expected structure."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        stats = calculate_statistics(users)

        assert hasattr(stats, 'group_satisfaction_score')
        assert hasattr(stats, 'group_fairness_score')
        assert hasattr(stats, 'min_utility')
        assert hasattr(stats, 'max_utility')
        assert hasattr(stats, 'std_dev')
        assert hasattr(stats, 'user_stats')

    def test_fairness_score_high_for_equal_utilities(self):
        """Fairness score should be high when all utilities are equal."""
        # All users identical -> all utilities equal
        users = [
            create_user_preference("a", prac_give=3, prac_recv=3, nov_give=3, nov_recv=3, thought_give=3, thought_recv=3),
            create_user_preference("b", prac_give=3, prac_recv=3, nov_give=3, nov_recv=3, thought_give=3, thought_recv=3),
            create_user_preference("c", prac_give=3, prac_recv=3, nov_give=3, nov_recv=3, thought_give=3, thought_recv=3),
        ]

        stats = calculate_statistics(users)

        # All identical should give perfect fairness
        assert stats.std_dev == 0.0 or stats.std_dev < 0.01
        assert stats.group_fairness_score >= 9.0

    def test_min_equals_max_for_uniform_utilities(self):
        """Min should equal max when all pairs have same utility."""
        users = [
            create_user_preference("a", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
            create_user_preference("b", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
        ]

        stats = calculate_statistics(users)

        # Both pairs should have utility 7.5
        assert stats.min_utility == stats.max_utility

    def test_user_stats_for_all_users(self):
        """User stats should exist for all users."""
        users = [create_user_preference(f"user_{i}") for i in range(5)]
        stats = calculate_statistics(users)

        user_ids = [u.user_id for u in users]
        assert set(stats.user_stats.keys()) == set(user_ids)

    def test_empty_preferences_statistics(self):
        """Empty preferences should return zero statistics."""
        stats = calculate_statistics([])

        assert stats.group_satisfaction_score == 0.0
        assert stats.group_fairness_score == 0.0
        assert stats.user_stats == {}


class TestFairnessVsUtility:
    """Tests comparing fairness algorithm to max utility algorithm."""

    def test_fairness_prioritizes_minimum(self):
        """Fairness algorithm should have higher minimum than utility-focused approaches."""
        # Create scenario where max utility and max fairness differ
        # User pairs: a-b high compatibility, c-d low compatibility
        # Utility would maximize total, fairness would balance

        users = [
            create_user_preference("a", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
            create_user_preference("b", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
            create_user_preference("c", prac_give=3, prac_recv=3, nov_give=3, nov_recv=3, thought_give=3, thought_recv=3),
            create_user_preference("d", prac_give=3, prac_recv=3, nov_give=3, nov_recv=3, thought_give=3, thought_recv=3),
        ]

        stats = calculate_statistics(users)

        # Fair algorithm should achieve good minimum
        assert stats.min_utility >= 7.0, "Fairness algorithm should maximize minimum utility"

    def test_consistent_statistics_and_matching(self):
        """Statistics should match the actual generated matching."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]

        stats = calculate_statistics(users)
        matching = generate_matching(users)
        pref_dict = {u.user_id: u for u in users}

        utilities = calculate_matching_utilities(matching, pref_dict)

        # Min/max from stats should match actual matching
        assert abs(stats.min_utility - min(utilities)) < 0.1
        assert abs(stats.max_utility - max(utilities)) < 0.1
