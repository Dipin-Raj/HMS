from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.user import User

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    specialization = Column(String(100), nullable=False)
    phone_number = Column(String(20))
    current_status = Column(String(30), nullable=False, default="off-duty")
    status_note = Column(String(255))
    status_updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="doctor", uselist=False)

    def __repr__(self):
        return f"<Doctor(name='{self.first_name} {self.last_name}', specialization='{self.specialization}')>"
