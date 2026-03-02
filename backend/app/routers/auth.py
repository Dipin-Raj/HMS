from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.config import get_settings
from backend.app.core.database import get_db
from backend.app.core.security import create_access_token, get_password_hash, hash_setup_token, verify_password
from backend.app.models.patient import Patient as DBPatient
from backend.app.models.user import User as DBUser
from backend.app.schemas.auth import PasswordSetupConfirm, PatientCodeSignup, Token, UserCreate, UserLogin, UserInDBBase
from backend.app.dependencies import get_current_user

router = APIRouter()
settings = get_settings()

@router.post("/admin/signup", response_model=UserInDBBase, status_code=status.HTTP_201_CREATED)
def admin_signup(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.username == user_in.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    db_user = db.query(DBUser).filter(DBUser.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(user_in.password)
    db_user = DBUser(
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_password,
        role="admin"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/register", response_model=UserInDBBase, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.username == user_in.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    db_user = db.query(DBUser).filter(DBUser.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(user_in.password)
    # Default role for registration is 'patient'
    db_user = DBUser(
        username=user_in.username,
        email=user_in.email,
        password_hash=hashed_password,
        role="patient"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login_for_access_token(
    user_in: UserLogin,
    db: Session = Depends(get_db)
):
    db_user = db.query(DBUser).filter(DBUser.username == user_in.username).first()
    if not db_user or not verify_password(user_in.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not db_user.is_password_set:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account setup pending. Please set your password from the invite link.",
        )
    if db_user.role != user_in.role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect role",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username, "role": db_user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/set-password", status_code=status.HTTP_200_OK)
def set_password_from_invite(payload: PasswordSetupConfirm, db: Session = Depends(get_db)):
    token_hash = hash_setup_token(payload.token)
    db_user = db.query(DBUser).filter(DBUser.invite_token_hash == token_hash).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid invite token")
    if db_user.invite_token_expires_at is None or db_user.invite_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invite token expired")
    if db_user.is_password_set:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password already set")

    db_user.password_hash = get_password_hash(payload.password)
    db_user.is_password_set = True
    db_user.invite_token_hash = None
    db_user.invite_token_expires_at = None
    db_user.invite_sent_at = None
    db.add(db_user)
    db.commit()
    return {"message": "Password set successfully"}


@router.post("/patient/signup-with-code", response_model=UserInDBBase, status_code=status.HTTP_201_CREATED)
def patient_signup_with_code(payload: PatientCodeSignup, db: Session = Depends(get_db)):
    patient = db.query(DBPatient).filter(DBPatient.patient_code == payload.patient_code).first()
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient ID not found")
    if patient.user_id is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient ID already claimed")
    if (
        patient.first_name.strip().lower() != payload.first_name.strip().lower()
        or patient.last_name.strip().lower() != payload.last_name.strip().lower()
        or patient.date_of_birth != payload.date_of_birth
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient details do not match records")

    existing_user = db.query(DBUser).filter(DBUser.username == payload.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")
    existing_email = db.query(DBUser).filter(DBUser.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    db_user = DBUser(
        username=payload.username,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role="patient",
        is_password_set=True,
    )
    db.add(db_user)
    db.flush()

    patient.user_id = db_user.id
    db.add(patient)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/me", response_model=UserInDBBase)
async def read_users_me(current_user: DBUser = Depends(get_current_user)):
    return current_user
