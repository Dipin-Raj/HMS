from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from backend.app.core.config import get_settings
from backend.app.core.database import get_db
from backend.app.core.security import create_setup_token, decrypt_secret, get_password_hash, hash_setup_token
from backend.app.dependencies import get_current_active_doctor, get_current_active_admin
from backend.app.models.admin_email_settings import AdminEmailSettings as DBAdminEmailSettings
from backend.app.models.user import User as DBUser
from backend.app.models.doctor import Doctor as DBDoctor
from backend.app.models.patient import Patient as DBPatient
from backend.app.models.appointment import Appointment as DBAppointment
from backend.app.models.medical_record import MedicalRecord as DBMedicalRecord
from backend.app.schemas.auth import DoctorInviteCreate
from backend.app.schemas.doctor import Doctor as SchemaDoctor, DoctorCreate, DoctorUpdate, DoctorStatusUpdate
from backend.app.schemas.appointment import Appointment as SchemaAppointment
from backend.app.schemas.medical_record import MedicalRecordCreate, MedicalRecord as SchemaMedicalRecord
from backend.app.models.events import DoctorStatusEvent as DBDoctorStatusEvent
from backend.app.services.email_service import SMTPConfig, send_doctor_invite_email

router = APIRouter()
settings = get_settings()

@router.get("/me", response_model=SchemaDoctor)
def read_doctor_me(current_user: DBUser = Depends(get_current_active_doctor), db: Session = Depends(get_db)):
    doctor = db.query(DBDoctor).filter(DBDoctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    return doctor

@router.get("/me/status", response_model=SchemaDoctor)
def read_doctor_status(
    current_user: DBUser = Depends(get_current_active_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(DBDoctor).filter(DBDoctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    return doctor

@router.put("/me/status", response_model=SchemaDoctor)
def update_doctor_status(
    status_in: DoctorStatusUpdate,
    current_user: DBUser = Depends(get_current_active_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(DBDoctor).filter(DBDoctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    doctor.current_status = status_in.current_status
    doctor.status_note = status_in.status_note
    db.add(doctor)
    db.commit()
    db.refresh(doctor)

    db_event = DBDoctorStatusEvent(
        doctor_id=doctor.id,
        event_type=status_in.current_status,
        payload={"note": status_in.status_note} if status_in.status_note else None,
    )
    db.add(db_event)
    db.commit()
    return doctor

@router.get("/me/appointments", response_model=List[SchemaAppointment])
def read_doctor_appointments(
    current_user: DBUser = Depends(get_current_active_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(DBDoctor).filter(DBDoctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    appointments = (
        db.query(DBAppointment)
        .options(joinedload(DBAppointment.patient)) # Eager load patient information
        .filter(DBAppointment.doctor_id == doctor.id)
        .all()
    )
    return appointments

@router.post("/patients/{patient_id}/medical-records", response_model=SchemaMedicalRecord, status_code=status.HTTP_201_CREATED)
def create_medical_record_for_patient(
    patient_id: int,
    medical_record: MedicalRecordCreate,
    current_user: DBUser = Depends(get_current_active_doctor),
    db: Session = Depends(get_db)
):
    doctor = db.query(DBDoctor).filter(DBDoctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found"
        )
    patient = db.query(DBPatient).filter(DBPatient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    db_medical_record = DBMedicalRecord(
        patient_id=patient_id,
        doctor_id=doctor.id,
        visit_date=medical_record.visit_date,
        diagnosis=medical_record.diagnosis,
        treatment=medical_record.treatment,
        notes=medical_record.notes
    )
    db.add(db_medical_record)
    db.commit()
    db.refresh(db_medical_record)
    return db_medical_record

@router.get("", response_model=List[SchemaDoctor])
def read_doctors(
    skip: int = 0,
    limit: int = 100,
    specialization: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can view all doctors
):
    query = db.query(DBDoctor)

    if specialization:
        query = query.filter(DBDoctor.specialization == specialization)
    
    doctors = query.offset(skip).limit(limit).all()
    return doctors

@router.post("", response_model=SchemaDoctor, status_code=status.HTTP_201_CREATED)
def create_doctor(
    doctor_in: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can create doctors
):
    # For simplicity, assuming user is already created and we are linking to it.
    # In a real scenario, you might create the user here as well.
    user_exists = db.query(DBUser).filter(DBUser.id == doctor_in.user_id).first()
    if not user_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. A doctor must be linked to an existing user."
        )
    
    existing_doctor = db.query(DBDoctor).filter(DBDoctor.user_id == doctor_in.user_id).first()
    if existing_doctor:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a doctor profile."
        )

    db_doctor = DBDoctor(**doctor_in.dict())
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor


@router.post("/invite", response_model=SchemaDoctor, status_code=status.HTTP_201_CREATED)
def invite_doctor(
    invite_in: DoctorInviteCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    existing_user = (
        db.query(DBUser)
        .filter((DBUser.username == invite_in.username) | (DBUser.email == invite_in.email))
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    admin_mail_settings = (
        db.query(DBAdminEmailSettings)
        .filter(DBAdminEmailSettings.user_id == current_user.id)
        .first()
    )
    if not admin_mail_settings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No mail settings found for this admin. Configure Admin Settings first.",
        )

    try:
        smtp_password = decrypt_secret(admin_mail_settings.smtp_password_encrypted)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stored mail settings are invalid. Please re-save Admin mail settings.",
        )

    smtp_config = SMTPConfig(
        smtp_host=admin_mail_settings.smtp_host,
        smtp_port=admin_mail_settings.smtp_port,
        smtp_username=admin_mail_settings.smtp_username,
        smtp_password=smtp_password,
        from_email=admin_mail_settings.from_email,
        from_name=admin_mail_settings.from_name,
        use_tls=admin_mail_settings.use_tls,
    )

    setup_token = create_setup_token()
    setup_token_hash = hash_setup_token(setup_token)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.DOCTOR_INVITE_EXPIRY_HOURS)
    temp_password_hash = get_password_hash(create_setup_token())

    db_user = DBUser(
        username=invite_in.username,
        email=invite_in.email,
        password_hash=temp_password_hash,
        role="doctor",
        is_password_set=False,
        invite_token_hash=setup_token_hash,
        invite_token_expires_at=expires_at,
        invite_sent_at=datetime.now(timezone.utc),
    )
    db.add(db_user)
    db.flush()

    db_doctor = DBDoctor(
        user_id=db_user.id,
        first_name=invite_in.first_name,
        last_name=invite_in.last_name,
        specialization=invite_in.specialization,
        phone_number=invite_in.phone_number,
    )
    db.add(db_doctor)
    db.flush()

    setup_link = f"{settings.DOCTOR_INVITE_BASE_URL}?token={setup_token}"
    try:
        send_doctor_invite_email(
            smtp_config=smtp_config,
            recipient_email=invite_in.email,
            username=invite_in.username,
            setup_link=setup_link,
        )
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Doctor record not created because invite email failed: {exc}",
        )

    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.put("/{doctor_id}", response_model=SchemaDoctor)
def update_doctor(
    doctor_id: int,
    doctor_in: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can update doctors
):
    db_doctor = db.query(DBDoctor).filter(DBDoctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    for field, value in doctor_in.dict(exclude_unset=True).items():
        setattr(db_doctor, field, value)
    
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can delete doctors
):
    db_doctor = db.query(DBDoctor).filter(DBDoctor.id == doctor_id).first()
    if not db_doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found"
        )
    
    db.delete(db_doctor)
    db.commit()
    return {"message": "Doctor deleted successfully"}
