"""
Maximum Fairness Matching Algorithm

IMPLEMENTED BY: Stefanie Nguyen
Implements fairness-optimized matching using minimax approach.

Algorithm:
- For small groups (n <= 8): Exhaustive search trying all permutations
- For larger groups (n > 8): Greedy approach prioritizing worst-off users

TODO Stefanie: Can change algorithm to be more efficient by using what we talked about - starting with only edges of max utility + trying to find matching, if it doesn't exist go to 9, then 8, etc.
"""
from typing import List, Dict, Tuple
import statistics
from itertools import permutations
from models.preferences import UserPreference
from models.responses import RulesetStats, UserStats
from utils.utility_calculator import calculate_utility


def calculate_statistics(preferences: List[UserPreference]) -> RulesetStats:
    """
    Calculate statistics for the fairness-optimized matching.

    Finds a matching that optimizes for fairness using minimax approach.

    Implementation by: Stefanie Nguyen
    """
    _, stats = _find_fair_matching(preferences)
    return stats


def generate_matching(preferences: List[UserPreference], seed: int = None) -> Dict[str, str]:
    """
    Generate a fairness-optimized matching.

    Uses the same algorithm as calculate_statistics to find the best matching.

    Implementation by: Stefanie Nguyen
    """
    matching, _ = _find_fair_matching(preferences, seed)
    return matching


def _find_fair_matching(preferences: List[UserPreference], seed: int = None) -> Tuple[Dict[str, str], RulesetStats]:
    """
    Internal helper to find fair matching and stats using deterministic minimax approach.

    Implementation by: Stefanie Nguyen

    Algorithm:
    1. For small groups (n <= 8): Try all permutations and find optimal minimax solution
    2. For larger groups: Use greedy approach that prioritizes worst-off users
    3. Calculate statistics for the best matching found
    """
    user_ids = [pref.user_id for pref in preferences]
    n = len(user_ids)

    # Handle empty case
    if n == 0:
        return {}, RulesetStats(
            group_satisfaction_score=0.0,
            group_fairness_score=0.0,
            min_utility=0.0,
            max_utility=0.0,
            std_dev=0.0,
            user_stats={}
        )

    # Build preference lookup dictionary
    pref_dict = {pref.user_id: pref for pref in preferences}

    # Choose algorithm based on group size
    if n <= 8:
        # Exhaustive search for small groups - finds optimal solution
        best_matching = None
        best_min_utility = float('-inf')

        # Try all possible receiver orderings
        for receiver_perm in permutations(user_ids):
            # Check if valid (no self-matching)
            if any(user_ids[i] == receiver_perm[i] for i in range(n)):
                continue

            # Build matching dictionary
            matching = {user_ids[i]: receiver_perm[i] for i in range(n)}

            # Calculate utilities and check exclusions
            utilities = []
            valid = True
            for giver, receiver in matching.items():
                prefs = pref_dict[giver]
                if receiver in prefs.exclusions:
                    valid = False
                    break
                utility = calculate_utility(pref_dict[receiver], prefs)
                utilities.append(utility)

            if not valid:
                continue

            # Check if this matching has higher minimum utility (minimax)
            min_utility = min(utilities)
            if min_utility > best_min_utility:
                best_min_utility = min_utility
                best_matching = matching

        # Fallback if no valid matching found due to exclusions
        if best_matching is None:
            # Try ignoring exclusions
            for receiver_perm in permutations(user_ids):
                if any(user_ids[i] == receiver_perm[i] for i in range(n)):
                    continue
                matching = {user_ids[i]: receiver_perm[i] for i in range(n)}
                utilities = [calculate_utility(pref_dict[receiver], pref_dict[giver])
                           for giver, receiver in matching.items()]
                min_utility = min(utilities)
                if best_matching is None or min_utility > best_min_utility:
                    best_min_utility = min_utility
                    best_matching = matching

        # Ultimate fallback: circular matching
        if best_matching is None:
            best_matching = {user_ids[i]: user_ids[(i + 1) % n] for i in range(n)}

    else:
        # Greedy minimax for larger groups
        matching = {}
        available_receivers = set(user_ids)
        unmatched_givers = set(user_ids)

        while unmatched_givers:
            # Find best assignment for each unmatched giver
            best_assignments = []

            for giver in unmatched_givers:
                prefs = pref_dict[giver]

                # Find valid receivers (not excluded, not self, still available)
                valid_receivers = [
                    r for r in available_receivers
                    if r != giver and r not in prefs.exclusions
                ]

                # Fallback: ignore exclusions if needed
                if not valid_receivers:
                    valid_receivers = [r for r in available_receivers if r != giver]

                if valid_receivers:
                    # Find receiver with best utility for this giver
                    receiver_utilities = [
                        (calculate_utility(pref_dict[r], prefs), r)
                        for r in valid_receivers
                    ]
                    best_utility, best_receiver = max(receiver_utilities)
                    best_assignments.append((giver, best_receiver, best_utility))

            if not best_assignments:
                break

            # Sort by utility (ascending) - assign worst-off user first
            best_assignments.sort(key=lambda x: x[2])

            # Make assignment for worst-off user
            giver, receiver, utility = best_assignments[0]
            matching[giver] = receiver
            unmatched_givers.remove(giver)
            available_receivers.remove(receiver)

        best_matching = matching

    # Calculate statistics for the best matching
    utilities = {}
    for giver, receiver in best_matching.items():
        prefs = pref_dict[giver]
        utility = calculate_utility(pref_dict[receiver], prefs)
        utilities[giver] = utility

    if not utilities:
        return best_matching, RulesetStats(
            group_satisfaction_score=0.0,
            group_fairness_score=0.0,
            min_utility=0.0,
            max_utility=0.0,
            std_dev=0.0,
            user_stats={}
        )

    utility_values = list(utilities.values())
    min_util = min(utility_values)
    max_util = max(utility_values)
    avg_util = statistics.mean(utility_values)
    std_dev = statistics.stdev(utility_values) if len(utility_values) > 1 else 0.0

    # Calculate fairness score (higher when utilities are more equal)
    if avg_util > 0:
        cv = std_dev / avg_util  # Coefficient of variation
        fairness_score = max(0.0, 10.0 * (1.0 - cv))
    else:
        fairness_score = 0.0

    # Alternative: ratio of min to max
    if max_util > 0:
        fairness_score = max(fairness_score, 10.0 * (min_util / max_util))

    # Build user stats
    user_stats = {
        user_id: UserStats(expected_utility=utility, variance=0.0)
        for user_id, utility in utilities.items()
    }

    stats = RulesetStats(
        group_satisfaction_score=avg_util,
        group_fairness_score=min(10.0, fairness_score),
        min_utility=min_util,
        max_utility=max_util,
        std_dev=std_dev,
        user_stats=user_stats
    )

    return best_matching, stats
