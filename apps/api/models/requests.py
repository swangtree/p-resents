"""
Pydantic models for API requests.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from models.preferences import UserPreference


class RecalculateRequest(BaseModel):
    """
    Request body for /recalculate endpoint.

    Runs all matching algorithms and returns statistics for comparison.
    """
    group_id: str = Field(..., description="UUID of the group")
    preferences: List[UserPreference] = Field(..., min_length=2, description="List of user preferences (minimum 2 users)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "group_id": "test_group_001",
                "preferences": [
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
            }
        }
    )


class FinalizeGroupRequest(BaseModel):
    """
    Request body for /finalize_group endpoint.

    Generates final pairings for the chosen ruleset.
    """
    group_id: str = Field(..., description="UUID of the group")
    ruleset: str = Field(..., description="Chosen ruleset: 'Random Matching', 'Max Utility', 'Max Fairness', or 'White Elephant'")
    preferences: List[UserPreference] = Field(..., min_length=2, description="List of user preferences (minimum 2 users)")
    seed: Optional[int] = Field(None, description="Random seed for reproducible results (optional)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "group_id": "test_group_001",
                "ruleset": "Max Utility",
                "preferences": [
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
                ],
                "seed": 42
            }
        }
    )
