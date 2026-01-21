"""
Maximum Utility Matching Algorithm

BASIC IMPLEMENTATION: Team consolidation branch
Implements maximum total utility matching using the Hungarian algorithm.

TODO: Person 1 to refine edge case handling and optimization
"""
from typing import List, Dict, Tuple
import statistics
import numpy as np
from scipy.optimize import linear_sum_assignment
from models.preferences import UserPreference
from models.responses import RulesetStats, UserStats
from utils.utility_calculator import calculate_utility


def calculate_statistics(preferences: List[UserPreference]) -> RulesetStats:
    """
    Calculate statistics for the maximum utility matching.

    Uses Hungarian algorithm (linear_sum_assignment) to find optimal matching.

    TODO: Add caching for large groups
    TODO: Optimize memory usage for very large groups
    """
    _, stats = _find_optimal_matching(preferences)
    return stats


def generate_matching(preferences: List[UserPreference], seed: int = None) -> Dict[str, str]:
    """
    Generate the optimal maximum utility matching.

    Note: seed parameter is ignored since Hungarian algorithm is deterministic.
    """
    matching, _ = _find_optimal_matching(preferences)
    return matching


def _find_optimal_matching(preferences: List[UserPreference]) -> Tuple[Dict[str, str], RulesetStats]:
    """
    Find optimal matching using Hungarian algorithm.

    Basic Implementation:
    - Build utility matrix
    - Use scipy's linear_sum_assignment with maximize=True
    - Handle exclusions by setting utility to -inf
    - Handle self-matching by setting utility to -inf

    TODO: Better handle edge cases with many exclusions
    TODO: Add fallback for cases where no valid matching exists
    """
    if not preferences:
        return {}, RulesetStats(
            group_satisfaction_score=0.0,
            group_fairness_score=0.0,
            min_utility=0.0,
            max_utility=0.0,
            std_dev=0.0,
            user_stats={}
        )

    pref_dict = {pref.user_id: pref for pref in preferences}
    user_ids = [pref.user_id for pref in preferences]
    n = len(user_ids)

    if n == 1:
        return {}, RulesetStats(
            group_satisfaction_score=0.0,
            group_fairness_score=0.0,
            min_utility=0.0,
            max_utility=0.0,
            std_dev=0.0,
            user_stats={}
        )

    # Build utility matrix
    # utility_matrix[i][j] = utility if user_ids[i] gives to user_ids[j]
    utility_matrix = np.zeros((n, n))

    for i, giver_id in enumerate(user_ids):
        giver = pref_dict[giver_id]
        for j, receiver_id in enumerate(user_ids):
            receiver = pref_dict[receiver_id]

            # No self-matching
            if giver_id == receiver_id:
                utility_matrix[i][j] = -1e9
            # Respect exclusions
            elif receiver_id in giver.exclusions:
                utility_matrix[i][j] = -1e9
            else:
                utility_matrix[i][j] = calculate_utility(giver, receiver)

    # Find optimal matching using Hungarian algorithm
    row_ind, col_ind = linear_sum_assignment(utility_matrix, maximize=True)

    # Build matching dict and collect utilities
    matching = {}
    utilities = {}
    for i, j in zip(row_ind, col_ind):
        giver_id = user_ids[i]
        receiver_id = user_ids[j]
        matching[giver_id] = receiver_id
        utilities[giver_id] = utility_matrix[i][j]

    # Calculate statistics
    utility_values = [u for u in utilities.values() if u > -1e8]  # Filter out invalid pairs

    if not utility_values:
        # No valid matching found
        return matching, RulesetStats(
            group_satisfaction_score=0.0,
            group_fairness_score=0.0,
            min_utility=0.0,
            max_utility=0.0,
            std_dev=0.0,
            user_stats={}
        )

    min_util = min(utility_values)
    max_util = max(utility_values)
    avg_util = statistics.mean(utility_values)
    std_dev = statistics.stdev(utility_values) if len(utility_values) > 1 else 0.0

    # Fairness score
    if avg_util > 0:
        cv = std_dev / avg_util
        fairness_score = max(0.0, 10.0 * (1.0 - cv))
    else:
        fairness_score = 0.0

    # Build user stats
    user_stats = {
        user_id: UserStats(
            expected_utility=round(utilities.get(user_id, 0.0), 2),
            variance=0.0  # Single matching has no variance per person
        )
        for user_id in user_ids
    }

    stats = RulesetStats(
        group_satisfaction_score=round(avg_util, 2),
        group_fairness_score=round(min(10.0, fairness_score), 2),
        min_utility=round(min_util, 2),
        max_utility=round(max_util, 2),
        std_dev=round(std_dev, 2),
        user_stats=user_stats
    )

    return matching, stats
