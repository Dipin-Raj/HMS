import smtplib
from email.message import EmailMessage

from backend.app.core.config import get_settings


settings = get_settings()


class SMTPConfig:
    def __init__(
        self,
        smtp_host: str,
        smtp_port: int,
        smtp_username: str,
        smtp_password: str,
        from_email: str,
        from_name: str,
        use_tls: bool,
    ) -> None:
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.smtp_username = smtp_username
        self.smtp_password = smtp_password
        self.from_email = from_email
        self.from_name = from_name
        self.use_tls = use_tls


def send_account_setup_email(
    smtp_config: SMTPConfig,
    recipient_email: str,
    display_name: str,
    setup_link: str,
    role_label: str,
) -> None:
    message = EmailMessage()
    message["Subject"] = f"Set up your HMS {role_label} account"
    message["From"] = f"{smtp_config.from_name} <{smtp_config.from_email}>"
    message["To"] = recipient_email
    message.set_content(
        "\n".join(
            [
                f"Hello {display_name},",
                "",
                "Your account has been created by the HMS administrator.",
                "Use the link below to set your password:",
                setup_link,
                "",
                f"This link expires in {settings.DOCTOR_INVITE_EXPIRY_HOURS} hours and can only be used once.",
            ]
        )
    )

    with smtplib.SMTP(smtp_config.smtp_host, smtp_config.smtp_port) as server:
        if smtp_config.use_tls:
            server.starttls()
        server.login(smtp_config.smtp_username, smtp_config.smtp_password)
        server.send_message(message)


def send_doctor_invite_email(
    smtp_config: SMTPConfig,
    recipient_email: str,
    username: str,
    setup_link: str,
) -> None:
    send_account_setup_email(
        smtp_config=smtp_config,
        recipient_email=recipient_email,
        display_name=f"Dr. {username}",
        setup_link=setup_link,
        role_label="doctor",
    )


def send_staff_invite_email(
    smtp_config: SMTPConfig,
    recipient_email: str,
    username: str,
    setup_link: str,
) -> None:
    send_account_setup_email(
        smtp_config=smtp_config,
        recipient_email=recipient_email,
        display_name=username,
        setup_link=setup_link,
        role_label="staff",
    )


def send_test_email(smtp_config: SMTPConfig, recipient_email: str) -> None:
    message = EmailMessage()
    message["Subject"] = "HMS SMTP configuration test"
    message["From"] = f"{smtp_config.from_name} <{smtp_config.from_email}>"
    message["To"] = recipient_email
    message.set_content("SMTP settings are configured correctly.")

    with smtplib.SMTP(smtp_config.smtp_host, smtp_config.smtp_port) as server:
        if smtp_config.use_tls:
            server.starttls()
        server.login(smtp_config.smtp_username, smtp_config.smtp_password)
        server.send_message(message)
