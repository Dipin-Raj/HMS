from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from backend.app.core.config import get_settings
from backend.app.core.database import SessionLocal
from backend.app.models.user import User as DBUser
from backend.app.schemas.auth import TokenData

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/login")

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> DBUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(DBUser).filter(DBUser.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: DBUser = Depends(get_current_user)) -> DBUser:
    if not current_user:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_admin(current_user: DBUser = Depends(get_current_user)) -> DBUser:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user

def get_current_active_doctor(current_user: DBUser = Depends(get_current_user)) -> DBUser:
    if current_user.role != "doctor" and current_user.role != "admin": # Admin can also access doctor portal
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user

def get_current_active_patient(current_user: DBUser = Depends(get_current_user)) -> DBUser:
    if current_user.role != "patient" and current_user.role != "admin": # Admin can also access patient portal
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user

def get_current_active_staff(current_user: DBUser = Depends(get_current_user)) -> DBUser:
    if current_user.role != "staff" and current_user.role != "admin": # Admin can also access staff portal
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return current_user
