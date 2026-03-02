from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta

from backend.app.core.database import get_db
from backend.app.core.security import decrypt_secret, encrypt_secret
from backend.app.dependencies import get_current_active_admin
from backend.app.models.admin_email_settings import AdminEmailSettings as DBAdminEmailSettings
from backend.app.models.user import User as DBUser
from backend.app.models.attendance import Attendance as DBAttendance
from backend.app.models.appointment import Appointment as DBAppointment
from backend.app.schemas.attendance import Attendance as SchemaAttendance
from backend.app.schemas.auth import User
from backend.app.schemas.admin_settings import (
    AdminEmailSettingsUpdate,
    AdminEmailSettingsView,
    TestEmailPayload,
)
from backend.app.services.email_service import SMTPConfig, send_test_email

router = APIRouter()

@router.get("/staff-attendance", response_model=List[SchemaAttendance])
def get_staff_attendance(
    start_date: date = None,
    end_date: date = None,
    current_user: DBUser = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    query = db.query(DBAttendance)
    if start_date:
        query = query.filter(DBAttendance.date >= start_date)
    if end_date:
        query = query.filter(DBAttendance.date <= end_date)
    attendance_records = query.all()
    return attendance_records

@router.get("/appointment-analytics", response_model=Dict[str, Any])
def get_appointment_analytics(
    start_date: date = None,
    end_date: date = None,
    current_user: DBUser = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    query = db.query(DBAppointment)
    if start_date:
        query = query.filter(DBAppointment.appointment_time >= start_date)
    if end_date:
        # Include appointments up to the end of the end_date
        query = query.filter(DBAppointment.appointment_time < (end_date + timedelta(days=1)))
    
    total_appointments = query.count()
    completed_appointments = query.filter(DBAppointment.status == "completed").count()
    cancelled_appointments = query.filter(DBAppointment.status == "cancelled").count()
    scheduled_appointments = query.filter(DBAppointment.status == "scheduled").count()

    return {
        "total_appointments": total_appointments,
        "completed": completed_appointments,
        "cancelled": cancelled_appointments,
        "scheduled": scheduled_appointments
    }

@router.get("/rush-prediction", response_model=Dict[str, Any])
def get_rush_prediction(
    current_user: DBUser = Depends(get_current_active_admin)
):
    # Placeholder for AI-based rush prediction
    return {
        "prediction": [
            {"hour": 9, "predicted_rush": 0.75, "confidence": 0.8},
            {"hour": 10, "predicted_rush": 0.90, "confidence": 0.85},
            {"hour": 14, "predicted_rush": 0.80, "confidence": 0.78}
        ],
        "message": "AI rush prediction model not yet integrated. Showing placeholder data."
    }

@router.get("/users", response_model=List[User])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin)
):
    query = db.query(DBUser)
    if role:
        query = query.filter(DBUser.role == role)
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/me/email-settings", response_model=AdminEmailSettingsView)
def get_my_email_settings(
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    cfg = db.query(DBAdminEmailSettings).filter(DBAdminEmailSettings.user_id == current_user.id).first()
    if not cfg:
        return AdminEmailSettingsView(is_configured=False)
    return AdminEmailSettingsView(
        is_configured=True,
        smtp_host=cfg.smtp_host,
        smtp_port=cfg.smtp_port,
        smtp_username=cfg.smtp_username,
        from_email=cfg.from_email,
        from_name=cfg.from_name,
        use_tls=cfg.use_tls,
    )


@router.put("/me/email-settings", response_model=AdminEmailSettingsView)
def upsert_my_email_settings(
    payload: AdminEmailSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    cfg = db.query(DBAdminEmailSettings).filter(DBAdminEmailSettings.user_id == current_user.id).first()

    if cfg is None:
        if not payload.smtp_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SMTP password is required for first-time setup.",
            )
        cfg = DBAdminEmailSettings(
            user_id=current_user.id,
            smtp_host=payload.smtp_host,
            smtp_port=payload.smtp_port,
            smtp_username=payload.smtp_username,
            smtp_password_encrypted=encrypt_secret(payload.smtp_password),
            from_email=payload.from_email,
            from_name=payload.from_name,
            use_tls=payload.use_tls,
        )
    else:
        cfg.smtp_host = payload.smtp_host
        cfg.smtp_port = payload.smtp_port
        cfg.smtp_username = payload.smtp_username
        if payload.smtp_password:
            cfg.smtp_password_encrypted = encrypt_secret(payload.smtp_password)
        cfg.from_email = payload.from_email
        cfg.from_name = payload.from_name
        cfg.use_tls = payload.use_tls

    db.add(cfg)
    db.commit()
    db.refresh(cfg)
    return AdminEmailSettingsView(
        is_configured=True,
        smtp_host=cfg.smtp_host,
        smtp_port=cfg.smtp_port,
        smtp_username=cfg.smtp_username,
        from_email=cfg.from_email,
        from_name=cfg.from_name,
        use_tls=cfg.use_tls,
    )


@router.post("/me/email-settings/test")
def send_test_email_for_my_settings(
    payload: TestEmailPayload,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin),
):
    cfg = db.query(DBAdminEmailSettings).filter(DBAdminEmailSettings.user_id == current_user.id).first()
    if not cfg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No mail settings found for this admin. Configure Admin Settings first.",
        )

    smtp_config = SMTPConfig(
        smtp_host=cfg.smtp_host,
        smtp_port=cfg.smtp_port,
        smtp_username=cfg.smtp_username,
        smtp_password=decrypt_secret(cfg.smtp_password_encrypted),
        from_email=cfg.from_email,
        from_name=cfg.from_name,
        use_tls=cfg.use_tls,
    )

    try:
        send_test_email(smtp_config=smtp_config, recipient_email=payload.recipient_email)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Test email failed: {exc}",
        )

    return {"message": "Test email sent successfully"}
