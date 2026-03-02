"""doctor/staff status fields and events

Revision ID: 20260210_0003
Revises: 20260210_0002
Create Date: 2026-02-10 23:40:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "20260210_0003"
down_revision = "20260210_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS current_status VARCHAR(30) NOT NULL DEFAULT 'off-duty'")
    op.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS status_note VARCHAR(255)")
    op.execute("ALTER TABLE doctors ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT now()")

    op.execute("ALTER TABLE staff ADD COLUMN IF NOT EXISTS current_status VARCHAR(30) NOT NULL DEFAULT 'off-duty'")
    op.execute("ALTER TABLE staff ADD COLUMN IF NOT EXISTS status_note VARCHAR(255)")
    op.execute("ALTER TABLE staff ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT now()")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS doctor_status_events (
            id SERIAL NOT NULL,
            doctor_id INTEGER NOT NULL REFERENCES doctors (id),
            event_type VARCHAR(50) NOT NULL,
            event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
            payload JSON,
            PRIMARY KEY (id, event_time)
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_doctor_status_events_time ON doctor_status_events (event_time)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_doctor_status_events_doctor ON doctor_status_events (doctor_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_doctor_status_events_type ON doctor_status_events (event_type)")

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS staff_status_events (
            id SERIAL NOT NULL,
            staff_id INTEGER NOT NULL REFERENCES staff (id),
            event_type VARCHAR(50) NOT NULL,
            event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
            payload JSON,
            PRIMARY KEY (id, event_time)
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_staff_status_events_time ON staff_status_events (event_time)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_staff_status_events_staff ON staff_status_events (staff_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_staff_status_events_type ON staff_status_events (event_type)")

    op.execute("SELECT create_hypertable('doctor_status_events', 'event_time', if_not_exists => TRUE)")
    op.execute("SELECT create_hypertable('staff_status_events', 'event_time', if_not_exists => TRUE)")


def downgrade() -> None:
    op.drop_index("ix_staff_status_events_type", table_name="staff_status_events")
    op.drop_index("ix_staff_status_events_staff", table_name="staff_status_events")
    op.drop_index("ix_staff_status_events_time", table_name="staff_status_events")
    op.drop_table("staff_status_events")

    op.drop_index("ix_doctor_status_events_type", table_name="doctor_status_events")
    op.drop_index("ix_doctor_status_events_doctor", table_name="doctor_status_events")
    op.drop_index("ix_doctor_status_events_time", table_name="doctor_status_events")
    op.drop_table("doctor_status_events")

    op.drop_column("staff", "status_updated_at")
    op.drop_column("staff", "status_note")
    op.drop_column("staff", "current_status")

    op.drop_column("doctors", "status_updated_at")
    op.drop_column("doctors", "status_note")
    op.drop_column("doctors", "current_status")
