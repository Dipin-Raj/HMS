from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class AppointmentBase(BaseModel):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    appointment_time: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

# Properties to receive via API on creation
class AppointmentCreate(AppointmentBase):
    patient_id: int
    doctor_id: int
    appointment_time: datetime

# Properties to receive via API on update
class AppointmentUpdate(AppointmentBase):
    pass

# Nested schemas for related data
class PatientPublic(BaseModel):
    id: int
    first_name: str
    last_name: str

    class Config:
        from_attributes = True

class DoctorPublic(BaseModel):
    id: int
    first_name: str
    last_name: str
    specialization: str

    class Config:
        from_attributes = True

# Properties to return via API
class AppointmentInDBBase(AppointmentBase):
    id: int

    class Config:
        from_attributes = True

# Additional properties to return via API, including nested patient and doctor info
class Appointment(AppointmentInDBBase):
    patient: PatientPublic
    doctor: DoctorPublic
