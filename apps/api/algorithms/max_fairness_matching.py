"""
Maximum Fairness Matching Algorithm

IMPLEMENTED BY: Stefanie Nguyen
Implements fairness-optimized matching using minimax approach.

Algorithm:
- Uses threshold-based bipartite matching to find optimal minimax solution
- Binary searches over utility thresholds to find highest minimum utility
- Falls back to greedy approach if bipartite matching fails

Optimization (implemented):
- Instead of O(n!) exhaustive search, uses O(U * n^2.5) threshold-based approach
- where U is the number of unique utility values
- Uses scipy's maximum_bipartite_matching for efficient perfect matching detection
"""
from typing import List, Dict, Tuple, Optional
import statistics
import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import maximum_bipartite_matching
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

    Algorithm (Optimized):
    1. Build utility matrix for all (giver, receiver) pairs
    2. Use threshold-based bipartite matching: binary search over utility values
       to find the highest minimum utility that allows a perfect matching
    3. Falls back to greedy approach if threshold method fails
    4. Calculate statistics for the best matching found

    Complexity: O(U * n^2.5) where U is the number of unique utility values
    (much better than O(n!) for the old exhaustive search)
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

    # Build utility matrix and exclusion set
    # utility_matrix[i][j] = utility if giver i gives to receiver j
    utility_matrix = np.zeros((n, n))
    exclusion_matrix = np.zeros((n, n), dtype=bool)
    user_id_to_idx = {uid: i for i, uid in enumerate(user_ids)}

    for i, giver_id in enumerate(user_ids):
        giver_prefs = pref_dict[giver_id]
        for j, receiver_id in enumerate(user_ids):
            if i == j:
                # Self-matching not allowed
                utility_matrix[i][j] = -float('inf')
                exclusion_matrix[i][j] = True
            elif receiver_id in giver_prefs.exclusions:
                # Exclusion - mark as invalid
                utility_matrix[i][j] = -float('inf')
                exclusion_matrix[i][j] = True
            else:
                utility_matrix[i][j] = calculate_utility(pref_dict[receiver_id], giver_prefs)

    # Try threshold-based bipartite matching
    best_matching = _find_threshold_matching(utility_matrix, exclusion_matrix, user_ids)

    # Fallback: try ignoring exclusions if no valid matching found
    if best_matching is None:
        # Rebuild utility matrix without exclusions (except self-matching)
        for i in range(n):
            for j in range(n):
                if i != j and exclusion_matrix[i][j]:
                    utility_matrix[i][j] = calculate_utility(
                        pref_dict[user_ids[j]], pref_dict[user_ids[i]]
                    )
        exclusion_matrix_no_self = np.eye(n, dtype=bool)
        best_matching = _find_threshold_matching(utility_matrix, exclusion_matrix_no_self, user_ids)

    # Ultimate fallback: greedy minimax
    if best_matching is None:
        best_matching = _greedy_minimax_matching(preferences, pref_dict, user_ids)

    # Final fallback: circular matching
    if best_matching is None or len(best_matching) < n:
        best_matching = {user_ids[i]: user_ids[(i + 1) % n] for i in range(n)}

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


def _find_threshold_matching(
    utility_matrix: np.ndarray,
    exclusion_matrix: np.ndarray,
    user_ids: List[str]
) -> Optional[Dict[str, str]]:
    """
    Find optimal minimax matching using threshold-based bipartite matching.

    Algorithm:
    1. Get all unique utility values from valid edges (sorted descending)
    2. For each threshold, starting from highest:
       - Include only edges with utility >= threshold
       - Check if a perfect matching exists using scipy's max bipartite matching
       - If found, return that matching
    3. Return None if no perfect matching exists at any threshold

    This finds the matching that maximizes the minimum edge weight.
    """
    n = len(user_ids)
    if n == 0:
        return {}
    if n == 1:
        # Single user - no valid matching possible (self-matching not allowed)
        return None

    # Get all valid utility values (excluding -inf from self-matches and exclusions)
    valid_utilities = []
    for i in range(n):
        for j in range(n):
            if not exclusion_matrix[i][j]:
                valid_utilities.append(utility_matrix[i][j])

    if not valid_utilities:
        return None

    # Sort unique thresholds in descending order (try highest first)
    unique_thresholds = sorted(set(valid_utilities), reverse=True)

    # Try each threshold, starting from highest
    for threshold in unique_thresholds:
        # Build adjacency matrix with only edges >= threshold
        adj_matrix = np.zeros((n, n), dtype=np.int8)
        for i in range(n):
            for j in range(n):
                if not exclusion_matrix[i][j] and utility_matrix[i][j] >= threshold:
                    adj_matrix[i][j] = 1

        # Convert to sparse matrix for scipy
        sparse_adj = csr_matrix(adj_matrix)

        # Find maximum bipartite matching
        # Returns array where match[i] = j means row i is matched to column j
        # -1 means unmatched
        match = maximum_bipartite_matching(sparse_adj, perm_type='column')

        # Check if it's a perfect matching (all rows matched)
        if -1 not in match:
            # Build matching dictionary
            return {user_ids[i]: user_ids[match[i]] for i in range(n)}

    return None


def _greedy_minimax_matching(
    preferences: List[UserPreference],
    pref_dict: Dict[str, UserPreference],
    user_ids: List[str]
) -> Optional[Dict[str, str]]:
    """
    Greedy minimax matching as fallback.

    Assigns users greedily, prioritizing the worst-off user first
    to maximize the minimum utility.
    """
    n = len(user_ids)
    if n == 0:
        return {}

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

    return matching if len(matching) == n else None
