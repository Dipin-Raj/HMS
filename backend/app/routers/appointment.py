from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.dependencies import (
    get_current_active_user,
    get_current_active_patient,
    get_current_active_doctor,
    get_current_active_admin,
)
from backend.app.models.user import User as DBUser
from backend.app.models.appointment import Appointment as DBAppointment
from backend.app.models.events import AppointmentEvent as DBAppointmentEvent
from backend.app.models.patient import Patient as DBPatient
from backend.app.models.doctor import Doctor as DBDoctor
from backend.app.schemas.appointment import AppointmentCreate, AppointmentUpdate, Appointment as SchemaAppointment
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.get("", response_model=List[SchemaAppointment])
def read_appointments(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    query = (
        db.query(DBAppointment)
        .options(joinedload(DBAppointment.patient), joinedload(DBAppointment.doctor))
    )

    if patient_id is not None:
        query = query.filter(DBAppointment.patient_id == patient_id)
    if doctor_id is not None:
        query = query.filter(DBAppointment.doctor_id == doctor_id)
    if status is not None:
        query = query.filter(DBAppointment.status == status)

    appointments = query.offset(skip).limit(limit).all()
    return appointments

@router.post("", response_model=SchemaAppointment, status_code=status.HTTP_201_CREATED)
def create_appointment(
    appointment_in: AppointmentCreate,
    current_user: DBUser = Depends(get_current_active_patient),
    db: Session = Depends(get_db)
):
    # Ensure the patient_id in the request matches the current authenticated patient
    patient = db.query(DBPatient).filter(DBPatient.user_id == current_user.id).first()
    if not patient or patient.id != appointment_in.patient_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create appointment for this patient"
        )
    
    doctor = db.query(DBDoctor).filter(DBDoctor.id == appointment_in.doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    # Basic check for appointment time conflicts (can be made more sophisticated)
    existing_appointment = db.query(DBAppointment).filter(
        DBAppointment.doctor_id == appointment_in.doctor_id,
        DBAppointment.appointment_time == appointment_in.appointment_time
    ).first()
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor already has an appointment at this time"
        )

    db_appointment = DBAppointment(**appointment_in.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    db_event = DBAppointmentEvent(
        appointment_id=db_appointment.id,
        patient_id=db_appointment.patient_id,
        doctor_id=db_appointment.doctor_id,
        event_type="created",
        payload={"status": db_appointment.status, "notes": db_appointment.notes},
    )
    db.add(db_event)
    db.commit()
    return db_appointment

@router.put("/{appointment_id}", response_model=SchemaAppointment)
def update_appointment(
    appointment_id: int,
    appointment_in: AppointmentUpdate,
    current_user: DBUser = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_appointment = db.query(DBAppointment).filter(DBAppointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Authorization check: only the patient who created it, or a doctor/admin can update
    authorized_to_update = False
    if current_user.role == "admin":
        authorized_to_update = True
    elif current_user.role == "patient":
        patient = db.query(DBPatient).filter(DBPatient.user_id == current_user.id).first()
        if patient and db_appointment.patient_id == patient.id:
            authorized_to_update = True
    elif current_user.role == "doctor":
        doctor = db.query(DBDoctor).filter(DBDoctor.user_id == current_user.id).first()
        if doctor and db_appointment.doctor_id == doctor.id:
            authorized_to_update = True
    
    if not authorized_to_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this appointment"
        )

    changes = appointment_in.dict(exclude_unset=True)
    for field, value in changes.items():
        setattr(db_appointment, field, value)
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    if changes:
        event_type = "updated"
        if "status" in changes and changes["status"]:
            event_type = f"status_{changes['status']}"
        db_event = DBAppointmentEvent(
            appointment_id=db_appointment.id,
            patient_id=db_appointment.patient_id,
            doctor_id=db_appointment.doctor_id,
            event_type=event_type,
            payload={"changes": changes},
        )
        db.add(db_event)
        db.commit()
    return db_appointment

@router.post("/admin", response_model=SchemaAppointment, status_code=status.HTTP_201_CREATED)
def create_appointment_by_admin(
    appointment_in: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can create appointments
):
    patient = db.query(DBPatient).filter(DBPatient.id == appointment_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    doctor = db.query(DBDoctor).filter(DBDoctor.id == appointment_in.doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )

    existing_appointment = db.query(DBAppointment).filter(
        DBAppointment.doctor_id == appointment_in.doctor_id,
        DBAppointment.appointment_time == appointment_in.appointment_time
    ).first()
    if existing_appointment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor already has an appointment at this time"
        )

    db_appointment = DBAppointment(**appointment_in.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    db_event = DBAppointmentEvent(
        appointment_id=db_appointment.id,
        patient_id=db_appointment.patient_id,
        doctor_id=db_appointment.doctor_id,
        event_type="created_by_admin",
        payload={"status": db_appointment.status, "notes": db_appointment.notes},
    )
    db.add(db_event)
    db.commit()
    return db_appointment

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can delete appointments
):
    db_appointment = db.query(DBAppointment).filter(DBAppointment.id == appointment_id).first()
    if not db_appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    db_event = DBAppointmentEvent(
        appointment_id=db_appointment.id,
        patient_id=db_appointment.patient_id,
        doctor_id=db_appointment.doctor_id,
        event_type="deleted",
        payload={"status": db_appointment.status},
    )
    db.add(db_event)
    db.delete(db_appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}
