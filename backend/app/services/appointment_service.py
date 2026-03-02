from sqlalchemy.orm import Session
from datetime import datetime
from backend.app.models.appointment import Appointment as DBAppointment
from backend.app.models.patient import Patient as DBPatient
from backend.app.models.doctor import Doctor as DBDoctor
from backend.app.schemas.appointment import AppointmentCreate, AppointmentUpdate

class AppointmentService:
    def __init__(self, db: Session):
        self.db = db

    def get_appointment(self, appointment_id: int):
        return self.db.query(DBAppointment).filter(DBAppointment.id == appointment_id).first()

    def create_appointment(self, appointment_in: AppointmentCreate) -> DBAppointment:
        db_appointment = DBAppointment(**appointment_in.dict())
        self.db.add(db_appointment)
        self.db.commit()
        self.db.refresh(db_appointment)
        return db_appointment

    def update_appointment(self, appointment_id: int, appointment_in: AppointmentUpdate) -> DBAppointment:
        db_appointment = self.get_appointment(appointment_id)
        if db_appointment:
            for field, value in appointment_in.dict(exclude_unset=True).items():
                setattr(db_appointment, field, value)
            self.db.add(db_appointment)
            self.db.commit()
            self.db.refresh(db_appointment)
        return db_appointment

    def get_patient_appointments(self, patient_id: int):
        return self.db.query(DBAppointment).filter(DBAppointment.patient_id == patient_id).all()

    def get_doctor_appointments(self, doctor_id: int):
        return self.db.query(DBAppointment).filter(DBAppointment.doctor_id == doctor_id).all()

    def get_doctor_weekly_summary(self, doctor_id: int, start_date: datetime, end_date: datetime):
        # This is a simplified example, could be more complex with aggregation
        appointments = self.db.query(DBAppointment).filter(
            DBAppointment.doctor_id == doctor_id,
            DBAppointment.appointment_time >= start_date,
            DBAppointment.appointment_time < end_date
        ).all()
        return {"total_appointments": len(appointments), "appointments": appointments}
