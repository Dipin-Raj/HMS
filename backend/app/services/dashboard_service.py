from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Dict, Any, List

from backend.app.models.appointment import Appointment as DBAppointment
from backend.app.models.attendance import Attendance as DBAttendance
from backend.app.models.patient import Patient as DBPatient
from backend.app.models.doctor import Doctor as DBDoctor
from backend.app.models.staff import Staff as DBStaff

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_admin_dashboard_summary(self, start_date: date = None, end_date: date = None) -> Dict[str, Any]:
        if not start_date:
            start_date = date.min
        if not end_date:
            end_date = date.max

        # Total Users
        total_patients = self.db.query(DBPatient).count()
        total_doctors = self.db.query(DBDoctor).count()
        total_staff = self.db.query(DBStaff).count()

        # Appointment Analytics
        appointment_query = self.db.query(DBAppointment)
        if start_date:
            appointment_query = appointment_query.filter(DBAppointment.appointment_time >= start_date)
        if end_date:
            appointment_query = appointment_query.filter(DBAppointment.appointment_time < (end_date + timedelta(days=1)))
        
        total_appointments = appointment_query.count()
        completed_appointments = appointment_query.filter(DBAppointment.status == "completed").count()
        cancelled_appointments = appointment_query.filter(DBAppointment.status == "cancelled").count()
        scheduled_appointments = appointment_query.filter(DBAppointment.status == "scheduled").count()

        return {
            "total_patients": total_patients,
            "total_doctors": total_doctors,
            "total_staff": total_staff,
            "appointment_summary": {
                "total_appointments": total_appointments,
                "completed": completed_appointments,
                "cancelled": cancelled_appointments,
                "scheduled": scheduled_appointments
            }
        }

    def get_staff_attendance_overview(self, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        if not start_date:
            start_date = date.min
        if not end_date:
            end_date = date.max
        
        # This is a simplified overview, more complex logic for detailed attendance
        attendance_records = self.db.query(DBAttendance).filter(
            DBAttendance.date >= start_date,
            DBAttendance.date <= end_date
        ).all()

        staff_attendance_map = {}
        for record in attendance_records:
            staff_id = record.staff_id
            if staff_id not in staff_attendance_map:
                staff_attendance_map[staff_id] = {
                    "staff_id": staff_id,
                    "days_present": 0,
                    "check_in_summary": [],
                }
            staff_attendance_map[staff_id]["days_present"] += 1
            staff_attendance_map[staff_id]["check_in_summary"].append({
                "date": record.date.isoformat(),
                "check_in_time": record.check_in_time.isoformat() if record.check_in_time else None,
                "check_out_time": record.check_out_time.isoformat() if record.check_out_time else None,
            })
        
        # Optionally, fetch staff names if needed here
        return list(staff_attendance_map.values())
