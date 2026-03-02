from typing import Optional
from pydantic import BaseModel
from datetime import date

# Shared properties
class MedicalRecordBase(BaseModel):
    patient_id: Optional[int] = None
    doctor_id: Optional[int] = None
    visit_date: Optional[date] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None

# Properties to receive via API on creation
class MedicalRecordCreate(MedicalRecordBase):
    patient_id: int
    doctor_id: int
    visit_date: date
    diagnosis: str

# Properties to receive via API on update
class MedicalRecordUpdate(MedicalRecordBase):
    pass

# Properties to return via API
class MedicalRecordInDBBase(MedicalRecordBase):
    id: int

    class Config:
        from_attributes = True

# Additional properties to return via API
class MedicalRecord(MedicalRecordInDBBase):
    pass
