"""
Notifications Controller

Handles POST /send_notifications endpoint for sending email notifications
when matches are finalized.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from services.email_service import email_service, EmailRecipient

router = APIRouter()


class NotificationRecipient(BaseModel):
    """A recipient for email notifications."""
    user_id: str = Field(..., description="User ID")
    email: str = Field(..., description="User's email address")
    name: Optional[str] = Field(None, description="User's display name")


class Pairing(BaseModel):
    """A giver-receiver pairing."""
    giver: str = Field(..., description="Giver user ID")
    receiver: str = Field(..., description="Receiver user ID")
    utility: float = Field(..., description="Match utility score")


class SendNotificationsRequest(BaseModel):
    """Request body for /send_notifications endpoint."""
    group_id: str = Field(..., description="UUID of the group")
    group_name: str = Field(..., description="Name of the group")
    ruleset: str = Field(..., description="Algorithm used for matching")
    recipients: List[NotificationRecipient] = Field(
        ..., min_length=1, description="List of recipients with their emails"
    )
    pairings: Optional[List[Pairing]] = Field(
        None, description="Secret Santa pairings (if applicable)"
    )
    play_order: Optional[List[str]] = Field(
        None, description="White Elephant play order (if applicable)"
    )


class NotificationResult(BaseModel):
    """Result for a single notification."""
    email: str
    success: bool
    error: Optional[str] = None


class SendNotificationsResponse(BaseModel):
    """Response from /send_notifications endpoint."""
    group_id: str
    total_sent: int
    total_failed: int
    success: List[NotificationResult]
    failed: List[NotificationResult]
    message: str


@router.post(
    "/send_notifications",
    response_model=SendNotificationsResponse,
    summary="Send email notifications to group members",
    description="""
    Sends email notifications to all group members after matching is finalized.

    For Secret Santa variants: sends match notification with receiver info
    For White Elephant: sends play order position notification

    Requires RESEND_API_KEY environment variable to be configured.
    """
)
async def send_notifications(request: SendNotificationsRequest) -> SendNotificationsResponse:
    """
    Send email notifications to group members.

    Args:
        request: SendNotificationsRequest with group info and recipient list

    Returns:
        SendNotificationsResponse with success/failure counts

    Raises:
        HTTPException: If email service fails
    """
    # Check if email service is configured
    if not email_service.is_configured:
        # Return success with warning message (non-blocking)
        return SendNotificationsResponse(
            group_id=request.group_id,
            total_sent=0,
            total_failed=0,
            success=[],
            failed=[],
            message="Email notifications skipped: RESEND_API_KEY not configured. "
                    "Group members can still view results by logging in."
        )

    # Convert request recipients to EmailRecipient objects
    recipients = [
        EmailRecipient(
            email=r.email,
            user_id=r.user_id,
            name=r.name
        )
        for r in request.recipients
    ]

    # Convert pairings to dict format if present
    pairings_data = None
    if request.pairings:
        pairings_data = [
            {"giver": p.giver, "receiver": p.receiver, "utility": p.utility}
            for p in request.pairings
        ]

    try:
        # Send batch notifications
        results = email_service.send_batch_notifications(
            recipients=recipients,
            group_name=request.group_name,
            ruleset=request.ruleset,
            pairings=pairings_data,
            play_order=request.play_order,
        )

        success_results = [
            NotificationResult(email=r.email, success=r.success, error=r.error)
            for r in results["success"]
        ]
        failed_results = [
            NotificationResult(email=r.email, success=r.success, error=r.error)
            for r in results["failed"]
        ]

        total_sent = len(success_results)
        total_failed = len(failed_results)

        if total_failed == 0:
            message = f"Successfully sent {total_sent} email notification(s)!"
        elif total_sent == 0:
            message = f"Failed to send all {total_failed} email notification(s). Check configuration."
        else:
            message = f"Sent {total_sent} email(s), {total_failed} failed."

        return SendNotificationsResponse(
            group_id=request.group_id,
            total_sent=total_sent,
            total_failed=total_failed,
            success=success_results,
            failed=failed_results,
            message=message,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "EmailServiceError",
                "message": f"Failed to send notifications: {str(e)}",
                "details": {}
            }
        )
