"""
White Elephant Game Simulation

IMPLEMENTED BY: Joanna (game simulation logic)
INTEGRATED BY: Team consolidation branch

Simulates 1000+ White Elephant games with stealing mechanics.

Game Logic (by Joanna):
- happiness_calculator: Calculates happiness based on gift novelty/practicality match
- open_new_gift: Helper for opening unwrapped gifts
- choose_best_steal_target: Finds best gift to steal based on happiness + stealing enjoyment
- steal_gift: Handles stealing mechanics
- simulate_single_game: Core game simulation with play queue and stealing logic
"""
from typing import List, Dict
import random
import statistics
from models.preferences import UserPreference
from models.responses import RulesetStats, UserStats


def calculate_statistics(preferences: List[UserPreference], num_simulations: int = 1000) -> RulesetStats:
    """
    Run multiple White Elephant game simulations and return aggregate statistics.

    Integration note: Wired up Joanna's simulate_single_game to run num_simulations times.

    TODO: Consider adding more sophisticated aggregation logic
    TODO: Track per-user statistics across simulations more granularly
    """
    if not preferences:
        return RulesetStats(
            group_satisfaction_score=0.0,
            group_fairness_score=0.0,
            std_dev=0.0,
            avg_steals_per_game=0.0,
            max_steals_observed=0,
            simulations_run=0,
            user_stats={}
        )

    # Aggregate stats across simulations
    all_steals = []
    user_happiness_totals = {pref.user_id: [] for pref in preferences}
    user_steal_counts = {pref.user_id: 0 for pref in preferences}
    user_stolen_from_counts = {pref.user_id: 0 for pref in preferences}

    for _ in range(num_simulations):
        result = _simulate_single_game(preferences)
        all_steals.append(result["steals"])

        for user_id, stats in result["happiness"].items():
            user_happiness_totals[user_id].append(stats["happiness"])
            user_steal_counts[user_id] += stats["steal"]
            user_stolen_from_counts[user_id] += stats["stolen"]

    # Calculate aggregate statistics
    avg_steals = statistics.mean(all_steals) if all_steals else 0.0
    max_steals = max(all_steals) if all_steals else 0

    # Calculate per-user stats
    user_stats = {}
    all_avg_utilities = []
    for pref in preferences:
        user_id = pref.user_id
        happiness_list = user_happiness_totals[user_id]
        avg_utility = statistics.mean(happiness_list) if happiness_list else 0.0
        std_dev = statistics.stdev(happiness_list) if len(happiness_list) > 1 else 0.0
        all_avg_utilities.append(avg_utility)

        user_stats[user_id] = UserStats(
            avg_utility=avg_utility,
            utility_standard_deviation=std_dev,
            times_stolen_from_pct=user_stolen_from_counts[user_id] / num_simulations,
            times_stole_pct=user_steal_counts[user_id] / num_simulations
        )

    # Group statistics
    group_satisfaction = statistics.mean(all_avg_utilities) if all_avg_utilities else 0.0
    group_std_dev = statistics.stdev(all_avg_utilities) if len(all_avg_utilities) > 1 else 0.0

    # Fairness score based on variance (lower variance = more fair)
    if group_satisfaction > 0:
        cv = group_std_dev / group_satisfaction
        fairness_score = max(0.0, 10.0 * (1.0 - cv))
    else:
        fairness_score = 0.0

    return RulesetStats(
        group_satisfaction_score=group_satisfaction,
        group_fairness_score=min(10.0, fairness_score),
        std_dev=group_std_dev,
        avg_steals_per_game=avg_steals,
        max_steals_observed=max_steals,
        simulations_run=num_simulations,
        user_stats=user_stats
    )


def generate_play_order(preferences: List[UserPreference], seed: int = None) -> List[str]:
    """
    Generate a randomized play order for the actual White Elephant game.

    Implementation by: Joanna (original), kept as-is
    """
    if seed is not None:
        random.seed(seed)

    user_ids = [pref.user_id for pref in preferences]
    random.shuffle(user_ids)
    return user_ids


# =============================================================================
# Game Simulation Logic - Implemented by Joanna
# =============================================================================

def _happiness_calculator(preferences: UserPreference, gift_status: Dict) -> float:
    """
    Calculate happiness based on gift novelty/practicality match.

    Implementation by: Joanna

    Logic:
    - Find distance between receiver's preferred novelty and gift's novelty
    - Find distance between receiver's preferred practicality and gift's practicality
    - Base happiness of 9 if perfect match, adjusted by distances
    - Clamped to range [0, 10]

    TODO Joanna: Consider non-linear happiness scaling
    """
    novelty_distance = preferences.preference_novelty_receiving - gift_status["novelty"]
    practicality_distance = preferences.preference_practicality_receiving - gift_status["practicality"]

    if novelty_distance == 0 and practicality_distance == 0:
        happiness = 9
    else:
        happiness = 5 + novelty_distance + practicality_distance

    return max(0, min(10, happiness))

def _gift_owner(gift_name: str) -> str: 
    """
    Helper function for identifying the owner of a gift.

    Implementation by: Joanna

    """
    return gift_name.rsplit("'s gift", 1)[0]

def _open_new_gift(user_id: str, gift_status: Dict, assignments: Dict,
                   member_stats: Dict, prefs_by_id: Dict) -> None:
    """
    Helper function for opening a new unwrapped gift.

    Implementation by: Joanna

    """
    available_gifts = [
        gift for gift, status in gift_status.items()
        if status["opened"] == 0
        and status["stolen"] <= 3
        and _gift_owner(gift) != user_id
    ]

    if not available_gifts:
        return

    chosen_gift = random.choice(available_gifts)
    gift_status[chosen_gift]["opened"] = 1
    assignments[user_id] = chosen_gift
    member_stats[user_id]["my_turn"] = 0
    member_stats[user_id]["happiness"] = _happiness_calculator(
        prefs_by_id[user_id], gift_status[chosen_gift]
    )


def _choose_best_steal_target(user_id: str, prefs_by_id: Dict, gift_status: Dict, last_steal: Dict) -> tuple:
    """
    Find the best gift to steal based on happiness + stealing enjoyment bonus.

    Implementation by: Joanna

    Returns (best_gift, best_score) or (None, -1) if no valid targets
    """
    best_gift = None
    best_score = -1
    prefs = prefs_by_id[user_id]

    available_gifts = [
        gift for gift, status in gift_status.items()
        if status["opened"] == 1
        and status["stolen"] <= 3
        and _gift_owner(gift) != user_id
        and not (last_steal["gift"] == gift and last_steal["victim"] == user_id)
    ]

    for gift in available_gifts:
        base_score = _happiness_calculator(prefs, gift_status[gift])
        score_with_bonus = base_score + prefs.we_enjoy_stealing
        if score_with_bonus > best_score:
            best_score = score_with_bonus
            best_gift = gift

    return best_gift, best_score


def _steal_gift(thief: str, gift: str, assignments: Dict, member_stats: Dict,
                gift_status: Dict, prefs_by_id: Dict) -> str:
    """
    Handle the stealing mechanics.

    Implementation by: Joanna

    Returns the victim's user_id (who needs to go next)
    """
    victim = next(person for person, g in assignments.items() if g == gift)

    assignments[thief] = gift
    assignments[victim] = None
    member_stats[thief]["happiness"] = _happiness_calculator(
        prefs_by_id[thief], gift_status[gift]
    )

    member_stats[thief]["steal"] += 1
    member_stats[victim]["stolen"] += 1
    gift_status[gift]["stolen"] += 1

    member_stats[victim]["my_turn"] = 1
    member_stats[victim]["happiness"] = 5
    member_stats[thief]["my_turn"] = 0

    return victim, gift


def _simulate_single_game(preferences: List[UserPreference]) -> Dict:
    """
    Simulate a single White Elephant game.

    Implementation by: Joanna (core logic)
    Fixed by: Integration branch (was using test_prefs instead of preferences param)

    Game Rules:
    - First player must open a gift
    - Subsequent players can steal (if happiness gain > 5) or open new gift
    - Gifts can only be stolen 3 times max
    - Stolen-from player gets to go again
    - A player can not immediately steal back a gift that was just stolen from them

    """
    prefs_by_id = {p.user_id: p for p in preferences}

    # Initialize game state
    steals = 0
    last_steal = {"gift": None, "victim": None}
    member_stats = {}
    for pref in preferences:
        member_stats[pref.user_id] = {
            "happiness": 5,
            "steal": 0,
            "stolen": 0,
            "my_turn": 1
        }

    # Initialize gift status (each player brings one gift)
    gift_status = {}
    for pref in preferences:
        gift_name = f"{pref.user_id}'s gift"
        gift_status[gift_name] = {
            "novelty": pref.preference_novelty_giving,
            "practicality": pref.preference_practicality_giving,
            "opened": 0,
            "stolen": 0
        }

    # Initialize assignments
    assignments = {pref.user_id: None for pref in preferences}

    # Generate random play order and run the game
    play_queue = generate_play_order(preferences)

    while play_queue:
        current = play_queue.pop(0)

        if member_stats[current]["my_turn"] == 0:
            continue

        # First turn or no opened gifts yet - must open a new gift
        if not any(st["opened"] == 1 for st in gift_status.values()):
            _open_new_gift(current, gift_status, assignments, member_stats, prefs_by_id)
        else:
            best_gift, best_score = _choose_best_steal_target(current, prefs_by_id, gift_status, last_steal)

            # Steal if the benefit is worth it, otherwise open new gift
            if best_gift is None or best_score <= 5:
                _open_new_gift(current, gift_status, assignments, member_stats, prefs_by_id)
            else:
                victim = _steal_gift(
                    current, best_gift, assignments, member_stats, gift_status, prefs_by_id
                )
                
                last_steal["gift"] = best_gift
                last_steal["victim"] = victim 
                
                steals += 1
                play_queue.insert(0, victim)

    # If a player had been stolen from, recalculate their happiness by considering how much they hated the action
    for user_id, stats in member_stats.items():
        if stats["stolen"] > 0:
            penalty = prefs_by_id[user_id].we_hate_being_stolen_from
            stats["happiness"] = max(0, stats["happiness"] - penalty)

    return {
        "assignments": assignments,
        "steals": steals,
        "happiness": member_stats
    }
