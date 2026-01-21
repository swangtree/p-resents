"""
Random Matching Algorithm

BASIC IMPLEMENTATION: Team consolidation branch
Implements random gift exchange matching with expected statistics calculation.

TODO Justin: refine with more sophisticated expected value calculations
"""
from typing import List, Dict
import random
import statistics
from models.preferences import UserPreference
from models.responses import RulesetStats, UserStats
from utils.utility_calculator import calculate_utility


def calculate_statistics(preferences: List[UserPreference]) -> RulesetStats:
    """
    Calculate expected statistics for random matching.

    Basic Implementation:
    - For each person, calculate expected utility from all valid givers
    - Compute overall mean and variance

    TODO: Add more sophisticated probability-weighted calculations
    TODO: Account for derangement constraints in expected value
    """
    if not preferences:
        return RulesetStats(
            group_satisfaction_score=0.0,
            group_fairness_score=0.0,
            min_utility=0.0,
            max_utility=0.0,
            std_dev=0.0,
            user_stats={}
        )

    pref_dict = {pref.user_id: pref for pref in preferences}
    user_ids = list(pref_dict.keys())

    # Calculate expected utility for each receiver
    user_stats = {}
    expected_utilities = []

    for receiver_id in user_ids:
        receiver = pref_dict[receiver_id]
        # Get all valid givers (not self, not excluded)
        valid_givers = [
            gid for gid in user_ids
            if gid != receiver_id and gid not in receiver.exclusions
        ]

        if valid_givers:
            # Calculate utilities from all valid givers
            utilities = [
                calculate_utility(pref_dict[giver_id], receiver)
                for giver_id in valid_givers
            ]
            expected_utility = statistics.mean(utilities)
            variance = statistics.variance(utilities) if len(utilities) > 1 else 0.0
        else:
            expected_utility = 0.0
            variance = 0.0

        expected_utilities.append(expected_utility)
        user_stats[receiver_id] = UserStats(
            expected_utility=round(expected_utility, 2),
            variance=round(variance, 2)
        )

    # Group statistics
    group_satisfaction = statistics.mean(expected_utilities) if expected_utilities else 0.0
    std_dev = statistics.stdev(expected_utilities) if len(expected_utilities) > 1 else 0.0
    min_util = min(expected_utilities) if expected_utilities else 0.0
    max_util = max(expected_utilities) if expected_utilities else 0.0

    # Fairness score (lower variance = more fair)
    if group_satisfaction > 0:
        cv = std_dev / group_satisfaction
        fairness_score = max(0.0, 10.0 * (1.0 - cv))
    else:
        fairness_score = 0.0

    return RulesetStats(
        group_satisfaction_score=round(group_satisfaction, 2),
        group_fairness_score=round(min(10.0, fairness_score), 2),
        min_utility=round(min_util, 2),
        max_utility=round(max_util, 2),
        std_dev=round(std_dev, 2),
        user_stats=user_stats
    )


def generate_matching(preferences: List[UserPreference], seed: int = None) -> Dict[str, str]:
    """
    Generate a random valid matching (derangement).

    Basic Implementation:
    - Uses rejection sampling to find valid derangement
    - Falls back to circular matching if no valid derangement found after max attempts

    TODO Justing: Implement more efficient derangement algorithm
    TODO Justin: Better handle cases with many exclusions
    """
    if seed is not None:
        random.seed(seed)

    if not preferences:
        return {}

    pref_dict = {pref.user_id: pref for pref in preferences}
    user_ids = [pref.user_id for pref in preferences]
    n = len(user_ids)

    if n == 1:
        return {}  # Can't have a matching with 1 person

    # Try to generate valid derangement via rejection sampling
    max_attempts = 1000
    for _ in range(max_attempts):
        receivers = user_ids.copy()
        random.shuffle(receivers)

        # Check validity: no self-matching and respect exclusions
        valid = True
        for i, giver_id in enumerate(user_ids):
            receiver_id = receivers[i]
            # No self-matching
            if giver_id == receiver_id:
                valid = False
                break
            # Respect exclusions
            if receiver_id in pref_dict[giver_id].exclusions:
                valid = False
                break

        if valid:
            return dict(zip(user_ids, receivers))

    # Fallback: circular matching (guaranteed valid for no-exclusion case)
    # TODO: Handle exclusions better in fallback
    matching = {}
    for i in range(n):
        matching[user_ids[i]] = user_ids[(i + 1) % n]
    return matching
