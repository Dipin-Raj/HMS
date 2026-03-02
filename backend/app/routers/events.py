from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.dependencies import get_current_active_admin, get_current_active_user
from backend.app.models.user import User as DBUser
from backend.app.models.events import (
    AppointmentEvent as DBAppointmentEvent,
    AttendanceEvent as DBAttendanceEvent,
    InventoryEvent as DBInventoryEvent,
    PatientVital as DBPatientVital,
    DoctorStatusEvent as DBDoctorStatusEvent,
    StaffStatusEvent as DBStaffStatusEvent,
)
from backend.app.schemas.events import (
    AppointmentEvent,
    AttendanceEvent,
    InventoryEvent,
    PatientVital,
    PatientVitalCreate,
    DoctorStatusEvent,
    StaffStatusEvent,
)

router = APIRouter()


@router.get("/events/appointments", response_model=List[AppointmentEvent])
def read_appointment_events(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    event_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    query = db.query(DBAppointmentEvent)

    if start_time:
        query = query.filter(DBAppointmentEvent.event_time >= start_time)
    if end_time:
        query = query.filter(DBAppointmentEvent.event_time <= end_time)
    if patient_id is not None:
        query = query.filter(DBAppointmentEvent.patient_id == patient_id)
    if doctor_id is not None:
        query = query.filter(DBAppointmentEvent.doctor_id == doctor_id)
    if event_type is not None:
        query = query.filter(DBAppointmentEvent.event_type == event_type)

    return query.order_by(DBAppointmentEvent.event_time.desc()).offset(skip).limit(limit).all()


@router.get("/events/attendance", response_model=List[AttendanceEvent])
def read_attendance_events(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    staff_id: Optional[int] = None,
    event_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    query = db.query(DBAttendanceEvent)

    if start_time:
        query = query.filter(DBAttendanceEvent.event_time >= start_time)
    if end_time:
        query = query.filter(DBAttendanceEvent.event_time <= end_time)
    if staff_id is not None:
        query = query.filter(DBAttendanceEvent.staff_id == staff_id)
    if event_type is not None:
        query = query.filter(DBAttendanceEvent.event_type == event_type)

    return query.order_by(DBAttendanceEvent.event_time.desc()).offset(skip).limit(limit).all()


@router.get("/events/inventory", response_model=List[InventoryEvent])
def read_inventory_events(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    stock_id: Optional[int] = None,
    medicine_name: Optional[str] = None,
    event_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    query = db.query(DBInventoryEvent)

    if start_time:
        query = query.filter(DBInventoryEvent.event_time >= start_time)
    if end_time:
        query = query.filter(DBInventoryEvent.event_time <= end_time)
    if stock_id is not None:
        query = query.filter(DBInventoryEvent.stock_id == stock_id)
    if medicine_name is not None:
        query = query.filter(DBInventoryEvent.medicine_name.ilike(f"%{medicine_name}%"))
    if event_type is not None:
        query = query.filter(DBInventoryEvent.event_type == event_type)

    return query.order_by(DBInventoryEvent.event_time.desc()).offset(skip).limit(limit).all()


@router.get("/events/vitals", response_model=List[PatientVital])
def read_patient_vitals(
    patient_id: Optional[int] = None,
    vital_type: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    query = db.query(DBPatientVital)

    if patient_id is not None:
        query = query.filter(DBPatientVital.patient_id == patient_id)
    if vital_type is not None:
        query = query.filter(DBPatientVital.vital_type == vital_type)
    if start_time:
        query = query.filter(DBPatientVital.recorded_at >= start_time)
    if end_time:
        query = query.filter(DBPatientVital.recorded_at <= end_time)

    return query.order_by(DBPatientVital.recorded_at.desc()).offset(skip).limit(limit).all()


@router.get("/events/doctor-status", response_model=List[DoctorStatusEvent])
def read_doctor_status_events(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    doctor_id: Optional[int] = None,
    event_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    query = db.query(DBDoctorStatusEvent)
    if start_time:
        query = query.filter(DBDoctorStatusEvent.event_time >= start_time)
    if end_time:
        query = query.filter(DBDoctorStatusEvent.event_time <= end_time)
    if doctor_id is not None:
        query = query.filter(DBDoctorStatusEvent.doctor_id == doctor_id)
    if event_type is not None:
        query = query.filter(DBDoctorStatusEvent.event_type == event_type)
    return query.order_by(DBDoctorStatusEvent.event_time.desc()).offset(skip).limit(limit).all()


@router.get("/events/staff-status", response_model=List[StaffStatusEvent])
def read_staff_status_events(
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    staff_id: Optional[int] = None,
    event_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    query = db.query(DBStaffStatusEvent)
    if start_time:
        query = query.filter(DBStaffStatusEvent.event_time >= start_time)
    if end_time:
        query = query.filter(DBStaffStatusEvent.event_time <= end_time)
    if staff_id is not None:
        query = query.filter(DBStaffStatusEvent.staff_id == staff_id)
    if event_type is not None:
        query = query.filter(DBStaffStatusEvent.event_type == event_type)
    return query.order_by(DBStaffStatusEvent.event_time.desc()).offset(skip).limit(limit).all()


@router.post("/events/vitals", response_model=PatientVital, status_code=status.HTTP_201_CREATED)
def create_patient_vital(
    vital_in: PatientVitalCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_user),
):
    if current_user.role not in {"admin", "doctor", "staff"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to create patient vitals",
        )

    db_vital = DBPatientVital(**vital_in.dict())
    db.add(db_vital)
    db.commit()
    db.refresh(db_vital)
    return db_vital
