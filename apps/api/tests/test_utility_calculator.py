"""
Unit tests for the utility calculator module.

Tests cover:
- Preference alignment scoring (practicality, novelty, thoughtfulness)
- Shared interests bonus calculation
- Edge cases: no shared interests, identical preferences, extreme values
"""
import pytest
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from models.preferences import UserPreference
from utils.utility_calculator import calculate_utility, calculate_shared_interests


def create_user_preference(
    user_id: str = "test_user",
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


class TestCalculateSharedInterests:
    """Tests for calculate_shared_interests function."""

    def test_no_shared_interests(self):
        """Users with completely different interests should have 0 shared."""
        giver = create_user_preference("giver", interests=["Coffee", "Hiking", "Books"])
        receiver = create_user_preference("receiver", interests=["Gaming", "Music", "Travel"])

        assert calculate_shared_interests(giver, receiver) == 0

    def test_all_interests_shared(self):
        """Users with identical interests should have count equal to list length."""
        interests = ["Coffee", "Hiking", "Books"]
        giver = create_user_preference("giver", interests=interests)
        receiver = create_user_preference("receiver", interests=interests)

        assert calculate_shared_interests(giver, receiver) == 3

    def test_partial_overlap(self):
        """Users with some shared interests should return correct count."""
        giver = create_user_preference("giver", interests=["Coffee", "Hiking", "Books"])
        receiver = create_user_preference("receiver", interests=["Coffee", "Gaming", "Books"])

        assert calculate_shared_interests(giver, receiver) == 2

    def test_empty_interests_giver(self):
        """Giver with no interests should result in 0 shared."""
        giver = create_user_preference("giver", interests=[])
        receiver = create_user_preference("receiver", interests=["Coffee", "Books"])

        assert calculate_shared_interests(giver, receiver) == 0

    def test_empty_interests_receiver(self):
        """Receiver with no interests should result in 0 shared."""
        giver = create_user_preference("giver", interests=["Coffee", "Books"])
        receiver = create_user_preference("receiver", interests=[])

        assert calculate_shared_interests(giver, receiver) == 0

    def test_both_empty_interests(self):
        """Both with no interests should result in 0 shared."""
        giver = create_user_preference("giver", interests=[])
        receiver = create_user_preference("receiver", interests=[])

        assert calculate_shared_interests(giver, receiver) == 0

    def test_case_sensitive(self):
        """Interest matching should be case-sensitive."""
        giver = create_user_preference("giver", interests=["Coffee", "HIKING"])
        receiver = create_user_preference("receiver", interests=["coffee", "Hiking"])

        # "Coffee" != "coffee" and "HIKING" != "Hiking"
        assert calculate_shared_interests(giver, receiver) == 0


class TestCalculateUtility:
    """Tests for calculate_utility function."""

    def test_perfect_match_no_interests(self):
        """Perfect preference alignment with no interests should score 7.5."""
        giver = create_user_preference("giver", prac_give=3, nov_give=3, thought_give=3)
        receiver = create_user_preference("receiver", prac_recv=3, nov_recv=3, thought_recv=3)

        # Perfect alignment: 2.5 * 3 = 7.5, no interest bonus
        utility = calculate_utility(giver, receiver)
        assert utility == 7.5

    def test_perfect_match_with_interests(self):
        """Perfect preference alignment with 5 shared interests should score 10."""
        interests = ["Coffee", "Books", "Tech", "Gaming", "Travel"]
        giver = create_user_preference("giver", prac_give=3, nov_give=3, thought_give=3, interests=interests)
        receiver = create_user_preference("receiver", prac_recv=3, nov_recv=3, thought_recv=3, interests=interests)

        # Perfect alignment (7.5) + max interest bonus (2.5) = 10
        utility = calculate_utility(giver, receiver)
        assert utility == 10.0

    def test_worst_match_no_interests(self):
        """Worst preference alignment (max diff=4 each) should score 0."""
        giver = create_user_preference("giver", prac_give=1, nov_give=1, thought_give=1)
        receiver = create_user_preference("receiver", prac_recv=5, nov_recv=5, thought_recv=5)

        # All diffs are 4, so all scores are 0
        utility = calculate_utility(giver, receiver)
        assert utility == 0.0

    def test_partial_alignment(self):
        """Partial preference alignment should score appropriately."""
        giver = create_user_preference("giver", prac_give=3, nov_give=3, thought_give=3)
        receiver = create_user_preference("receiver", prac_recv=5, nov_recv=3, thought_recv=1)

        # prac diff = 2: 2.5 * (1 - 2/4) = 1.25
        # nov diff = 0: 2.5 * (1 - 0/4) = 2.5
        # thought diff = 2: 2.5 * (1 - 2/4) = 1.25
        # Total = 5.0
        utility = calculate_utility(giver, receiver)
        assert utility == 5.0

    def test_interest_bonus_capped_at_5(self):
        """Interest bonus should be capped at 5 shared interests (2.5 points)."""
        interests_giver = ["Coffee", "Books", "Tech", "Gaming", "Travel", "Music", "Art"]
        interests_receiver = ["Coffee", "Books", "Tech", "Gaming", "Travel", "Music", "Art"]

        giver = create_user_preference("giver", prac_give=3, nov_give=3, thought_give=3, interests=interests_giver)
        receiver = create_user_preference("receiver", prac_recv=3, nov_recv=3, thought_recv=3, interests=interests_receiver)

        # 7 shared interests, but capped at 5 -> bonus = 2.5
        utility = calculate_utility(giver, receiver)
        assert utility == 10.0  # 7.5 + 2.5

    def test_interest_bonus_scaling(self):
        """Interest bonus should scale at 0.5 per shared interest."""
        giver = create_user_preference("giver", prac_give=3, nov_give=3, thought_give=3, interests=["Coffee", "Books"])
        receiver = create_user_preference("receiver", prac_recv=3, nov_recv=3, thought_recv=3, interests=["Coffee", "Books"])

        # 2 shared interests -> bonus = 2 * 0.5 = 1.0
        utility = calculate_utility(giver, receiver)
        assert utility == 8.5  # 7.5 + 1.0

    def test_utility_range_valid(self):
        """Utility should always be in range [0, 10]."""
        # Test with extreme values
        extreme_cases = [
            (1, 1, 1, 5, 5, 5),  # Worst case
            (5, 5, 5, 1, 1, 1),  # Worst case reversed
            (3, 3, 3, 3, 3, 3),  # Perfect match
            (1, 2, 3, 4, 5, 3),  # Mixed values
        ]

        for prac_g, nov_g, thought_g, prac_r, nov_r, thought_r in extreme_cases:
            giver = create_user_preference("giver", prac_give=prac_g, nov_give=nov_g, thought_give=thought_g)
            receiver = create_user_preference("receiver", prac_recv=prac_r, nov_recv=nov_r, thought_recv=thought_r)

            utility = calculate_utility(giver, receiver)
            assert 0 <= utility <= 10, f"Utility {utility} out of range for case ({prac_g}, {nov_g}, {thought_g}) -> ({prac_r}, {nov_r}, {thought_r})"

    def test_utility_is_rounded(self):
        """Utility should be rounded to 2 decimal places."""
        giver = create_user_preference("giver", prac_give=2, nov_give=4, thought_give=3, interests=["Coffee"])
        receiver = create_user_preference("receiver", prac_recv=3, nov_recv=5, thought_recv=1, interests=["Coffee"])

        utility = calculate_utility(giver, receiver)

        # Check that it's properly rounded
        assert utility == round(utility, 2)

    def test_asymmetric_utility(self):
        """Utility calculation should be asymmetric (A->B != B->A)."""
        alice = create_user_preference("alice", prac_give=5, prac_recv=1, nov_give=5, nov_recv=1, thought_give=5, thought_recv=1)
        bob = create_user_preference("bob", prac_give=1, prac_recv=5, nov_give=1, nov_recv=5, thought_give=1, thought_recv=5)

        # Alice gives well to people who want high values (Bob)
        alice_to_bob = calculate_utility(alice, bob)
        # Bob gives low values, Alice wants low values
        bob_to_alice = calculate_utility(bob, alice)

        # Both should be perfect matches in this case
        assert alice_to_bob == bob_to_alice  # Symmetric in this particular case

        # Now test actual asymmetry
        carol = create_user_preference("carol", prac_give=5, prac_recv=3, nov_give=5, nov_recv=3, thought_give=5, thought_recv=3)

        carol_to_bob = calculate_utility(carol, bob)  # Carol gives 5s, Bob wants 5s
        bob_to_carol = calculate_utility(bob, carol)  # Bob gives 1s, Carol wants 3s

        assert carol_to_bob != bob_to_carol


class TestUtilityEdgeCases:
    """Edge case tests for utility calculation."""

    def test_same_user_different_giving_receiving(self):
        """A user's giving and receiving preferences can differ."""
        user = create_user_preference(
            "user",
            prac_give=5, prac_recv=1,  # Gives practical, wants impractical
            nov_give=1, nov_recv=5,     # Gives standard, wants novel
            thought_give=5, thought_recv=3
        )

        # Self-utility should not be perfect
        utility = calculate_utility(user, user)
        assert utility != 7.5  # Would be 7.5 if give==recv for all

    def test_boundary_preference_values(self):
        """Test with boundary preference values (1 and 5)."""
        giver_min = create_user_preference("giver", prac_give=1, nov_give=1, thought_give=1)
        receiver_min = create_user_preference("receiver", prac_recv=1, nov_recv=1, thought_recv=1)

        giver_max = create_user_preference("giver2", prac_give=5, nov_give=5, thought_give=5)
        receiver_max = create_user_preference("receiver2", prac_recv=5, nov_recv=5, thought_recv=5)

        # Min-to-min and max-to-max should be perfect matches
        assert calculate_utility(giver_min, receiver_min) == 7.5
        assert calculate_utility(giver_max, receiver_max) == 7.5

        # Min-to-max should be worst match
        assert calculate_utility(giver_min, receiver_max) == 0.0
