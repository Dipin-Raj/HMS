from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class DoctorBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    specialization: Optional[str] = None
    phone_number: Optional[str] = None
    current_status: Optional[str] = None
    status_note: Optional[str] = None
    status_updated_at: Optional[datetime] = None

# Properties to receive via API on creation
class DoctorCreate(DoctorBase):
    first_name: str
    last_name: str
    specialization: str
    user_id: int # This will be linked to an existing user

# Properties to receive via API on update
class DoctorUpdate(DoctorBase):
    pass

# Properties to return via API
class DoctorInDBBase(DoctorBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Additional properties to return via API
class Doctor(DoctorInDBBase):
    pass

class DoctorStatusUpdate(BaseModel):
    current_status: str
    status_note: Optional[str] = None
