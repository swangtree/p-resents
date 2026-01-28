"""
Email Service

Handles sending email notifications using Resend API.
"""
import os
from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class EmailRecipient:
    """Represents an email recipient with user info."""
    email: str
    user_id: str
    name: Optional[str] = None


@dataclass
class EmailResult:
    """Result of sending an email."""
    email: str
    success: bool
    error: Optional[str] = None


class EmailService:
    """Service for sending email notifications via Resend."""

    def __init__(self):
        self.api_key = os.environ.get("RESEND_API_KEY")
        self.from_email = os.environ.get("EMAIL_FROM", "P-resents <noreply@presents.dev>")
        self.app_url = os.environ.get("APP_URL", "http://localhost:3000")
        self._client = None

    @property
    def client(self):
        """Lazy load the Resend client."""
        if self._client is None and self.api_key:
            import resend
            resend.api_key = self.api_key
            self._client = resend
        return self._client

    @property
    def is_configured(self) -> bool:
        """Check if email service is properly configured."""
        return bool(self.api_key)

    def send_secret_santa_notification(
        self,
        recipient: EmailRecipient,
        receiver_name: str,
        utility_score: float,
        group_name: str,
        ruleset: str,
    ) -> EmailResult:
        """
        Send Secret Santa match notification email.

        Args:
            recipient: The email recipient (giver)
            receiver_name: Name of the person they're giving to
            utility_score: Match quality score
            group_name: Name of the group
            ruleset: Algorithm used

        Returns:
            EmailResult with success/failure status
        """
        if not self.is_configured:
            return EmailResult(
                email=recipient.email,
                success=False,
                error="Email service not configured (RESEND_API_KEY missing)"
            )

        subject = f"Your Secret Santa match is ready! - {group_name}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Open Sans', Arial, sans-serif; background-color: #1a1a2e; color: #f5f5f5; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #262640; border-radius: 16px; padding: 32px; }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .header h1 {{ color: #ff69b4; font-size: 28px; margin: 0; }}
                .match-card {{ background: linear-gradient(135deg, #ff69b4 0%, #ff8c00 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }}
                .match-card h2 {{ color: white; font-size: 24px; margin: 0 0 8px 0; }}
                .match-card .name {{ color: white; font-size: 32px; font-weight: bold; margin: 16px 0; }}
                .match-card .score {{ color: rgba(255,255,255,0.8); font-size: 14px; }}
                .info {{ color: #888; font-size: 14px; margin-top: 16px; }}
                .button {{ display: inline-block; background-color: #4ade80; color: #1a1a2e; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 24px; }}
                .footer {{ text-align: center; margin-top: 32px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎁 P-resents</h1>
                    <p>Your Secret Santa match has been finalized!</p>
                </div>

                <div class="match-card">
                    <h2>You're giving a gift to:</h2>
                    <div class="name">{receiver_name}</div>
                    <div class="score">Match Quality Score: {utility_score:.2f}</div>
                </div>

                <div class="info">
                    <p><strong>Group:</strong> {group_name}</p>
                    <p><strong>Algorithm:</strong> {ruleset}</p>
                </div>

                <div style="text-align: center;">
                    <a href="{self.app_url}/results" class="button">View Your Match</a>
                </div>

                <div class="footer">
                    <p>Happy gifting! 🎄</p>
                    <p>This email was sent by P-resents. If you didn't expect this email, you can safely ignore it.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            self.client.Emails.send({
                "from": self.from_email,
                "to": [recipient.email],
                "subject": subject,
                "html": html_content,
            })
            return EmailResult(email=recipient.email, success=True)
        except Exception as e:
            return EmailResult(
                email=recipient.email,
                success=False,
                error=str(e)
            )

    def send_white_elephant_notification(
        self,
        recipient: EmailRecipient,
        position: int,
        total_players: int,
        group_name: str,
    ) -> EmailResult:
        """
        Send White Elephant play order notification email.

        Args:
            recipient: The email recipient
            position: Their position in the play order (1-indexed)
            total_players: Total number of players
            group_name: Name of the group

        Returns:
            EmailResult with success/failure status
        """
        if not self.is_configured:
            return EmailResult(
                email=recipient.email,
                success=False,
                error="Email service not configured (RESEND_API_KEY missing)"
            )

        subject = f"Your White Elephant play order is ready! - {group_name}"

        # Position-based messaging
        if position == 1:
            position_msg = "You're picking first! You'll open a new gift to start the game."
        elif position == total_players:
            position_msg = "You're picking last! You'll have the most options to steal from."
        else:
            position_msg = f"You're somewhere in the middle - a balanced position with good options!"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: 'Open Sans', Arial, sans-serif; background-color: #1a1a2e; color: #f5f5f5; padding: 20px; }}
                .container {{ max-width: 600px; margin: 0 auto; background-color: #262640; border-radius: 16px; padding: 32px; }}
                .header {{ text-align: center; margin-bottom: 24px; }}
                .header h1 {{ color: #ffd700; font-size: 28px; margin: 0; }}
                .order-card {{ background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }}
                .order-card h2 {{ color: #1a1a2e; font-size: 20px; margin: 0 0 8px 0; }}
                .order-card .position {{ color: #1a1a2e; font-size: 64px; font-weight: bold; margin: 16px 0; }}
                .order-card .total {{ color: rgba(26,26,46,0.7); font-size: 16px; }}
                .position-msg {{ background-color: #333350; border-radius: 8px; padding: 16px; margin: 16px 0; }}
                .info {{ color: #888; font-size: 14px; margin-top: 16px; }}
                .button {{ display: inline-block; background-color: #4ade80; color: #1a1a2e; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 24px; }}
                .footer {{ text-align: center; margin-top: 32px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🐘 P-resents</h1>
                    <p>Your White Elephant play order has been determined!</p>
                </div>

                <div class="order-card">
                    <h2>You're picking position:</h2>
                    <div class="position">#{position}</div>
                    <div class="total">out of {total_players} players</div>
                </div>

                <div class="position-msg">
                    <p>{position_msg}</p>
                </div>

                <div class="info">
                    <p><strong>Group:</strong> {group_name}</p>
                    <p><strong>Game Type:</strong> White Elephant</p>
                </div>

                <div style="text-align: center;">
                    <a href="{self.app_url}/results" class="button">View Details</a>
                </div>

                <div class="footer">
                    <p>Get ready to steal! 🎁</p>
                    <p>This email was sent by P-resents. If you didn't expect this email, you can safely ignore it.</p>
                </div>
            </div>
        </body>
        </html>
        """

        try:
            self.client.Emails.send({
                "from": self.from_email,
                "to": [recipient.email],
                "subject": subject,
                "html": html_content,
            })
            return EmailResult(email=recipient.email, success=True)
        except Exception as e:
            return EmailResult(
                email=recipient.email,
                success=False,
                error=str(e)
            )

    def send_batch_notifications(
        self,
        recipients: List[EmailRecipient],
        group_name: str,
        ruleset: str,
        pairings: Optional[List[Dict]] = None,
        play_order: Optional[List[str]] = None,
    ) -> Dict[str, List[EmailResult]]:
        """
        Send notifications to all recipients based on the ruleset.

        Args:
            recipients: List of email recipients with user_id mapping
            group_name: Name of the group
            ruleset: Algorithm used
            pairings: List of {giver, receiver, utility} dicts for Secret Santa
            play_order: List of user_ids for White Elephant

        Returns:
            Dict with 'success' and 'failed' lists of EmailResults
        """
        results = {"success": [], "failed": []}

        # Create user_id to recipient mapping
        recipient_map = {r.user_id: r for r in recipients}

        if play_order:
            # White Elephant: send play order notifications
            for position, user_id in enumerate(play_order, start=1):
                recipient = recipient_map.get(user_id)
                if recipient:
                    result = self.send_white_elephant_notification(
                        recipient=recipient,
                        position=position,
                        total_players=len(play_order),
                        group_name=group_name,
                    )
                    if result.success:
                        results["success"].append(result)
                    else:
                        results["failed"].append(result)

        elif pairings:
            # Secret Santa: send match notifications
            # Create user_id to name mapping for receiver names
            user_names = {r.user_id: r.name or r.user_id for r in recipients}

            for pairing in pairings:
                giver_id = pairing.get("giver")
                receiver_id = pairing.get("receiver")
                utility = pairing.get("utility", 0)

                recipient = recipient_map.get(giver_id)
                if recipient:
                    receiver_name = user_names.get(receiver_id, receiver_id)
                    result = self.send_secret_santa_notification(
                        recipient=recipient,
                        receiver_name=receiver_name,
                        utility_score=utility,
                        group_name=group_name,
                        ruleset=ruleset,
                    )
                    if result.success:
                        results["success"].append(result)
                    else:
                        results["failed"].append(result)

        return results


# Singleton instance
email_service = EmailService()
