from sqlalchemy import Column, Integer, String, DateTime, Boolean, text
from sqlalchemy.sql import func
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False) # e.g., 'patient', 'doctor', 'staff', 'admin'
    is_password_set = Column(Boolean, nullable=False, server_default=text("true"))
    invite_token_hash = Column(String(64), nullable=True, index=True)
    invite_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    invite_sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<User(username='{self.username}', role='{self.role}')>"
