from typing import List, Optional
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from backend.app.core.database import get_db
from backend.app.dependencies import get_current_active_patient, get_current_active_admin
from backend.app.models.user import User as DBUser
from backend.app.models.patient import Patient as DBPatient
from backend.app.models.medical_record import MedicalRecord as DBMedicalRecord
from backend.app.models.appointment import Appointment as DBAppointment
from backend.app.models.doctor import Doctor as DBDoctor
from backend.app.schemas.patient import (
    Patient as SchemaPatient,
    PatientCreate,
    PatientUpdate,
)
from backend.app.schemas.appointment import Appointment as SchemaAppointment
from backend.app.schemas.medical_record import (
    MedicalRecord as SchemaMedicalRecord,
)  # Assuming this schema exists or will be created

router = APIRouter()


def _generate_patient_code(patient_id: int) -> str:
    return f"PID{patient_id:05d}"

@router.get("/me", response_model=SchemaPatient)
def read_patient_me(current_user: DBUser = Depends(get_current_active_patient), db: Session = Depends(get_db)):
    patient = db.query(DBPatient).filter(DBPatient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    return patient

@router.get("/me/medical-records", response_model=List[SchemaMedicalRecord])
def read_patient_medical_records(
    current_user: DBUser = Depends(get_current_active_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(DBPatient).filter(DBPatient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    medical_records = (
        db.query(DBMedicalRecord)
        .options(joinedload(DBMedicalRecord.doctor)) # Eager load doctor information
        .filter(DBMedicalRecord.patient_id == patient.id)
        .all()
    )
    return medical_records

@router.get("/me/appointments", response_model=List[SchemaAppointment])
def read_patient_appointments(
    current_user: DBUser = Depends(get_current_active_patient),
    db: Session = Depends(get_db)
):
    patient = db.query(DBPatient).filter(DBPatient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    appointments = (
        db.query(DBAppointment)
        .options(joinedload(DBAppointment.doctor)) # Eager load doctor information
        .filter(DBAppointment.patient_id == patient.id)
        .all()
    )
    return appointments

@router.get("", response_model=List[SchemaPatient])
def read_patients(
    skip: int = 0,
    limit: int = 100,
    gender: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can view all patients
):
    query = db.query(DBPatient)

    if gender:
        query = query.filter(DBPatient.gender == gender)
    
    patients = query.offset(skip).limit(limit).all()
    return patients

@router.post("", response_model=SchemaPatient, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: PatientCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can create patients
):
    if patient_in.user_id is not None:
        user_exists = db.query(DBUser).filter(DBUser.id == patient_in.user_id).first()
        if not user_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found. A patient must be linked to an existing user.",
            )

        existing_patient = db.query(DBPatient).filter(DBPatient.user_id == patient_in.user_id).first()
        if existing_patient:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has a patient profile.",
            )

    payload = patient_in.dict()
    payload["patient_code"] = f"TEMP{secrets.token_hex(8)}"
    db_patient = DBPatient(**payload)
    db.add(db_patient)
    db.flush()
    db_patient.patient_code = _generate_patient_code(db_patient.id)
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.put("/{patient_id}", response_model=SchemaPatient)
def update_patient(
    patient_id: int,
    patient_in: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can update patients
):
    db_patient = db.query(DBPatient).filter(DBPatient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    for field, value in patient_in.dict(exclude_unset=True).items():
        setattr(db_patient, field, value)
    
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can delete patients
):
    db_patient = db.query(DBPatient).filter(DBPatient.id == patient_id).first()
    if not db_patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    db.delete(db_patient)
    db.commit()
    return {"message": "Patient deleted successfully"}
