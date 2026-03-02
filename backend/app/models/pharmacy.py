from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, DECIMAL
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class PharmacyStock(Base):
    __tablename__ = "pharmacy_stock"

    id = Column(Integer, primary_key=True, index=True)
    medicine_name = Column(String(100), unique=True, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False)
    last_updated = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        return f"<PharmacyStock(medicine='{self.medicine_name}', quantity='{self.quantity}')>"

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    medical_record_id = Column(Integer, ForeignKey("medical_records.id"), nullable=False)
    medicine_name = Column(String(100), nullable=False)
    dosage = Column(String(50))
    frequency = Column(String(50))
    duration = Column(String(50))

    medical_record = relationship("MedicalRecord", backref="prescriptions")

    def __repr__(self):
        return f"<Prescription(medicine='{self.medicine_name}', medical_record_id='{self.medical_record_id}')>"
