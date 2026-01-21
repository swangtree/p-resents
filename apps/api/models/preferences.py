"""
Pydantic models for user preferences.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import List


class UserPreference(BaseModel):
    """
    User preference data for gift exchange matching.

    All preference scores are on a 1-5 scale.
    """
    user_id: str = Field(..., description="UUID of the user")

    # Gift preference criteria (both giving and receiving perspectives)
    preference_practicality_giving: int = Field(ge=1, le=5, description="How practical gifts user likes to give (1-5)")
    preference_practicality_receiving: int = Field(ge=1, le=5, description="How practical gifts user likes to receive (1-5)")
    preference_novelty_giving: int = Field(ge=1, le=5, description="How novel/unique gifts user likes to give (1-5)")
    preference_novelty_receiving: int = Field(ge=1, le=5, description="How novel/unique gifts user likes to receive (1-5)")
    preference_thoughtfulness_giving: int = Field(ge=1, le=5, description="How thoughtful gifts user likes to give (1-5)")
    preference_thoughtfulness_receiving: int = Field(ge=1, le=5, description="How thoughtful gifts user likes to receive (1-5)")

    # Interest-based preferences
    preferred_interests: List[str] = Field(default_factory=list, description="List of interests (e.g., 'Coffee', 'Hiking')")

    # White Elephant specific preferences
    we_hate_being_stolen_from: int = Field(ge=1, le=5, description="How much user dislikes being stolen from (1-5)")
    we_enjoy_stealing: int = Field(ge=1, le=5, description="How much user enjoys stealing (1-5)")

    # Exclusions
    exclusions: List[str] = Field(default_factory=list, description="List of user IDs to exclude from matching")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "user_id": "uuid_user_1",
                "preference_practicality_giving": 4,
                "preference_practicality_receiving": 3,
                "preference_novelty_giving": 5,
                "preference_novelty_receiving": 2,
                "preference_thoughtfulness_giving": 3,
                "preference_thoughtfulness_receiving": 5,
                "preferred_interests": ["Coffee", "Tech", "Books"],
                "we_hate_being_stolen_from": 2,
                "we_enjoy_stealing": 4,
                "exclusions": ["uuid_user_5"]
            }
        }
    )
