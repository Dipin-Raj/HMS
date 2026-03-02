from datetime import datetime, date, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.config import get_settings
from backend.app.core.database import get_db
from backend.app.core.security import create_setup_token, decrypt_secret, get_password_hash, hash_setup_token
from backend.app.dependencies import get_current_active_staff, get_current_active_admin
from backend.app.models.admin_email_settings import AdminEmailSettings as DBAdminEmailSettings
from backend.app.models.user import User as DBUser
from backend.app.models.staff import Staff as DBStaff
from backend.app.models.attendance import Attendance as DBAttendance
from backend.app.schemas.auth import StaffInviteCreate
from backend.app.schemas.staff import Staff as SchemaStaff, StaffCreate, StaffUpdate, StaffStatusUpdate
from backend.app.schemas.attendance import AttendanceCreate, AttendanceUpdate, Attendance as SchemaAttendance
from backend.app.models.events import StaffStatusEvent as DBStaffStatusEvent
from backend.app.models.events import AttendanceEvent as DBAttendanceEvent
from backend.app.services.email_service import SMTPConfig, send_staff_invite_email

router = APIRouter()
settings = get_settings()

@router.get("/me", response_model=SchemaStaff)
def read_staff_me(current_user: DBUser = Depends(get_current_active_staff), db: Session = Depends(get_db)):
    staff = db.query(DBStaff).filter(DBStaff.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff profile not found"
        )
    return staff

@router.get("/me/status", response_model=SchemaStaff)
def read_staff_status(
    current_user: DBUser = Depends(get_current_active_staff),
    db: Session = Depends(get_db)
):
    staff = db.query(DBStaff).filter(DBStaff.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff profile not found"
        )
    return staff

@router.put("/me/status", response_model=SchemaStaff)
def update_staff_status(
    status_in: StaffStatusUpdate,
    current_user: DBUser = Depends(get_current_active_staff),
    db: Session = Depends(get_db)
):
    staff = db.query(DBStaff).filter(DBStaff.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff profile not found"
        )
    staff.current_status = status_in.current_status
    staff.status_note = status_in.status_note
    db.add(staff)
    db.commit()
    db.refresh(staff)

    db_event = DBStaffStatusEvent(
        staff_id=staff.id,
        event_type=status_in.current_status,
        payload={"note": status_in.status_note} if status_in.status_note else None,
    )
    db.add(db_event)
    db.commit()
    return staff

@router.get("/me/attendance", response_model=List[SchemaAttendance])
def read_staff_attendance(
    current_user: DBUser = Depends(get_current_active_staff),
    db: Session = Depends(get_db)
):
    staff = db.query(DBStaff).filter(DBStaff.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff profile not found"
        )
    attendance = db.query(DBAttendance).filter(DBAttendance.staff_id == staff.id).all()
    return attendance

@router.post("/attendance/check-in", response_model=SchemaAttendance, status_code=status.HTTP_201_CREATED)
def staff_check_in(
    current_user: DBUser = Depends(get_current_active_staff),
    db: Session = Depends(get_db)
):
    staff = db.query(DBStaff).filter(DBStaff.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff profile not found"
        )

    # Check if staff already checked in today
    today = date.today()
    existing_check_in = db.query(DBAttendance).filter(
        DBAttendance.staff_id == staff.id,
        DBAttendance.date == today
    ).first()

    if existing_check_in and existing_check_in.check_in_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today"
        )

    db_attendance = DBAttendance(
        staff_id=staff.id,
        check_in_time=datetime.now(),
        date=today
    )
    db.add(db_attendance)
    staff.current_status = "on-duty"
    staff.status_note = None
    db.add(staff)
    db.commit()
    db.refresh(db_attendance)
    db_event = DBAttendanceEvent(
        staff_id=staff.id,
        event_type="check_in",
        payload={"date": str(today)},
    )
    db.add(db_event)
    db_status_event = DBStaffStatusEvent(
        staff_id=staff.id,
        event_type="on-duty",
    )
    db.add(db_status_event)
    db.commit()
    return db_attendance

@router.put("/attendance/check-out", response_model=SchemaAttendance)
def staff_check_out(
    current_user: DBUser = Depends(get_current_active_staff),
    db: Session = Depends(get_db)
):
    staff = db.query(DBStaff).filter(DBStaff.user_id == current_user.id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff profile not found"
        )

    today = date.today()
    db_attendance = db.query(DBAttendance).filter(
        DBAttendance.staff_id == staff.id,
        DBAttendance.date == today
    ).first()

    if not db_attendance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No check-in record found for today"
        )
    if db_attendance.check_out_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today"
        )

    db_attendance.check_out_time = datetime.now()
    db.add(db_attendance)
    staff.current_status = "off-duty"
    staff.status_note = None
    db.add(staff)
    db.commit()
    db.refresh(db_attendance)
    db_event = DBAttendanceEvent(
        staff_id=staff.id,
        event_type="check_out",
        payload={"date": str(today)},
    )
    db.add(db_event)
    db_status_event = DBStaffStatusEvent(
        staff_id=staff.id,
        event_type="off-duty",
    )
    db.add(db_status_event)
    db.commit()
    return db_attendance

@router.get("", response_model=List[SchemaStaff])
def read_staff_members(
    skip: int = 0,
    limit: int = 100,
    job_title: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can view all staff
):
    query = db.query(DBStaff)

    if job_title:
        query = query.filter(DBStaff.job_title == job_title)
    
    staff_members = query.offset(skip).limit(limit).all()
    return staff_members

@router.post("", response_model=SchemaStaff, status_code=status.HTTP_201_CREATED)
def create_staff(
    staff_in: StaffCreate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can create staff
):
    # For simplicity, assuming user is already created and we are linking to it.
    # In a real scenario, you might create the user here as well.
    user_exists = db.query(DBUser).filter(DBUser.id == staff_in.user_id).first()
    if not user_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. A staff member must be linked to an existing user."
        )
    
    existing_staff = db.query(DBStaff).filter(DBStaff.user_id == staff_in.user_id).first()
    if existing_staff:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a staff profile."
        )

    db_staff = DBStaff(**staff_in.dict())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff


@router.post("/invite", response_model=SchemaStaff, status_code=status.HTTP_201_CREATED)
def invite_staff(
    invite_in: StaffInviteCreate,
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
        role="staff",
        is_password_set=False,
        invite_token_hash=setup_token_hash,
        invite_token_expires_at=expires_at,
        invite_sent_at=datetime.now(timezone.utc),
    )
    db.add(db_user)
    db.flush()

    db_staff = DBStaff(
        user_id=db_user.id,
        first_name=invite_in.first_name,
        last_name=invite_in.last_name,
        job_title=invite_in.job_title,
    )
    db.add(db_staff)
    db.flush()

    setup_link = f"{settings.DOCTOR_INVITE_BASE_URL}?token={setup_token}"
    try:
        send_staff_invite_email(
            smtp_config=smtp_config,
            recipient_email=invite_in.email,
            username=invite_in.username,
            setup_link=setup_link,
        )
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Staff record not created because invite email failed: {exc}",
        )

    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.put("/{staff_id}", response_model=SchemaStaff)
def update_staff(
    staff_id: int,
    staff_in: StaffUpdate,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can update staff
):
    db_staff = db.query(DBStaff).filter(DBStaff.id == staff_id).first()
    if not db_staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff not found"
        )
    
    for field, value in staff_in.dict(exclude_unset=True).items():
        setattr(db_staff, field, value)
    
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff

@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_staff(
    staff_id: int,
    db: Session = Depends(get_db),
    current_user: DBUser = Depends(get_current_active_admin) # Only admins can delete staff
):
    db_staff = db.query(DBStaff).filter(DBStaff.id == staff_id).first()
    if not db_staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff not found"
        )
    
    db.delete(db_staff)
    db.commit()
    return {"message": "Staff deleted successfully"}
