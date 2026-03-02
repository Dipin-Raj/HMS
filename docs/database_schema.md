# HMS-AI - Database Schema

This document outlines the database schema for the Hospital Management System. The schema is designed to be normalized and scalable. The primary database used is PostgreSQL.

## Table: `users`

Stores user account information and their role.

| Column          | Type          | Constraints              | Description                                  |
|-----------------|---------------|--------------------------|----------------------------------------------|
| `id`            | `INTEGER`     | `PRIMARY KEY`            | Unique identifier for the user.              |
| `username`      | `VARCHAR(50)` | `UNIQUE`, `NOT NULL`     | The user's username for login.               |
| `email`         | `VARCHAR(255)`| `UNIQUE`, `NOT NULL`     | The user's email address.                    |
| `password_hash` | `VARCHAR(255)`| `NOT NULL`               | Hashed password for the user.                |
| `role`          | `VARCHAR(20)` | `NOT NULL`               | Role of the user (e.g., 'patient', 'doctor', 'staff', 'admin'). |
| `created_at`    | `TIMESTAMP`   | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of when the user was created.    |
| `updated_at`    | `TIMESTAMP`   | `DEFAULT CURRENT_TIMESTAMP` | Timestamp of when the user was last updated. |

## Table: `patients`

Stores patient-specific information.

| Column          | Type        | Constraints                | Description                                  |
|-----------------|-------------|----------------------------|----------------------------------------------|
| `id`            | `INTEGER`   | `PRIMARY KEY`              | Unique identifier for the patient.           |
| `user_id`       | `INTEGER`   | `FOREIGN KEY (users.id)`   | Links to the `users` table.                  |
| `first_name`    | `VARCHAR(50)`| `NOT NULL`                 | Patient's first name.                        |
| `last_name`     | `VARCHAR(50)`| `NOT NULL`                 | Patient's last name.                         |
| `date_of_birth` | `DATE`      | `NOT NULL`                 | Patient's date of birth.                     |
| `gender`        | `VARCHAR(10)`|                            | Patient's gender.                            |
| `phone_number`  | `VARCHAR(20)`|                            | Patient's phone number.                      |
| `address`       | `TEXT`      |                            | Patient's address.                           |

## Table: `doctors`

Stores doctor-specific information.

| Column          | Type        | Constraints                | Description                                  |
|-----------------|-------------|----------------------------|----------------------------------------------|
| `id`            | `INTEGER`   | `PRIMARY KEY`              | Unique identifier for the doctor.            |
| `user_id`       | `INTEGER`   | `FOREIGN KEY (users.id)`   | Links to the `users` table.                  |
| `first_name`    | `VARCHAR(50)`| `NOT NULL`                 | Doctor's first name.                         |
| `last_name`     | `VARCHAR(50)`| `NOT NULL`                 | Doctor's last name.                          |
| `specialization`| `VARCHAR(100)`|`NOT NULL`                 | Doctor's specialization (e.g., 'Cardiology').|
| `phone_number`  | `VARCHAR(20)`|                            | Doctor's contact number.                     |

## Table: `staff`

Stores information about hospital staff (non-doctors).

| Column          | Type        | Constraints                | Description                                  |
|-----------------|-------------|----------------------------|----------------------------------------------|
| `id`            | `INTEGER`   | `PRIMARY KEY`              | Unique identifier for the staff member.      |
| `user_id`       | `INTEGER`   | `FOREIGN KEY (users.id)`   | Links to the `users` table.                  |
| `first_name`    | `VARCHAR(50)`| `NOT NULL`                 | Staff member's first name.                   |
| `last_name`     | `VARCHAR(50)`| `NOT NULL`                 | Staff member's last name.                    |
| `job_title`     | `VARCHAR(100)`|`NOT NULL`                 | Staff member's job title (e.g., 'Nurse', 'Receptionist'). |

## Table: `appointments`

Stores appointment information.

| Column             | Type        | Constraints                  | Description                                  |
|--------------------|-------------|------------------------------|----------------------------------------------|
| `id`               | `INTEGER`   | `PRIMARY KEY`                | Unique identifier for the appointment.       |
| `patient_id`       | `INTEGER`   | `FOREIGN KEY (patients.id)`  | The patient who booked the appointment.      |
| `doctor_id`        | `INTEGER`   | `FOREIGN KEY (doctors.id)`   | The doctor for the appointment.              |
| `appointment_time` | `TIMESTAMP` | `NOT NULL`                   | The date and time of the appointment.        |
| `status`           | `VARCHAR(20)`| `NOT NULL`                   | Status of the appointment (e.g., 'scheduled', 'completed', 'cancelled'). |
| `notes`            | `TEXT`      |                              | Any notes related to the appointment.        |

## Table: `medical_records`

Stores the medical history of patients.

| Column             | Type        | Constraints                  | Description                                  |
|--------------------|-------------|------------------------------|----------------------------------------------|
| `id`               | `INTEGER`   | `PRIMARY KEY`                | Unique identifier for the medical record.    |
| `patient_id`       | `INTEGER`   | `FOREIGN KEY (patients.id)`  | The patient to whom this record belongs.     |
| `doctor_id`        | `INTEGER`   | `FOREIGN KEY (doctors.id)`   | The doctor who created or updated the record.|
| `visit_date`       | `DATE`      | `NOT NULL`                   | The date of the patient's visit.             |
| `diagnosis`        | `TEXT`      | `NOT NULL`                   | The diagnosis from the visit.                |
| `treatment`        | `TEXT`      |                              | The treatment prescribed.                    |
| `notes`            | `TEXT`      |                              | Additional medical notes.                    |

## Table: `pharmacy_stock`

Stores information about the pharmacy's inventory.

| Column          | Type        | Constraints          | Description                                  |
|-----------------|-------------|----------------------|----------------------------------------------|
| `id`            | `INTEGER`   | `PRIMARY KEY`        | Unique identifier for the stock item.        |
| `medicine_name` | `VARCHAR(100)`| `UNIQUE`, `NOT NULL` | Name of the medicine.                        |
| `quantity`      | `INTEGER`   | `NOT NULL`           | The current quantity in stock.               |
| `unit_price`    | `DECIMAL(10, 2)`| `NOT NULL`       | Price per unit of the medicine.              |
| `last_updated`  | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | When the stock was last updated.       |

## Table: `prescriptions`

Stores prescription information linked to medical records.

| Column             | Type        | Constraints                       | Description                                  |
|--------------------|-------------|-----------------------------------|----------------------------------------------|
| `id`               | `INTEGER`   | `PRIMARY KEY`                     | Unique identifier for the prescription.      |
| `medical_record_id`| `INTEGER`   | `FOREIGN KEY (medical_records.id)`| Links to the `medical_records` table.      |
| `medicine_name`    | `VARCHAR(100)`| `NOT NULL`                        | Name of the prescribed medicine.             |
| `dosage`           | `VARCHAR(50)`|                                   | The dosage to be taken.                      |
| `frequency`        | `VARCHAR(50)`|                                   | How often the medicine should be taken.      |
| `duration`         | `VARCHAR(50)`|                                   | For how long the medicine should be taken.   |

## Table: `attendance`

Stores check-in and check-out times for staff.

| Column          | Type        | Constraints                | Description                                  |
|-----------------|-------------|----------------------------|----------------------------------------------|
| `id`            | `INTEGER`   | `PRIMARY KEY`              | Unique identifier for the attendance record. |
| `staff_id`      | `INTEGER`   | `FOREIGN KEY (staff.id)`   | The staff member.                            |
| `check_in_time` | `TIMESTAMP` | `NOT NULL`                 | The time the staff member checked in.        |
| `check_out_time`| `TIMESTAMP` |                            | The time the staff member checked out.       |
| `date`          | `DATE`      | `NOT NULL`                 | The date of the attendance.                  |
