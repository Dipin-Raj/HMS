from typing import Optional
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

# --- Pharmacy Stock Schemas ---
class PharmacyStockBase(BaseModel):
    medicine_name: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None

class PharmacyStockCreate(PharmacyStockBase):
    medicine_name: str
    quantity: int
    unit_price: Decimal

class PharmacyStockUpdate(PharmacyStockBase):
    pass

class PharmacyStockInDBBase(PharmacyStockBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True

class PharmacyStock(PharmacyStockInDBBase):
    pass

# --- Prescription Schemas ---
class PrescriptionBase(BaseModel):
    medical_record_id: Optional[int] = None
    medicine_name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    medical_record_id: int
    medicine_name: str

class PrescriptionUpdate(PrescriptionBase):
    pass

class PrescriptionInDBBase(PrescriptionBase):
    id: int

    class Config:
        from_attributes = True

class Prescription(PrescriptionInDBBase):
    pass
