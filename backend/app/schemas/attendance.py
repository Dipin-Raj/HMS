from typing import Optional
from pydantic import BaseModel
from datetime import datetime, date

# Shared properties
class AttendanceBase(BaseModel):
    staff_id: Optional[int] = None
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    date: Optional[date] = None

# Properties to receive via API on creation
class AttendanceCreate(AttendanceBase):
    staff_id: int
    check_in_time: datetime
    date: date

# Properties to receive via API on update
class AttendanceUpdate(AttendanceBase):
    pass

# Properties to return via API
class AttendanceInDBBase(AttendanceBase):
    id: int

    class Config:
        from_attributes = True

# Additional properties to return via API
class Attendance(AttendanceInDBBase):
    pass
