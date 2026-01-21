"""
Recalculate Controller

Handles POST /recalculate endpoint for running all algorithms and returning statistics.
"""
from fastapi import APIRouter, HTTPException
from models.requests import RecalculateRequest
from models.responses import RecalculateResponse, ErrorResponse
from services import matching_service

router = APIRouter()


@router.post(
    "/recalculate",
    response_model=RecalculateResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        422: {"model": ErrorResponse, "description": "Validation error"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    },
    summary="Calculate statistics for all rulesets",
    description="""
    Runs all matching algorithms (Random, Max Utility, Max Fairness, White Elephant)
    and returns statistics for comparison. This helps admins choose which ruleset to use.

    The endpoint does NOT return actual pairings - only statistics for comparison.
    Use /finalize_group to get actual pairings after choosing a ruleset.
    """
)
async def recalculate(request: RecalculateRequest) -> RecalculateResponse:
    """
    Calculate statistics for all rulesets.

    Args:
        request: RecalculateRequest with group_id and preferences

    Returns:
        RecalculateResponse with statistics for all rulesets

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

        # Run all algorithms
        rulesets = matching_service.run_all_algorithms(request.preferences)

        # Return response
        return RecalculateResponse(
            group_id=request.group_id,
            rulesets=rulesets
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        # Catch any other errors
        raise HTTPException(
            status_code=500,
            detail={
                "error": "InternalServerError",
                "message": f"Failed to calculate statistics: {str(e)}",
                "details": {}
            }
        )
