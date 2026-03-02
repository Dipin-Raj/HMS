from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from backend.app.core.database import Base


class AdminEmailSettings(Base):
    __tablename__ = "admin_email_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    smtp_host = Column(String(255), nullable=False)
    smtp_port = Column(Integer, nullable=False, default=587)
    smtp_username = Column(String(255), nullable=False)
    smtp_password_encrypted = Column(String(1024), nullable=False)
    from_email = Column(String(255), nullable=False)
    from_name = Column(String(255), nullable=False, default="HMS-AI")
    use_tls = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
