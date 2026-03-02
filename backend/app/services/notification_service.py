from typing import List

class NotificationService:
    def __init__(self):
        pass

    def send_appointment_reminder(self, recipient_email: str, patient_name: str, appointment_time: str):
        print(f"Sending appointment reminder to {recipient_email} for {patient_name} at {appointment_time}")
        # In a real application, this would integrate with an email/SMS service
        return {"status": "success", "message": "Appointment reminder sent (placeholder)."}

    def send_overdue_visit_alert(self, recipient_email: str, patient_name: str):
        print(f"Sending overdue visit alert to {recipient_email} for {patient_name}")
        # In a real application, this would integrate with an email/SMS service
        return {"status": "success", "message": "Overdue visit alert sent (placeholder)."}

    def send_custom_notification(self, recipient_email: str, subject: str, message: str):
        print(f"Sending custom notification to {recipient_email} - Subject: {subject}, Message: {message}")
        # In a real application, this would integrate with an email/SMS service
        return {"status": "success", "message": "Custom notification sent (placeholder)."}
