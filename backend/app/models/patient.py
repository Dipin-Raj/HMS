from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.user import User

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    patient_code = Column(String(20), unique=True, index=True, nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10))
    phone_number = Column(String(20))
    address = Column(Text)

    user = relationship("User", backref="patient", uselist=False)

    def __repr__(self):
        return f"<Patient(name='{self.first_name} {self.last_name}', user_id='{self.user_id}')>"
