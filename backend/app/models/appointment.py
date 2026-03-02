from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    appointment_time = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default="scheduled") # e.g., 'scheduled', 'completed', 'cancelled'
    notes = Column(Text)

    patient = relationship("Patient", backref="appointments")
    doctor = relationship("Doctor", backref="appointments")

    def __repr__(self):
        return f"<Appointment(patient_id='{self.patient_id}', doctor_id='{self.doctor_id}', time='{self.appointment_time}')>"
