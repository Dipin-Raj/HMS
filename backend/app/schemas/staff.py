from typing import Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties
class StaffBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    job_title: Optional[str] = None
    current_status: Optional[str] = None
    status_note: Optional[str] = None
    status_updated_at: Optional[datetime] = None

# Properties to receive via API on creation
class StaffCreate(StaffBase):
    first_name: str
    last_name: str
    job_title: str
    user_id: int # This will be linked to an existing user

# Properties to receive via API on update
class StaffUpdate(StaffBase):
    pass

# Properties to return via API
class StaffInDBBase(StaffBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Additional properties to return via API
class Staff(StaffInDBBase):
    pass

class StaffStatusUpdate(BaseModel):
    current_status: str
    status_note: Optional[str] = None
