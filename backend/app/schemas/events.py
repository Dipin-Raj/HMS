from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class AppointmentEventBase(BaseModel):
    appointment_id: int
    patient_id: int
    doctor_id: int
    event_type: str
    event_time: Optional[datetime] = None
    payload: Optional[Dict[str, Any]] = None


class AppointmentEventCreate(AppointmentEventBase):
    pass


class AppointmentEvent(AppointmentEventBase):
    id: int

    class Config:
        from_attributes = True


class AttendanceEventBase(BaseModel):
    staff_id: int
    event_type: str
    event_time: Optional[datetime] = None
    payload: Optional[Dict[str, Any]] = None


class AttendanceEventCreate(AttendanceEventBase):
    pass


class AttendanceEvent(AttendanceEventBase):
    id: int

    class Config:
        from_attributes = True


class InventoryEventBase(BaseModel):
    stock_id: int
    medicine_name: str
    event_type: str
    quantity_delta: int
    event_time: Optional[datetime] = None
    payload: Optional[Dict[str, Any]] = None


class InventoryEventCreate(InventoryEventBase):
    pass


class InventoryEvent(InventoryEventBase):
    id: int

    class Config:
        from_attributes = True


class PatientVitalBase(BaseModel):
    patient_id: int
    vital_type: str
    value: str
    unit: Optional[str] = None
    source: Optional[str] = None
    recorded_at: Optional[datetime] = None
    payload: Optional[Dict[str, Any]] = None


class PatientVitalCreate(PatientVitalBase):
    pass


class PatientVital(PatientVitalBase):
    id: int

    class Config:
        from_attributes = True


class DoctorStatusEventBase(BaseModel):
    doctor_id: int
    event_type: str
    event_time: Optional[datetime] = None
    payload: Optional[Dict[str, Any]] = None


class DoctorStatusEvent(DoctorStatusEventBase):
    id: int

    class Config:
        from_attributes = True


class StaffStatusEventBase(BaseModel):
    staff_id: int
    event_type: str
    event_time: Optional[datetime] = None
    payload: Optional[Dict[str, Any]] = None


class StaffStatusEvent(StaffStatusEventBase):
    id: int

    class Config:
        from_attributes = True
