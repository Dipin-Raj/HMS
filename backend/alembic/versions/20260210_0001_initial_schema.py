"""initial schema

Revision ID: 20260210_0001
Revises: 
Create Date: 2026-02-10 23:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260210_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_unique_constraint("uq_users_username", "users", ["username"])
    op.create_unique_constraint("uq_users_email", "users", ["email"])

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("first_name", sa.String(length=50), nullable=False),
        sa.Column("last_name", sa.String(length=50), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("gender", sa.String(length=10), nullable=True),
        sa.Column("phone_number", sa.String(length=20), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
    )
    op.create_unique_constraint("uq_patients_user_id", "patients", ["user_id"])

    op.create_table(
        "doctors",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("first_name", sa.String(length=50), nullable=False),
        sa.Column("last_name", sa.String(length=50), nullable=False),
        sa.Column("specialization", sa.String(length=100), nullable=False),
        sa.Column("phone_number", sa.String(length=20), nullable=True),
    )
    op.create_unique_constraint("uq_doctors_user_id", "doctors", ["user_id"])

    op.create_table(
        "staff",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("first_name", sa.String(length=50), nullable=False),
        sa.Column("last_name", sa.String(length=50), nullable=False),
        sa.Column("job_title", sa.String(length=100), nullable=False),
    )
    op.create_unique_constraint("uq_staff_user_id", "staff", ["user_id"])

    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("doctor_id", sa.Integer(), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("appointment_time", sa.DateTime(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_appointments_patient_id", "appointments", ["patient_id"])
    op.create_index("ix_appointments_doctor_id", "appointments", ["doctor_id"])
    op.create_index("ix_appointments_appointment_time", "appointments", ["appointment_time"])
    op.create_index("ix_appointments_status", "appointments", ["status"])

    op.create_table(
        "medical_records",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("doctor_id", sa.Integer(), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("visit_date", sa.Date(), nullable=False),
        sa.Column("diagnosis", sa.Text(), nullable=False),
        sa.Column("treatment", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
    )
    op.create_index("ix_medical_records_patient_id", "medical_records", ["patient_id"])
    op.create_index("ix_medical_records_doctor_id", "medical_records", ["doctor_id"])
    op.create_index("ix_medical_records_visit_date", "medical_records", ["visit_date"])

    op.create_table(
        "pharmacy_stock",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("medicine_name", sa.String(length=100), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("last_updated", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_unique_constraint("uq_pharmacy_stock_medicine_name", "pharmacy_stock", ["medicine_name"])

    op.create_table(
        "prescriptions",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("medical_record_id", sa.Integer(), sa.ForeignKey("medical_records.id"), nullable=False),
        sa.Column("medicine_name", sa.String(length=100), nullable=False),
        sa.Column("dosage", sa.String(length=50), nullable=True),
        sa.Column("frequency", sa.String(length=50), nullable=True),
        sa.Column("duration", sa.String(length=50), nullable=True),
    )
    op.create_index("ix_prescriptions_medical_record_id", "prescriptions", ["medical_record_id"])

    op.create_table(
        "attendance",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("staff_id", sa.Integer(), sa.ForeignKey("staff.id"), nullable=False),
        sa.Column("check_in_time", sa.DateTime(), nullable=False),
        sa.Column("check_out_time", sa.DateTime(), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
    )
    op.create_index("ix_attendance_staff_id", "attendance", ["staff_id"])
    op.create_index("ix_attendance_date", "attendance", ["date"])

    op.create_table(
        "appointment_events",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("appointment_id", sa.Integer(), sa.ForeignKey("appointments.id"), nullable=False),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("doctor_id", sa.Integer(), sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("event_time", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
    )
    op.create_index("ix_appointment_events_time", "appointment_events", ["event_time"])
    op.create_index("ix_appointment_events_patient", "appointment_events", ["patient_id"])
    op.create_index("ix_appointment_events_doctor", "appointment_events", ["doctor_id"])
    op.create_index("ix_appointment_events_type", "appointment_events", ["event_type"])

    op.create_table(
        "attendance_events",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("staff_id", sa.Integer(), sa.ForeignKey("staff.id"), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("event_time", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
    )
    op.create_index("ix_attendance_events_time", "attendance_events", ["event_time"])
    op.create_index("ix_attendance_events_staff", "attendance_events", ["staff_id"])
    op.create_index("ix_attendance_events_type", "attendance_events", ["event_type"])

    op.create_table(
        "inventory_events",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("stock_id", sa.Integer(), sa.ForeignKey("pharmacy_stock.id"), nullable=False),
        sa.Column("medicine_name", sa.String(length=100), nullable=False),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("quantity_delta", sa.Integer(), nullable=False),
        sa.Column("event_time", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
    )
    op.create_index("ix_inventory_events_time", "inventory_events", ["event_time"])
    op.create_index("ix_inventory_events_stock", "inventory_events", ["stock_id"])
    op.create_index("ix_inventory_events_medicine", "inventory_events", ["medicine_name"])
    op.create_index("ix_inventory_events_type", "inventory_events", ["event_type"])

    op.create_table(
        "patient_vitals",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("patient_id", sa.Integer(), sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("vital_type", sa.String(length=50), nullable=False),
        sa.Column("value", sa.String(length=50), nullable=False),
        sa.Column("unit", sa.String(length=20), nullable=True),
        sa.Column("source", sa.String(length=50), nullable=True),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("payload", sa.JSON(), nullable=True),
    )
    op.create_index("ix_patient_vitals_time", "patient_vitals", ["recorded_at"])
    op.create_index("ix_patient_vitals_patient", "patient_vitals", ["patient_id"])
    op.create_index("ix_patient_vitals_type", "patient_vitals", ["vital_type"])


def downgrade() -> None:
    op.drop_index("ix_patient_vitals_type", table_name="patient_vitals")
    op.drop_index("ix_patient_vitals_patient", table_name="patient_vitals")
    op.drop_index("ix_patient_vitals_time", table_name="patient_vitals")
    op.drop_table("patient_vitals")

    op.drop_index("ix_inventory_events_type", table_name="inventory_events")
    op.drop_index("ix_inventory_events_medicine", table_name="inventory_events")
    op.drop_index("ix_inventory_events_stock", table_name="inventory_events")
    op.drop_index("ix_inventory_events_time", table_name="inventory_events")
    op.drop_table("inventory_events")

    op.drop_index("ix_attendance_events_type", table_name="attendance_events")
    op.drop_index("ix_attendance_events_staff", table_name="attendance_events")
    op.drop_index("ix_attendance_events_time", table_name="attendance_events")
    op.drop_table("attendance_events")

    op.drop_index("ix_appointment_events_type", table_name="appointment_events")
    op.drop_index("ix_appointment_events_doctor", table_name="appointment_events")
    op.drop_index("ix_appointment_events_patient", table_name="appointment_events")
    op.drop_index("ix_appointment_events_time", table_name="appointment_events")
    op.drop_table("appointment_events")

    op.drop_index("ix_attendance_date", table_name="attendance")
    op.drop_index("ix_attendance_staff_id", table_name="attendance")
    op.drop_table("attendance")

    op.drop_index("ix_prescriptions_medical_record_id", table_name="prescriptions")
    op.drop_table("prescriptions")

    op.drop_constraint("uq_pharmacy_stock_medicine_name", "pharmacy_stock", type_="unique")
    op.drop_table("pharmacy_stock")

    op.drop_index("ix_medical_records_visit_date", table_name="medical_records")
    op.drop_index("ix_medical_records_doctor_id", table_name="medical_records")
    op.drop_index("ix_medical_records_patient_id", table_name="medical_records")
    op.drop_table("medical_records")

    op.drop_index("ix_appointments_status", table_name="appointments")
    op.drop_index("ix_appointments_appointment_time", table_name="appointments")
    op.drop_index("ix_appointments_doctor_id", table_name="appointments")
    op.drop_index("ix_appointments_patient_id", table_name="appointments")
    op.drop_table("appointments")

    op.drop_constraint("uq_staff_user_id", "staff", type_="unique")
    op.drop_table("staff")

    op.drop_constraint("uq_doctors_user_id", "doctors", type_="unique")
    op.drop_table("doctors")

    op.drop_constraint("uq_patients_user_id", "patients", type_="unique")
    op.drop_table("patients")

    op.drop_constraint("uq_users_email", "users", type_="unique")
    op.drop_constraint("uq_users_username", "users", type_="unique")
    op.drop_table("users")
