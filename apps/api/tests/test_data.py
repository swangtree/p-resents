"""
Test data for API testing.

Provides sample user preferences for testing endpoints and algorithms.
"""

# Sample preferences for 8 users
SAMPLE_PREFERENCES = [
    {
        "user_id": "Samuel",
        "preference_practicality_giving": 5,
        "preference_practicality_receiving": 4,
        "preference_novelty_giving": 3,
        "preference_novelty_receiving": 3,
        "preference_thoughtfulness_giving": 5,
        "preference_thoughtfulness_receiving": 4,
        "preferred_interests": ["Coding", "Teaching", "Coffee"],
        "we_hate_being_stolen_from": 3,
        "we_enjoy_stealing": 3,
        "exclusions": []
    },
    {
        "user_id": "Liam",
        "preference_practicality_giving": 3,
        "preference_practicality_receiving": 3,
        "preference_novelty_giving": 5,
        "preference_novelty_receiving": 5,
        "preference_thoughtfulness_giving": 4,
        "preference_thoughtfulness_receiving": 2,
        "preferred_interests": ["Music", "Travel", "Food"],
        "we_hate_being_stolen_from": 1,
        "we_enjoy_stealing": 5,
        "exclusions": []
    },
    {
        "user_id": "Sam",
        "preference_practicality_giving": 4,
        "preference_practicality_receiving": 4,
        "preference_novelty_giving": 2,
        "preference_novelty_receiving": 2,
        "preference_thoughtfulness_giving": 4,
        "preference_thoughtfulness_receiving": 4,
        "preferred_interests": ["Sports", "Gym", "Health"],
        "we_hate_being_stolen_from": 4,
        "we_enjoy_stealing": 2,
        "exclusions": []
    },
    {
        "user_id": "Joanna",
        "preference_practicality_giving": 2,
        "preference_practicality_receiving": 5,
        "preference_novelty_giving": 4,
        "preference_novelty_receiving": 4,
        "preference_thoughtfulness_giving": 5,
        "preference_thoughtfulness_receiving": 5,
        "preferred_interests": ["Art", "Design", "Cats"],
        "we_hate_being_stolen_from": 5,
        "we_enjoy_stealing": 1,
        "exclusions": []
    },
    {
        "user_id": "Justin",
        "preference_practicality_giving": 5,
        "preference_practicality_receiving": 5,
        "preference_novelty_giving": 1,
        "preference_novelty_receiving": 1,
        "preference_thoughtfulness_giving": 3,
        "preference_thoughtfulness_receiving": 3,
        "preferred_interests": ["Finance", "Tech", "Running"],
        "we_hate_being_stolen_from": 2,
        "we_enjoy_stealing": 2,
        "exclusions": []
    },
    {
        "user_id": "Stephanie",
        "preference_practicality_giving": 3,
        "preference_practicality_receiving": 2,
        "preference_novelty_giving": 5,
        "preference_novelty_receiving": 5,
        "preference_thoughtfulness_giving": 4,
        "preference_thoughtfulness_receiving": 4,
        "preferred_interests": ["Fashion", "Social", "Events"],
        "we_hate_being_stolen_from": 3,
        "we_enjoy_stealing": 4,
        "exclusions": []
    },
    {
        "user_id": "Sam_2",
        "preference_practicality_giving": 4,
        "preference_practicality_receiving": 3,
        "preference_novelty_giving": 3,
        "preference_novelty_receiving": 3,
        "preference_thoughtfulness_giving": 3,
        "preference_thoughtfulness_receiving": 3,
        "preferred_interests": ["Gaming", "Movies", "Pop Culture"],
        "we_hate_being_stolen_from": 2,
        "we_enjoy_stealing": 3,
        "exclusions": []
    },
    {
        "user_id": "Charlotte",
        "preference_practicality_giving": 5,
        "preference_practicality_receiving": 4,
        "preference_novelty_giving": 4,
        "preference_novelty_receiving": 4,
        "preference_thoughtfulness_giving": 5,
        "preference_thoughtfulness_receiving": 5,
        "preferred_interests": ["Photography", "Nature", "Hiking"],
        "we_hate_being_stolen_from": 4,
        "we_enjoy_stealing": 2,
        "exclusions": []
    }
]

# Sample recalculate request
SAMPLE_RECALCULATE_REQUEST = {
    "group_id": "test_group_001",
    "preferences": SAMPLE_PREFERENCES
}

# Sample finalize request for each ruleset
SAMPLE_FINALIZE_RANDOM = {
    "group_id": "test_group_001",
    "ruleset": "Random Matching",
    "preferences": SAMPLE_PREFERENCES,
    "seed": 42
}

SAMPLE_FINALIZE_MAX_UTILITY = {
    "group_id": "test_group_001",
    "ruleset": "Max Utility",
    "preferences": SAMPLE_PREFERENCES
}

SAMPLE_FINALIZE_MAX_FAIRNESS = {
    "group_id": "test_group_001",
    "ruleset": "Max Fairness",
    "preferences": SAMPLE_PREFERENCES,
    "seed": 42
}

SAMPLE_FINALIZE_WHITE_ELEPHANT = {
    "group_id": "test_group_001",
    "ruleset": "White Elephant",
    "preferences": SAMPLE_PREFERENCES,
    "seed": 42
}

# Edge case: minimum 2 users
SAMPLE_PREFERENCES_2_USERS = [
    SAMPLE_PREFERENCES[0],
    SAMPLE_PREFERENCES[1]
]

# Edge case: 1 user (should fail validation)
SAMPLE_PREFERENCES_1_USER = [
    SAMPLE_PREFERENCES[0]
]
