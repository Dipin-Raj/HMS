from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    visit_date = Column(Date, nullable=False)
    diagnosis = Column(Text, nullable=False)
    treatment = Column(Text)
    notes = Column(Text)

    patient = relationship("Patient", backref="medical_records")
    doctor = relationship("Doctor", backref="medical_records")

    def __repr__(self):
        return f"<MedicalRecord(patient_id='{self.patient_id}', visit_date='{self.visit_date}')>"
