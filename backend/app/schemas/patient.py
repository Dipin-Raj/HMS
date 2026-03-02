from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import date

# Shared properties
class PatientBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

# Properties to receive via API on creation
class PatientCreate(PatientBase):
    first_name: str
    last_name: str
    date_of_birth: date
    user_id: Optional[int] = None

# Properties to receive via API on update
class PatientUpdate(PatientBase):
    pass

# Properties to return via API
class PatientInDBBase(PatientBase):
    id: int
    user_id: Optional[int] = None
    patient_code: str

    class Config:
        from_attributes = True

# Additional properties to return via API
class Patient(PatientInDBBase):
    pass
