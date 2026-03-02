from sqlalchemy.orm import Session
from backend.app.models.pharmacy import PharmacyStock as DBPharmacyStock, Prescription as DBPrescription
from backend.app.models.medical_record import MedicalRecord as DBMedicalRecord
from backend.app.schemas.pharmacy import PharmacyStockCreate, PharmacyStockUpdate, PrescriptionCreate, PrescriptionUpdate

class PharmacyService:
    def __init__(self, db: Session):
        self.db = db

    def get_stock_item(self, stock_id: int):
        return self.db.query(DBPharmacyStock).filter(DBPharmacyStock.id == stock_id).first()

    def get_stock_by_name(self, medicine_name: str):
        return self.db.query(DBPharmacyStock).filter(DBPharmacyStock.medicine_name == medicine_name).first()

    def get_all_stock(self):
        return self.db.query(DBPharmacyStock).all()

    def create_stock_item(self, stock_item_in: PharmacyStockCreate) -> DBPharmacyStock:
        db_stock_item = DBPharmacyStock(**stock_item_in.dict())
        self.db.add(db_stock_item)
        self.db.commit()
        self.db.refresh(db_stock_item)
        return db_stock_item

    def update_stock_item(self, stock_id: int, stock_item_in: PharmacyStockUpdate) -> DBPharmacyStock:
        db_stock_item = self.get_stock_item(stock_id)
        if db_stock_item:
            for field, value in stock_item_in.dict(exclude_unset=True).items():
                setattr(db_stock_item, field, value)
            self.db.add(db_stock_item)
            self.db.commit()
            self.db.refresh(db_stock_item)
        return db_stock_item

    def deduct_stock_for_prescription(self, prescription_in: PrescriptionCreate):
        # This function would be called when a prescription is filled
        stock_item = self.get_stock_by_name(prescription_in.medicine_name)
        if not stock_item:
            raise ValueError(f"Medicine '{prescription_in.medicine_name}' not found in stock.")
        
        # Assuming dosage implies one unit for simplicity, in a real system this would be parsed
        # For now, let's deduct 1 unit per prescription
        if stock_item.quantity < 1: # Or parse dosage quantity
            raise ValueError(f"Not enough stock for '{prescription_in.medicine_name}'.")
        
        stock_item.quantity -= 1
        self.db.add(stock_item)
        
        db_prescription = DBPrescription(**prescription_in.dict())
        self.db.add(db_prescription)

        self.db.commit()
        self.db.refresh(stock_item)
        self.db.refresh(db_prescription)
        return {"stock_item": stock_item, "prescription": db_prescription}

    def get_prescription(self, prescription_id: int):
        return self.db.query(DBPrescription).filter(DBPrescription.id == prescription_id).first()

    def get_prescriptions_for_medical_record(self, medical_record_id: int):
        return self.db.query(DBPrescription).filter(DBPrescription.medical_record_id == medical_record_id).all()
