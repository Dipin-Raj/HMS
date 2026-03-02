from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.dependencies import get_current_active_staff, get_current_active_admin
from backend.app.models.user import User as DBUser
from backend.app.models.pharmacy import PharmacyStock as DBPharmacyStock, Prescription as DBPrescription
from backend.app.schemas.pharmacy import PharmacyStockCreate, PharmacyStockUpdate, PharmacyStock as SchemaPharmacyStock
from backend.app.models.events import InventoryEvent as DBInventoryEvent

router = APIRouter()

@router.get("/stock", response_model=List[SchemaPharmacyStock])
def get_pharmacy_stock(
    skip: int = 0,
    limit: int = 100,
    medicine_name: Optional[str] = None,
    current_user: DBUser = Depends(get_current_active_staff), # Staff or Admin
    db: Session = Depends(get_db)
):
    query = db.query(DBPharmacyStock)

    if medicine_name:
        query = query.filter(DBPharmacyStock.medicine_name.ilike(f"%{medicine_name}%"))
    
    stock_items = query.offset(skip).limit(limit).all()
    return stock_items

@router.post("/stock", response_model=SchemaPharmacyStock, status_code=status.HTTP_201_CREATED)
def create_pharmacy_stock_item(
    stock_item_in: PharmacyStockCreate,
    current_user: DBUser = Depends(get_current_active_admin), # Only Admin can create new stock types
    db: Session = Depends(get_db)
):
    db_stock_item = db.query(DBPharmacyStock).filter(DBPharmacyStock.medicine_name == stock_item_in.medicine_name).first()
    if db_stock_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medicine with this name already exists in stock. Use PUT to update quantity."
        )
    
    db_stock_item = DBPharmacyStock(**stock_item_in.dict())
    db.add(db_stock_item)
    db.commit()
    db.refresh(db_stock_item)
    db_event = DBInventoryEvent(
        stock_id=db_stock_item.id,
        medicine_name=db_stock_item.medicine_name,
        event_type="stock_created",
        quantity_delta=db_stock_item.quantity,
        payload={"unit_price": str(db_stock_item.unit_price)},
    )
    db.add(db_event)
    db.commit()
    return db_stock_item

@router.put("/stock/{stock_id}", response_model=SchemaPharmacyStock)
def update_pharmacy_stock_item(
    stock_id: int,
    stock_item_in: PharmacyStockUpdate,
    current_user: DBUser = Depends(get_current_active_admin), # Changed from get_current_active_staff
    db: Session = Depends(get_db)
):
    db_stock_item = db.query(DBPharmacyStock).filter(DBPharmacyStock.id == stock_id).first()
    if not db_stock_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock item not found"
        )
    
    previous_quantity = db_stock_item.quantity
    changes = stock_item_in.dict(exclude_unset=True)
    for field, value in changes.items():
        setattr(db_stock_item, field, value)
    
    db.add(db_stock_item)
    db.commit()
    db.refresh(db_stock_item)
    quantity_delta = db_stock_item.quantity - previous_quantity
    db_event = DBInventoryEvent(
        stock_id=db_stock_item.id,
        medicine_name=db_stock_item.medicine_name,
        event_type="stock_adjusted",
        quantity_delta=quantity_delta,
        payload={"changes": changes, "previous_quantity": previous_quantity},
    )
    db.add(db_event)
    db.commit()
    return db_stock_item

@router.delete("/stock/{stock_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pharmacy_stock_item(
    stock_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can delete stock items
):
    db_stock_item = db.query(DBPharmacyStock).filter(DBPharmacyStock.id == stock_id).first()
    if not db_stock_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock item not found"
        )
    
    db_event = DBInventoryEvent(
        stock_id=db_stock_item.id,
        medicine_name=db_stock_item.medicine_name,
        event_type="stock_deleted",
        quantity_delta=-db_stock_item.quantity,
        payload={"quantity": db_stock_item.quantity},
    )
    db.add(db_event)
    db.delete(db_stock_item)
    db.commit()
    return {"message": "Stock item deleted successfully"}

@router.get("/demand-forecast", response_model=Dict[str, Any])
def get_medicine_demand_forecast(
    current_user: DBUser = Depends(get_current_active_admin)
):
    # Placeholder for AI-based medicine demand forecasting
    return {
        "forecast": [
            {"medicine_name": "Paracetamol", "predicted_demand_units_next_month": 1200, "confidence": 0.92},
            {"medicine_name": "Amoxicillin", "predicted_demand_units_next_month": 500, "confidence": 0.88},
        ],
        "message": "AI medicine demand forecast model not yet integrated. Showing placeholder data."
    }
