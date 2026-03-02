from sqlalchemy.orm import Session
from datetime import datetime, date
from backend.app.models.attendance import Attendance as DBAttendance
from backend.app.models.staff import Staff as DBStaff
from backend.app.schemas.attendance import AttendanceCreate, AttendanceUpdate

class AttendanceService:
    def __init__(self, db: Session):
        self.db = db

    def get_attendance_record(self, attendance_id: int):
        return self.db.query(DBAttendance).filter(DBAttendance.id == attendance_id).first()

    def create_check_in(self, staff_id: int) -> DBAttendance:
        today = date.today()
        existing_check_in = self.db.query(DBAttendance).filter(
            DBAttendance.staff_id == staff_id,
            DBAttendance.date == today
        ).first()

        if existing_check_in and existing_check_in.check_in_time:
            raise ValueError("Staff already checked in today")
        
        db_attendance = DBAttendance(
            staff_id=staff_id,
            check_in_time=datetime.now(),
            date=today
        )
        self.db.add(db_attendance)
        self.db.commit()
        self.db.refresh(db_attendance)
        return db_attendance

    def create_check_out(self, staff_id: int) -> DBAttendance:
        today = date.today()
        db_attendance = self.db.query(DBAttendance).filter(
            DBAttendance.staff_id == staff_id,
            DBAttendance.date == today
        ).first()

        if not db_attendance:
            raise ValueError("No check-in record found for today")
        if db_attendance.check_out_time:
            raise ValueError("Already checked out today")
        
        db_attendance.check_out_time = datetime.now()
        self.db.add(db_attendance)
        self.db.commit()
        self.db.refresh(db_attendance)
        return db_attendance

    def get_staff_attendance_records(self, staff_id: int, start_date: date = None, end_date: date = None):
        query = self.db.query(DBAttendance).filter(DBAttendance.staff_id == staff_id)
        if start_date:
            query = query.filter(DBAttendance.date >= start_date)
        if end_date:
            query = query.filter(DBAttendance.date <= end_date)
        return query.all()
