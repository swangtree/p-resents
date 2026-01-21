"""
Pydantic models for API responses.
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, List, Optional, Any
from datetime import datetime


class UserStats(BaseModel):
    """Statistics for an individual user."""
    expected_utility: Optional[float] = Field(None, description="Expected utility for this user")
    variance: Optional[float] = Field(None, description="Variance in utility")
    avg_utility: Optional[float] = Field(None, description="Average utility (for simulations)")
    utility_standard_deviation: Optional[float] = Field(None, description="Standard deviation of utility")
    times_stolen_from_pct: Optional[float] = Field(None, description="Percentage of times stolen from (White Elephant)")
    times_stole_pct: Optional[float] = Field(None, description="Percentage of times stole (White Elephant)")


class RulesetStats(BaseModel):
    """Statistics for one matching algorithm/ruleset."""
    group_satisfaction_score: float = Field(..., description="Overall group satisfaction")
    group_fairness_score: float = Field(..., description="Fairness metric (lower variance = more fair)")
    min_utility: Optional[float] = Field(None, description="Minimum utility score")
    max_utility: Optional[float] = Field(None, description="Maximum utility score")
    std_dev: float = Field(..., description="Standard deviation of utilities")
    user_stats: Dict[str, UserStats] = Field(default_factory=dict, description="Per-user statistics")

    # White Elephant specific
    avg_steals_per_game: Optional[float] = Field(None, description="Average steals per game (White Elephant)")
    max_steals_observed: Optional[int] = Field(None, description="Max steals observed (White Elephant)")
    simulations_run: Optional[int] = Field(None, description="Number of simulations run (White Elephant)")


class RecalculateResponse(BaseModel):
    """
    Response from /recalculate endpoint.

    Contains statistics for all rulesets to help admin choose.
    """
    group_id: str = Field(..., description="UUID of the group")
    rulesets: Dict[str, RulesetStats] = Field(..., description="Statistics for each ruleset")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "group_id": "group_uuid_123",
                "rulesets": {
                    "Random Matching": {
                        "group_satisfaction_score": 5.5,
                        "group_fairness_score": 9.1,
                        "min_utility": 1.0,
                        "max_utility": 10.0,
                        "std_dev": 2.3,
                        "user_stats": {
                            "uuid_user_1": {
                                "expected_utility": 5.5,
                                "variance": 2.3
                            }
                        }
                    },
                    "Max Utility": {
                        "group_satisfaction_score": 8.7,
                        "group_fairness_score": 6.2,
                        "min_utility": 3.0,
                        "max_utility": 10.0,
                        "std_dev": 1.8,
                        "user_stats": {}
                    }
                }
            }
        }
    )


class FinalizeResponse(BaseModel):
    """
    Response from /finalize_group endpoint.

    Contains final pairings or play order for the chosen ruleset.
    """
    group_id: str = Field(..., description="UUID of the group")
    ruleset: str = Field(..., description="Chosen ruleset")
    pairings: Optional[Dict[str, str]] = Field(None, description="Final pairings (giver_id -> receiver_id) for Secret Santa")
    play_order: Optional[List[str]] = Field(None, description="Play order (list of user_ids) for White Elephant")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "group_id": "group_uuid_123",
                "ruleset": "Max Utility",
                "pairings": {
                    "uuid_user_1": "uuid_user_2",
                    "uuid_user_2": "uuid_user_1"
                },
                "play_order": None,
                "metadata": {
                    "total_utility": 42.5,
                    "timestamp": "2025-11-08T12:00:00Z"
                }
            }
        }
    )


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "error": "InvalidInput",
                "message": "Preference values must be between 1 and 5",
                "details": {
                    "field": "preference_practicality_giving",
                    "value": 6
                }
            }
        }
    )
