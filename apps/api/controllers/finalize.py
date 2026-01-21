"""
Finalize Controller

Handles POST /finalize_group endpoint for generating final pairings/play order.
"""
from fastapi import APIRouter, HTTPException
from models.requests import FinalizeGroupRequest
from models.responses import FinalizeResponse, ErrorResponse
from services import matching_service

router = APIRouter()

VALID_RULESETS = ["Random Matching", "Max Utility", "Max Fairness", "White Elephant"]


@router.post(
    "/finalize_group",
    response_model=FinalizeResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Generate final pairings for chosen ruleset",
    description="""
    Generates the final gift exchange assignments for the chosen ruleset.

    For Secret Santa variants (Random, Max Utility, Max Fairness):
    - Returns pairings: Dict[giver_id, receiver_id]

    For White Elephant:
    - Returns play_order: List[user_id] in the order they should play

    This is called once after the admin has reviewed statistics from /recalculate
    and chosen their preferred ruleset.
    """
)
async def finalize_group(request: FinalizeGroupRequest) -> FinalizeResponse:
    """
    Generate final pairings or play order.

    Args:
        request: FinalizeGroupRequest with group_id, ruleset, preferences, and optional seed

    Returns:
        FinalizeResponse with pairings or play_order

    Raises:
        HTTPException: If validation fails or algorithms error
    """
    try:
        # Validate minimum number of users
        if len(request.preferences) < 2:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "InvalidInput",
                    "message": "At least 2 users are required for matching",
                    "details": {"num_users": len(request.preferences)}
                }
            )

        # Validate ruleset
        if request.ruleset not in VALID_RULESETS:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "InvalidRuleset",
                    "message": f"Invalid ruleset. Must be one of: {', '.join(VALID_RULESETS)}",
                    "details": {"provided_ruleset": request.ruleset, "valid_rulesets": VALID_RULESETS}
                }
            )

        # Generate final matching/play order
        result = matching_service.finalize_matching(
            ruleset=request.ruleset,
            preferences=request.preferences,
            seed=request.seed
        )

        # Update group_id from request
        result.group_id = request.group_id

        return result

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except ValueError as e:
        # Handle validation errors from service layer
        raise HTTPException(
            status_code=400,
            detail={
                "error": "ValidationError",
                "message": str(e),
                "details": {}
            }
        )

    except Exception as e:
        # Catch any other errors
        raise HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError",
                "message": f"Failed to generate final matching: {str(e)}",
                "details": {}
            }
        )
