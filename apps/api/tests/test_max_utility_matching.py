"""
Unit tests for the max utility matching algorithm.

Tests cover:
- Optimal pairing verification (Hungarian algorithm)
- Exclusion constraints respected
- Edge cases (empty, single user, two users)
- Deterministic behavior
- Statistics accuracy
"""
import pytest
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.preferences import UserPreference
from algorithms.max_utility_matching import generate_matching, calculate_statistics
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


def calculate_total_utility(matching: dict, pref_dict: dict) -> float:
    """Calculate total utility of a matching."""
    total = 0.0
    for giver_id, receiver_id in matching.items():
        total += calculate_utility(pref_dict[giver_id], pref_dict[receiver_id])
    return total


class TestGenerateMatchingOptimality:
    """Tests verifying optimal matching behavior."""

    def test_simple_optimal_case(self):
        """Test that the algorithm finds the obvious optimal matching."""
        # Alice is great at giving to Bob (high values), Bob wants high values
        # Carol is great at giving to Alice (low values), Alice wants low values
        # This creates a clear optimal matching
        alice = create_user_preference("alice", prac_give=5, prac_recv=1, nov_give=5, nov_recv=1, thought_give=5, thought_recv=1)
        bob = create_user_preference("bob", prac_give=1, prac_recv=5, nov_give=1, nov_recv=5, thought_give=1, thought_recv=5)

        users = [alice, bob]
        matching = generate_matching(users)

        # Alice -> Bob (high giver to high wanter) = 7.5
        # Bob -> Alice (low giver to low wanter) = 7.5
        # Total = 15.0 (optimal)
        assert matching["alice"] == "bob"
        assert matching["bob"] == "alice"

    def test_four_user_optimal(self):
        """Test optimal matching with 4 users."""
        # Set up users where optimal pairing is clear
        a = create_user_preference("a", prac_give=5, prac_recv=1, nov_give=5, nov_recv=1, thought_give=5, thought_recv=1)
        b = create_user_preference("b", prac_give=1, prac_recv=5, nov_give=1, nov_recv=5, thought_give=1, thought_recv=5)
        c = create_user_preference("c", prac_give=3, prac_recv=3, nov_give=3, nov_recv=3, thought_give=3, thought_recv=3)
        d = create_user_preference("d", prac_give=3, prac_recv=3, nov_give=3, nov_recv=3, thought_give=3, thought_recv=3)

        users = [a, b, c, d]
        pref_dict = {u.user_id: u for u in users}
        matching = generate_matching(users)

        # Verify it's a valid matching
        assert len(matching) == 4
        assert set(matching.keys()) == set(matching.values())

        # Verify no self-matching
        for giver, receiver in matching.items():
            assert giver != receiver

        # The algorithm should find:
        # a -> b (7.5), b -> a (7.5), c -> d (7.5), d -> c (7.5) = 30.0
        # or any permutation with similar total

    def test_maximizes_total_utility(self):
        """Verify the matching maximizes total utility vs random alternative."""
        users = [
            create_user_preference("u1", prac_give=5, prac_recv=1, nov_give=5, nov_recv=1, thought_give=5, thought_recv=1),
            create_user_preference("u2", prac_give=1, prac_recv=5, nov_give=1, nov_recv=5, thought_give=1, thought_recv=5),
            create_user_preference("u3", prac_give=3, prac_recv=2, nov_give=4, nov_recv=3, thought_give=2, thought_recv=4),
            create_user_preference("u4", prac_give=2, prac_recv=4, nov_give=3, nov_recv=4, thought_give=4, thought_recv=2),
        ]

        pref_dict = {u.user_id: u for u in users}
        matching = generate_matching(users)

        optimal_utility = calculate_total_utility(matching, pref_dict)

        # Try a few random valid matchings and verify optimal is >= all of them
        # Manual alternative: u1->u3, u2->u4, u3->u1, u4->u2
        alternative1 = {"u1": "u3", "u3": "u1", "u2": "u4", "u4": "u2"}
        alt1_utility = calculate_total_utility(alternative1, pref_dict)

        # Circular: u1->u2, u2->u3, u3->u4, u4->u1
        alternative2 = {"u1": "u2", "u2": "u3", "u3": "u4", "u4": "u1"}
        alt2_utility = calculate_total_utility(alternative2, pref_dict)

        assert optimal_utility >= alt1_utility, f"Optimal {optimal_utility} < Alternative1 {alt1_utility}"
        assert optimal_utility >= alt2_utility, f"Optimal {optimal_utility} < Alternative2 {alt2_utility}"


class TestGenerateMatchingConstraints:
    """Tests for constraint handling."""

    def test_no_self_matching(self):
        """No user should be matched to themselves."""
        users = [create_user_preference(f"user_{i}") for i in range(6)]
        matching = generate_matching(users)

        for giver, receiver in matching.items():
            assert giver != receiver

    def test_exclusions_respected(self):
        """Exclusions should be respected in matching."""
        # u1 excludes u2
        users = [
            create_user_preference("u1", exclusions=["u2"]),
            create_user_preference("u2"),
            create_user_preference("u3"),
            create_user_preference("u4"),
        ]

        matching = generate_matching(users)

        assert matching["u1"] != "u2", "Exclusion not respected"

    def test_multiple_exclusions(self):
        """Multiple exclusions should all be respected."""
        users = [
            create_user_preference("u1", exclusions=["u2", "u3"]),
            create_user_preference("u2"),
            create_user_preference("u3"),
            create_user_preference("u4"),
            create_user_preference("u5"),
        ]

        matching = generate_matching(users)

        assert matching["u1"] not in ["u2", "u3"], "Exclusions not respected"


class TestGenerateMatchingEdgeCases:
    """Edge case tests."""

    def test_empty_preferences(self):
        """Empty preferences should return empty matching."""
        matching = generate_matching([])
        assert matching == {}

    def test_single_user(self):
        """Single user should return empty matching."""
        users = [create_user_preference("solo")]
        matching = generate_matching(users)
        assert matching == {}

    def test_two_users(self):
        """Two users must swap gifts."""
        users = [
            create_user_preference("a"),
            create_user_preference("b"),
        ]
        matching = generate_matching(users)

        assert matching == {"a": "b", "b": "a"}

    def test_deterministic_results(self):
        """Hungarian algorithm should be deterministic."""
        users = [create_user_preference(f"user_{i}") for i in range(5)]

        matching1 = generate_matching(users)
        matching2 = generate_matching(users)

        # Should be identical since Hungarian is deterministic
        assert matching1 == matching2

    def test_seed_ignored(self):
        """Seed parameter should be ignored (deterministic algorithm)."""
        users = [create_user_preference(f"user_{i}") for i in range(5)]

        matching1 = generate_matching(users, seed=12345)
        matching2 = generate_matching(users, seed=54321)

        # Should be identical regardless of seed
        assert matching1 == matching2


class TestCalculateStatistics:
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

    def test_empty_statistics(self):
        """Empty preferences should return zero statistics."""
        stats = calculate_statistics([])

        assert stats.group_satisfaction_score == 0.0
        assert stats.group_fairness_score == 0.0

    def test_single_user_statistics(self):
        """Single user should return zero statistics."""
        stats = calculate_statistics([create_user_preference("solo")])

        assert stats.group_satisfaction_score == 0.0

    def test_statistics_match_matching(self):
        """Statistics should reflect the actual matching utilities."""
        users = [
            create_user_preference("a", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
            create_user_preference("b", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
            create_user_preference("c", prac_give=5, prac_recv=5, nov_give=5, nov_recv=5, thought_give=5, thought_recv=5),
        ]

        stats = calculate_statistics(users)
        matching = generate_matching(users)
        pref_dict = {u.user_id: u for u in users}

        # All users have identical preferences, so all utilities should be 7.5
        for giver, receiver in matching.items():
            utility = calculate_utility(pref_dict[giver], pref_dict[receiver])
            assert utility == 7.5

        # Group satisfaction should be 7.5
        assert stats.group_satisfaction_score == 7.5

    def test_user_stats_contain_all_users(self):
        """User stats should contain entries for all users."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        stats = calculate_statistics(users)

        user_ids = [u.user_id for u in users]
        assert set(stats.user_stats.keys()) == set(user_ids)

    def test_statistics_values_in_range(self):
        """Statistics should be within expected ranges."""
        users = [create_user_preference(f"user_{i}", prac_give=i+1, prac_recv=5-i) for i in range(4)]
        stats = calculate_statistics(users)

        assert 0 <= stats.group_satisfaction_score <= 10
        assert 0 <= stats.group_fairness_score <= 10
        assert stats.min_utility <= stats.max_utility
        assert stats.std_dev >= 0


class TestOptimalityVerification:
    """Comprehensive tests verifying Hungarian algorithm finds true optimum."""

    def test_known_optimal_matching(self):
        """Test with a known optimal solution."""
        # Create users where the optimal matching is mathematically clear
        # User A gives high, wants low
        # User B gives low, wants high
        # Perfect swap maximizes utility

        a = create_user_preference("a", prac_give=5, prac_recv=1, nov_give=5, nov_recv=1, thought_give=5, thought_recv=1)
        b = create_user_preference("b", prac_give=1, prac_recv=5, nov_give=1, nov_recv=5, thought_give=1, thought_recv=5)

        matching = generate_matching([a, b])

        # Optimal: a->b (7.5), b->a (7.5) = 15.0 total
        # Alternative: a->a, b->b is invalid (self-matching)
        assert matching["a"] == "b"
        assert matching["b"] == "a"

    def test_non_trivial_optimal(self):
        """Test optimization with non-trivial preferences."""
        users = [
            create_user_preference("a", prac_give=5, prac_recv=3, nov_give=4, nov_recv=2, thought_give=3, thought_recv=4,
                                   interests=["tech", "music"]),
            create_user_preference("b", prac_give=3, prac_recv=5, nov_give=2, nov_recv=4, thought_give=4, thought_recv=3,
                                   interests=["tech", "sports"]),
            create_user_preference("c", prac_give=2, prac_recv=2, nov_give=5, nov_recv=5, thought_give=2, thought_recv=2,
                                   interests=["art", "music"]),
            create_user_preference("d", prac_give=4, prac_recv=4, nov_give=3, nov_recv=3, thought_give=5, thought_recv=5,
                                   interests=["sports", "cooking"]),
        ]

        pref_dict = {u.user_id: u for u in users}
        matching = generate_matching(users)

        # Calculate the utility of the found matching
        total_utility = calculate_total_utility(matching, pref_dict)

        # Verify it's at least as good as some alternatives
        # Try all simple pair swaps
        from itertools import permutations
        user_ids = ["a", "b", "c", "d"]

        for perm in permutations(user_ids):
            # Check if it's a valid derangement
            if any(user_ids[i] == perm[i] for i in range(4)):
                continue

            alt_matching = {user_ids[i]: perm[i] for i in range(4)}
            alt_utility = calculate_total_utility(alt_matching, pref_dict)

            assert total_utility >= alt_utility - 0.01, \
                f"Found better matching: {alt_matching} with utility {alt_utility} > {total_utility}"
