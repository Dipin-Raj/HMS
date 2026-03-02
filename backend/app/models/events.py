from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from backend.app.core.database import Base


class AppointmentEvent(Base):
    __tablename__ = "appointment_events"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    event_time = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True, nullable=False)
    payload = Column(JSON, nullable=True)


class AttendanceEvent(Base):
    __tablename__ = "attendance_events"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    event_time = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True, nullable=False)
    payload = Column(JSON, nullable=True)


class InventoryEvent(Base):
    __tablename__ = "inventory_events"

    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("pharmacy_stock.id"), nullable=False)
    medicine_name = Column(String(100), nullable=False)
    event_type = Column(String(50), nullable=False)
    quantity_delta = Column(Integer, nullable=False)
    event_time = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True, nullable=False)
    payload = Column(JSON, nullable=True)


class PatientVital(Base):
    __tablename__ = "patient_vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    vital_type = Column(String(50), nullable=False)
    value = Column(String(50), nullable=False)
    unit = Column(String(20), nullable=True)
    source = Column(String(50), nullable=True)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True, nullable=False)
    payload = Column(JSON, nullable=True)


class DoctorStatusEvent(Base):
    __tablename__ = "doctor_status_events"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    event_time = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True, nullable=False)
    payload = Column(JSON, nullable=True)


class StaffStatusEvent(Base):
    __tablename__ = "staff_status_events"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    event_time = Column(DateTime(timezone=True), server_default=func.now(), primary_key=True, nullable=False)
    payload = Column(JSON, nullable=True)
