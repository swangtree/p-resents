"""
Matching Service

Orchestrates all matching algorithms and provides unified interface.
"""
from typing import List, Dict, Optional
from models.preferences import UserPreference
from models.responses import RulesetStats, FinalizeResponse
from algorithms import random_matching, max_utility_matching, max_fairness_matching, white_elephant_simulation
from datetime import datetime
import random as py_random
import numpy as np


def run_all_algorithms(preferences: List[UserPreference]) -> Dict[str, RulesetStats]:
    """
    Run all matching algorithms and return statistics for comparison.

    This is called by the /recalculate endpoint to generate comparison data
    for all available rulesets.

    Args:
        preferences: List of user preference objects

    Returns:
        Dict with keys: "Random Matching", "Max Utility", "Max Fairness", "White Elephant"
        Each value is a RulesetStats object
    """
    results = {}

    # Run each algorithm
    try:
        results["Random Matching"] = random_matching.calculate_statistics(preferences)
    except Exception as e:
        print(f"Error in Random Matching: {e}")
        # Return placeholder stats on error
        results["Random Matching"] = _create_error_stats()

    try:
        results["Max Utility"] = max_utility_matching.calculate_statistics(preferences)
    except Exception as e:
        print(f"Error in Max Utility: {e}")
        results["Max Utility"] = _create_error_stats()

    try:
        results["Max Fairness"] = max_fairness_matching.calculate_statistics(preferences)
    except Exception as e:
        print(f"Error in Max Fairness: {e}")
        results["Max Fairness"] = _create_error_stats()

    try:
        results["White Elephant"] = white_elephant_simulation.calculate_statistics(preferences, num_simulations=1000)
    except Exception as e:
        print(f"Error in White Elephant: {e}")
        results["White Elephant"] = _create_error_stats()

    return results


def finalize_matching(
    ruleset: str,
    preferences: List[UserPreference],
    seed: Optional[int] = None
) -> FinalizeResponse:
    """
    Generate final pairings or play order for the chosen ruleset.

    This is called by the /finalize_group endpoint to create the actual
    gift exchange assignments.

    Args:
        ruleset: Name of the chosen ruleset
        preferences: List of user preference objects
        seed: Optional random seed for reproducibility

    Returns:
        FinalizeResponse with pairings or play_order

    Raises:
        ValueError: If ruleset is not recognized
    """
    # Set random seed if provided
    if seed is not None:
        py_random.seed(seed)
        np.random.seed(seed)

    group_id = "placeholder_group_id"  # This would come from request

    # Generate matching based on ruleset
    if ruleset == "Random Matching":
        pairings = random_matching.generate_matching(preferences, seed)
        return FinalizeResponse(
            group_id=group_id,
            ruleset=ruleset,
            pairings=pairings,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "seed": seed
            }
        )

    elif ruleset == "Max Utility":
        pairings = max_utility_matching.generate_matching(preferences)
        return FinalizeResponse(
            group_id=group_id,
            ruleset=ruleset,
            pairings=pairings,
            metadata={
                "timestamp": datetime.now().isoformat()
            }
        )

    elif ruleset == "Max Fairness":
        pairings = max_fairness_matching.generate_matching(preferences, seed)
        return FinalizeResponse(
            group_id=group_id,
            ruleset=ruleset,
            pairings=pairings,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "seed": seed
            }
        )

    elif ruleset == "White Elephant":
        play_order = white_elephant_simulation.generate_play_order(preferences, seed)
        return FinalizeResponse(
            group_id=group_id,
            ruleset=ruleset,
            play_order=play_order,
            metadata={
                "timestamp": datetime.now().isoformat(),
                "seed": seed
            }
        )

    else:
        raise ValueError(f"Unknown ruleset: {ruleset}. Must be one of: Random Matching, Max Utility, Max Fairness, White Elephant")


def _create_error_stats() -> RulesetStats:
    """Create placeholder stats when an algorithm fails."""
    return RulesetStats(
        group_satisfaction_score=0.0,
        group_fairness_score=0.0,
        std_dev=0.0,
        user_stats={}
    )
