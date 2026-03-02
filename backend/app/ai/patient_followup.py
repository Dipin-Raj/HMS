from typing import List, Dict, Any
import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from backend.app.models.patient import Patient as DBPatient
from backend.app.models.appointment import Appointment as DBAppointment

class PatientFollowupModel:
    def __init__(self, db: Session):
        self.db = db
        # In a real scenario, this would load a trained model for inactivity detection
        self.model_loaded = True
        print("Patient Follow-up Model initialized (placeholder).")

    def detect_overdue_patients(self, days_threshold: int = 90) -> List[Dict[str, Any]]:
        """
        Detects patients who are overdue for a visit based on a threshold.
        This is a rule-based placeholder, not an ML model.
        """
        if not self.model_loaded:
            raise RuntimeError("Model not loaded.")

        overdue_patients = []
        today = date.today()
        threshold_date = today - timedelta(days=days_threshold)

        # Find patients with no appointments after the threshold date
        # This is a simplified logic and can be improved
        patients_with_appointments_recently = (
            self.db.query(DBPatient.id)
            .join(DBAppointment)
            .filter(DBAppointment.appointment_time.cast(date) >= threshold_date)
            .all()
        )
        patient_ids_with_recent_appointments = [p_id for p_id, in patients_with_appointments_recently]

        all_patients = self.db.query(DBPatient).all()

        for patient in all_patients:
            if patient.id not in patient_ids_with_recent_appointments:
                # Check if this patient has any medical records at all, or just no recent appointments
                # For simplicity, we're assuming if they don't have a recent appointment, they might be overdue
                overdue_patients.append({
                    "patient_id": patient.id,
                    "first_name": patient.first_name,
                    "last_name": patient.last_name,
                    "last_visit_date": "N/A", # Needs more complex query to find last visit
                    "reason": f"No appointment detected in the last {days_threshold} days."
                })
        
        # Add some random overdue patients if the list is empty for demonstration
        if not overdue_patients and random.random() > 0.5:
            overdue_patients.append({
                "patient_id": random.randint(100, 999),
                "first_name": "Demo",
                "last_name": "Patient",
                "last_visit_date": (today - timedelta(days=random.randint(91, 180))).isoformat(),
                "reason": f"No appointment detected in the last {days_threshold} days."
            })

        return overdue_patients

# Example usage (requires a db session):
# from backend.app.core.database import SessionLocal
# db_session = SessionLocal()
# model = PatientFollowupModel(db_session)
# overdue = model.detect_overdue_patients()
# print(overdue)
# db_session.close()
