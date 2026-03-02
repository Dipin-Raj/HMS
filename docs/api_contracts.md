# HMS-AI - API Contracts

This document defines the API endpoints for the Hospital Management System. The API is designed to be RESTful and uses JSON for requests and responses.

## Authentication API

- **POST /api/v1/auth/register**
  - **Description:** Register a new user (patient).
  - **Request Body:** `{ "username": "string", "email": "string", "password": "string", "first_name": "string", "last_name": "string", "date_of_birth": "YYYY-MM-DD" }`
  - **Response:** `{ "access_token": "string", "token_type": "bearer" }`

- **POST /api/v1/auth/login**
  - **Description:** Log in a user.
  - **Request Body:** `{ "username": "string", "password": "string" }`
  - **Response:** `{ "access_token": "string", "token_type": "bearer" }`

- **GET /api/v1/auth/me**
  - **Description:** Get the current user's information.
  - **Authentication:** Required.
  - **Response:** `{ "id": "integer", "username": "string", "email": "string", "role": "string" }`

## Patient API

- **GET /api/v1/patients/me/medical-records**
  - **Description:** Get the current patient's medical records.
  - **Authentication:** Required (as a patient).
  - **Response:** `[ { "id": "integer", "visit_date": "YYYY-MM-DD", "diagnosis": "string", "treatment": "string" } ]`

- **GET /api/v1/patients/me/appointments**
  - **Description:** Get the current patient's appointments.
  - **Authentication:** Required (as a patient).
  - **Response:** `[ { "id": "integer", "doctor_name": "string", "appointment_time": "YYYY-MM-DDTHH:MM:SS", "status": "string" } ]`

## Doctor API

- **GET /api/v1/doctors/me/appointments**
  - **Description:** Get the current doctor's appointments.
  - **Authentication:** Required (as a doctor).
  - **Response:** `[ { "id": "integer", "patient_name": "string", "appointment_time": "YYYY-MM-DDTHH:MM:SS", "status": "string" } ]`

- **POST /api/v1/doctors/patients/{patient_id}/medical-records**
  - **Description:** Create a new medical record for a patient.
  - **Authentication:** Required (as a doctor).
  - **Request Body:** `{ "visit_date": "YYYY-MM-DD", "diagnosis": "string", "treatment": "string", "notes": "string" }`
  - **Response:** `{ "id": "integer", ... }`

## Appointment API

- **POST /api/v1/appointments**
  - **Description:** Book a new appointment.
  - **Authentication:** Required (as a patient).
  - **Request Body:** `{ "doctor_id": "integer", "appointment_time": "YYYY-MM-DDTHH:MM:SS" }`
  - **Response:** `{ "id": "integer", "status": "scheduled", ... }`

- **PUT /api/v1/appointments/{appointment_id}**
  - **Description:** Update an appointment (e.g., cancel).
  - **Authentication:** Required.
  - **Request Body:** `{ "status": "cancelled" }`
  - **Response:** `{ "id": "integer", "status": "cancelled", ... }`

## Admin API

- **GET /api/v1/admin/staff-attendance**
  - **Description:** Get staff attendance records.
  - **Authentication:** Required (as an admin).
  - **Response:** `[ { "staff_id": "integer", "check_in_time": "...", "check_out_time": "..." } ]`

- **GET /api/v1/admin/appointment-analytics**
  - **Description:** Get analytics on appointments.
  - **Authentication:** Required (as an admin).
  - **Response:** `{ "total_appointments": "integer", "completed": "integer", "cancelled": "integer" }`

- **GET /api/v1/admin/rush-prediction**
  - **Description:** Get AI-based prediction for patient rush hours.
  - **Authentication:** Required (as an admin).
  - **Response:** `{ "prediction": [ { "hour": "integer", "predicted_rush": "float", "confidence": "float" } ] }`

## Pharmacy API

- **GET /api/v1/pharmacy/stock**
  - **Description:** Get the current pharmacy stock.
  - **Authentication:** Required (as staff or admin).
  - **Response:** `[ { "id": "integer", "medicine_name": "string", "quantity": "integer" } ]`

- **POST /api/v1/pharmacy/stock**
    - **Description:** Add or update medicine in the stock.
    - **Authentication:** Required (as staff or admin).
    - **Request Body:** `{ "medicine_name": "string", "quantity": "integer", "unit_price": "float" }`
    - **Response:** `{ "id": "integer", ... }`

- **GET /api/v1/pharmacy/demand-forecast**
    - **Description:** Get AI-based prediction for monthly medicine demand.
    - **Authentication:** Required (as admin).
    - **Response:** `{ "forecast": [ { "medicine_name": "string", "predicted_demand": "integer" } ] }`
