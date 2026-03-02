from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import date

# Properties to receive via API on creation
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    # Role will be set by the system, not directly by user upon registration
    # For initial patient registration, role can be defaulted to 'patient'

# Properties to receive via API on login
class UserLogin(BaseModel):
    username: str
    password: str
    organization: str
    role: str


class PasswordSetupConfirm(BaseModel):
    token: str
    password: str = Field(..., min_length=8)


class DoctorInviteCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    specialization: str = Field(..., min_length=1, max_length=100)
    phone_number: Optional[str] = None


class StaffInviteCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    job_title: str = Field(..., min_length=1, max_length=100)


class PatientCodeSignup(BaseModel):
    patient_code: str = Field(..., min_length=5, max_length=20)
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    date_of_birth: date

# Properties to return via API
class UserInDBBase(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

# Additional properties to return via API for User
class User(UserInDBBase):
    pass

# Token schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Token data stored in the JWT
class TokenData(BaseModel):
    username: Optional[str] = None
