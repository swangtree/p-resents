"""
Utility calculation functions.

Calculate compatibility scores between givers and receivers.

BASIC IMPLEMENTATION: Team consolidation branch
This is a minimal working implementation with TODOs for refinement.
"""
from models.preferences import UserPreference


def calculate_utility(giver: UserPreference, receiver: UserPreference) -> float:
    """
    Calculate utility score from receiver's perspective.

    Basic Implementation:
    - Matches giver's giving preferences with receiver's receiving preferences
    - Adds bonus for shared interests
    - Returns score in range 0-10

    TODO: Refine weighting formula based on real-world testing
    TODO: Consider adding penalty for large preference mismatches
    TODO: Add configurable weights for different preference dimensions

    Args:
        giver: UserPreference object for the person giving the gift
        receiver: UserPreference object for the person receiving the gift

    Returns:
        float: Utility score (0-10, higher = better match)
    """
    # Calculate preference alignment scores
    # Lower difference = better match
    practicality_diff = abs(giver.preference_practicality_giving - receiver.preference_practicality_receiving)
    novelty_diff = abs(giver.preference_novelty_giving - receiver.preference_novelty_receiving)
    thoughtfulness_diff = abs(giver.preference_thoughtfulness_giving - receiver.preference_thoughtfulness_receiving)

    # Convert differences to scores (max diff is 4 since range is 1-5)
    # Perfect match (diff=0) = 2.5 points, worst match (diff=4) = 0 points
    practicality_score = 2.5 * (1 - practicality_diff / 4)
    novelty_score = 2.5 * (1 - novelty_diff / 4)
    thoughtfulness_score = 2.5 * (1 - thoughtfulness_diff / 4)

    # Base utility from preference alignment (0-7.5 range)
    base_utility = practicality_score + novelty_score + thoughtfulness_score

    # Bonus for shared interests (0-2.5 range)
    shared_interests = calculate_shared_interests(giver, receiver)
    # Cap at 5 shared interests for max bonus
    interest_bonus = min(shared_interests, 5) * 0.5

    # Total utility (0-10 range)
    total_utility = base_utility + interest_bonus

    return round(total_utility, 2)


def calculate_shared_interests(giver: UserPreference, receiver: UserPreference) -> int:
    """
    Helper function to calculate number of shared interests.

    Args:
        giver: UserPreference object
        receiver: UserPreference object

    Returns:
        int: Number of shared interests
    """
    giver_interests = set(giver.preferred_interests)
    receiver_interests = set(receiver.preferred_interests)
    return len(giver_interests.intersection(receiver_interests))
