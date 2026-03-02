from pydantic import BaseModel, EmailStr, Field


class AdminEmailSettingsUpdate(BaseModel):
    smtp_host: str = Field(..., min_length=1, max_length=255)
    smtp_port: int = Field(587, ge=1, le=65535)
    smtp_username: str = Field(..., min_length=1, max_length=255)
    smtp_password: str | None = Field(None, min_length=1, max_length=512)
    from_email: EmailStr
    from_name: str = Field("HMS-AI", min_length=1, max_length=255)
    use_tls: bool = True


class AdminEmailSettingsView(BaseModel):
    is_configured: bool
    smtp_host: str | None = None
    smtp_port: int | None = None
    smtp_username: str | None = None
    from_email: EmailStr | None = None
    from_name: str | None = None
    use_tls: bool | None = None


class TestEmailPayload(BaseModel):
    recipient_email: EmailStr
