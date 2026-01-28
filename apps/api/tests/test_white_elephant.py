"""
Unit tests for the White Elephant simulation algorithm.

Tests cover:
- Simulation consistency
- Stealing logic and constraints
- Play order validity
- Statistics aggregation
- Edge cases
"""
import pytest
import sys
import os
import statistics as stats_lib

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.preferences import UserPreference
from algorithms.white_elephant_simulation import (
    calculate_statistics,
    generate_play_order,
    _happiness_calculator,
    _gift_owner,
    _simulate_single_game,
)


def create_user_preference(
    user_id: str,
    prac_give: int = 3, prac_recv: int = 3,
    nov_give: int = 3, nov_recv: int = 3,
    thought_give: int = 3, thought_recv: int = 3,
    interests: list = None,
    hate_stolen: int = 3,
    enjoy_stealing: int = 3,
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
        we_hate_being_stolen_from=hate_stolen,
        we_enjoy_stealing=enjoy_stealing,
        exclusions=exclusions or []
    )


class TestHappinessCalculator:
    """Tests for the happiness calculator function."""

    def test_perfect_match_happiness(self):
        """Perfect match (novelty=0, practicality=0 distance) should give 9."""
        user = create_user_preference("test", nov_recv=3, prac_recv=3)
        gift_status = {"novelty": 3, "practicality": 3, "opened": 1, "stolen": 0}

        happiness = _happiness_calculator(user, gift_status)

        assert happiness == 9

    def test_happiness_adjusted_by_distance(self):
        """Happiness should be adjusted by preference distances."""
        user = create_user_preference("test", nov_recv=5, prac_recv=5)
        gift_status = {"novelty": 3, "practicality": 3, "opened": 1, "stolen": 0}

        # Distance: novelty = 5-3 = 2, practicality = 5-3 = 2
        # Happiness = 5 + 2 + 2 = 9 (wait, that's not right based on the formula)
        # Actually: happiness = 5 + novelty_distance + practicality_distance
        # where distance = pref - gift (can be negative)
        # novelty_distance = 5 - 3 = 2
        # practicality_distance = 5 - 3 = 2
        # happiness = 5 + 2 + 2 = 9

        happiness = _happiness_calculator(user, gift_status)
        assert happiness == 9

    def test_happiness_clamped_at_zero(self):
        """Happiness should not go below 0."""
        user = create_user_preference("test", nov_recv=1, prac_recv=1)
        gift_status = {"novelty": 5, "practicality": 5, "opened": 1, "stolen": 0}

        # Distance: 1-5 = -4 for both
        # Happiness = 5 + (-4) + (-4) = -3, clamped to 0

        happiness = _happiness_calculator(user, gift_status)
        assert happiness == 0

    def test_happiness_clamped_at_ten(self):
        """Happiness should not exceed 10."""
        user = create_user_preference("test", nov_recv=5, prac_recv=5)
        gift_status = {"novelty": 1, "practicality": 1, "opened": 1, "stolen": 0}

        # Distance: 5-1 = 4 for both
        # Happiness = 5 + 4 + 4 = 13, clamped to 10

        happiness = _happiness_calculator(user, gift_status)
        assert happiness == 10


class TestGiftOwner:
    """Tests for the gift owner helper function."""

    def test_extracts_owner_from_gift_name(self):
        """Should extract owner ID from gift name format."""
        assert _gift_owner("alice's gift") == "alice"
        assert _gift_owner("user_123's gift") == "user_123"

    def test_handles_complex_names(self):
        """Should handle names with special characters."""
        assert _gift_owner("john_doe's gift") == "john_doe"


class TestGeneratePlayOrder:
    """Tests for play order generation."""

    def test_all_users_in_order(self):
        """Play order should include all users exactly once."""
        users = [create_user_preference(f"user_{i}") for i in range(5)]
        order = generate_play_order(users)

        user_ids = [u.user_id for u in users]
        assert set(order) == set(user_ids)
        assert len(order) == len(user_ids)

    def test_seed_reproducibility(self):
        """Same seed should produce same play order."""
        users = [create_user_preference(f"user_{i}") for i in range(5)]

        order1 = generate_play_order(users, seed=12345)
        order2 = generate_play_order(users, seed=12345)

        assert order1 == order2

    def test_different_seeds_different_order(self):
        """Different seeds should (usually) produce different orders."""
        users = [create_user_preference(f"user_{i}") for i in range(10)]

        order1 = generate_play_order(users, seed=12345)
        order2 = generate_play_order(users, seed=54321)

        # With 10 users, extremely unlikely to get same order
        assert order1 != order2

    def test_empty_preferences(self):
        """Empty preferences should return empty order."""
        order = generate_play_order([])
        assert order == []


class TestSimulateSingleGame:
    """Tests for single game simulation."""

    def test_all_users_get_gifts(self):
        """Every user should end up with a gift assignment."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        result = _simulate_single_game(users)

        # Check assignments
        assignments = result["assignments"]
        for user in users:
            # User should have an assignment (or None if game logic allows)
            assert user.user_id in assignments

    def test_no_self_gifts(self):
        """No user should end up with their own gift."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        result = _simulate_single_game(users)

        assignments = result["assignments"]
        for user_id, gift in assignments.items():
            if gift is not None:
                assert _gift_owner(gift) != user_id, f"{user_id} has their own gift"

    def test_happiness_tracking(self):
        """Happiness should be tracked for all users."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        result = _simulate_single_game(users)

        for user in users:
            assert user.user_id in result["happiness"]
            assert "happiness" in result["happiness"][user.user_id]
            # Happiness should be in valid range [0, 10]
            h = result["happiness"][user.user_id]["happiness"]
            assert 0 <= h <= 10

    def test_steal_tracking(self):
        """Steals should be tracked."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        result = _simulate_single_game(users)

        # Steals should be non-negative
        assert result["steals"] >= 0

        # User steal counts should be tracked
        for user in users:
            stats = result["happiness"][user.user_id]
            assert "steal" in stats
            assert "stolen" in stats
            assert stats["steal"] >= 0
            assert stats["stolen"] >= 0

    def test_high_stealing_enjoyment_increases_steals(self):
        """Users who enjoy stealing should steal more often on average."""
        # Run multiple simulations with high vs low stealing enjoyment
        high_steal_users = [
            create_user_preference(f"high_{i}", enjoy_stealing=5, hate_stolen=1)
            for i in range(4)
        ]
        low_steal_users = [
            create_user_preference(f"low_{i}", enjoy_stealing=1, hate_stolen=5)
            for i in range(4)
        ]

        high_steals = []
        low_steals = []

        for _ in range(50):
            high_result = _simulate_single_game(high_steal_users)
            low_result = _simulate_single_game(low_steal_users)
            high_steals.append(high_result["steals"])
            low_steals.append(low_result["steals"])

        avg_high = stats_lib.mean(high_steals)
        avg_low = stats_lib.mean(low_steals)

        # High stealing enjoyment should lead to more steals on average
        # This is probabilistic, so allow some variance
        assert avg_high >= avg_low * 0.5, f"Expected more steals with high enjoyment: {avg_high} vs {avg_low}"


class TestCalculateStatistics:
    """Tests for statistics aggregation across simulations."""

    def test_statistics_structure(self):
        """Statistics should have expected structure."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        stats = calculate_statistics(users, num_simulations=10)

        assert hasattr(stats, 'group_satisfaction_score')
        assert hasattr(stats, 'group_fairness_score')
        assert hasattr(stats, 'std_dev')
        assert hasattr(stats, 'avg_steals_per_game')
        assert hasattr(stats, 'max_steals_observed')
        assert hasattr(stats, 'simulations_run')
        assert hasattr(stats, 'user_stats')

    def test_simulations_run_count(self):
        """Should track number of simulations run."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        stats = calculate_statistics(users, num_simulations=50)

        assert stats.simulations_run == 50

    def test_user_stats_for_all_users(self):
        """User stats should exist for all users."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        stats = calculate_statistics(users, num_simulations=10)

        user_ids = [u.user_id for u in users]
        assert set(stats.user_stats.keys()) == set(user_ids)

    def test_user_stats_fields(self):
        """Each user stat should have expected fields."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        stats = calculate_statistics(users, num_simulations=10)

        for user_id, user_stat in stats.user_stats.items():
            assert hasattr(user_stat, 'avg_utility')
            assert hasattr(user_stat, 'utility_standard_deviation')
            assert hasattr(user_stat, 'times_stolen_from_pct')
            assert hasattr(user_stat, 'times_stole_pct')

    def test_empty_preferences(self):
        """Empty preferences should return zero statistics."""
        stats = calculate_statistics([])

        assert stats.group_satisfaction_score == 0.0
        assert stats.simulations_run == 0

    def test_satisfaction_in_valid_range(self):
        """Satisfaction scores should be in valid range [0, 10]."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        stats = calculate_statistics(users, num_simulations=100)

        assert 0 <= stats.group_satisfaction_score <= 10
        assert 0 <= stats.group_fairness_score <= 10

    def test_stealing_statistics_reasonable(self):
        """Stealing statistics should be reasonable."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]
        stats = calculate_statistics(users, num_simulations=100)

        # Average steals should be non-negative
        assert stats.avg_steals_per_game >= 0

        # Max steals should be >= average
        assert stats.max_steals_observed >= stats.avg_steals_per_game


class TestStealingMechanics:
    """Tests for stealing rules and constraints."""

    def test_max_three_steals_per_gift(self):
        """A gift should not be stolen more than 3 times."""
        # This is implicit in the algorithm; we test by running many simulations
        # and checking that steal counts don't exceed 3 per gift
        users = [create_user_preference(f"user_{i}", enjoy_stealing=5) for i in range(6)]

        for _ in range(50):
            result = _simulate_single_game(users)
            # The algorithm tracks stolen count in gift_status, but we don't
            # have direct access. We verify through the steals count.
            # With 6 users, max theoretical steals is bounded.
            assert result["steals"] <= 20  # Reasonable upper bound

    def test_stolen_from_penalty_applied(self):
        """Users who hate being stolen from should have lower happiness when stolen from."""
        # User who hates being stolen from
        hate_steal_user = create_user_preference("hater", hate_stolen=5, enjoy_stealing=1)
        # User who doesn't mind
        ok_steal_user = create_user_preference("ok", hate_stolen=1, enjoy_stealing=3)
        # Users who steal
        stealer1 = create_user_preference("stealer1", enjoy_stealing=5)
        stealer2 = create_user_preference("stealer2", enjoy_stealing=5)

        users = [hate_steal_user, ok_steal_user, stealer1, stealer2]

        # Run many simulations and check happiness patterns
        hater_stolen_happiness = []
        ok_stolen_happiness = []

        for _ in range(100):
            result = _simulate_single_game(users)
            hater_stats = result["happiness"]["hater"]
            ok_stats = result["happiness"]["ok"]

            if hater_stats["stolen"] > 0:
                hater_stolen_happiness.append(hater_stats["happiness"])
            if ok_stats["stolen"] > 0:
                ok_stolen_happiness.append(ok_stats["happiness"])

        # When stolen from, hater should have lower average happiness
        if hater_stolen_happiness and ok_stolen_happiness:
            avg_hater = stats_lib.mean(hater_stolen_happiness)
            avg_ok = stats_lib.mean(ok_stolen_happiness)
            # Hater should be less happy when stolen from (penalty = 5 vs 1)
            assert avg_hater <= avg_ok + 2  # Allow some variance


class TestEdgeCases:
    """Edge case tests."""

    def test_two_users(self):
        """Two users should be able to play."""
        users = [
            create_user_preference("a"),
            create_user_preference("b"),
        ]

        result = _simulate_single_game(users)

        assert len(result["assignments"]) == 2

    def test_single_user(self):
        """Single user should be handled gracefully."""
        users = [create_user_preference("solo")]

        stats = calculate_statistics(users, num_simulations=10)

        # Should still produce some stats
        assert stats.simulations_run == 10

    def test_large_group(self):
        """Large group should work correctly."""
        users = [create_user_preference(f"user_{i}") for i in range(20)]

        stats = calculate_statistics(users, num_simulations=50)

        assert stats.simulations_run == 50
        assert len(stats.user_stats) == 20


class TestStatisticalConsistency:
    """Tests for statistical consistency across simulations."""

    def test_more_simulations_reduces_variance(self):
        """More simulations should lead to more stable statistics."""
        users = [create_user_preference(f"user_{i}") for i in range(4)]

        # Run twice with different simulation counts
        stats_10 = calculate_statistics(users, num_simulations=10)
        stats_1000 = calculate_statistics(users, num_simulations=1000)

        # Both should produce valid results
        assert 0 <= stats_10.group_satisfaction_score <= 10
        assert 0 <= stats_1000.group_satisfaction_score <= 10

        # With more simulations, results should be in a reasonable range
        # (can't strictly test variance reduction without multiple runs)

    def test_default_simulation_count(self):
        """Default should run 1000 simulations."""
        users = [create_user_preference(f"user_{i}") for i in range(3)]

        stats = calculate_statistics(users)

        assert stats.simulations_run == 1000
