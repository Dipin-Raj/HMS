"""timescale hypertables for event tables

Revision ID: 20260210_0002
Revises: 20260210_0001
Create Date: 2026-02-10 23:12:00.000000
"""

from alembic import op


# revision identifiers, used by Alembic.
revision = "20260210_0002"
down_revision = "20260210_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE appointment_events DROP CONSTRAINT IF EXISTS appointment_events_pkey")
    op.execute("ALTER TABLE appointment_events ADD PRIMARY KEY (id, event_time)")
    op.execute("ALTER TABLE attendance_events DROP CONSTRAINT IF EXISTS attendance_events_pkey")
    op.execute("ALTER TABLE attendance_events ADD PRIMARY KEY (id, event_time)")
    op.execute("ALTER TABLE inventory_events DROP CONSTRAINT IF EXISTS inventory_events_pkey")
    op.execute("ALTER TABLE inventory_events ADD PRIMARY KEY (id, event_time)")
    op.execute("ALTER TABLE patient_vitals DROP CONSTRAINT IF EXISTS patient_vitals_pkey")
    op.execute("ALTER TABLE patient_vitals ADD PRIMARY KEY (id, recorded_at)")

    op.execute("CREATE EXTENSION IF NOT EXISTS timescaledb")
    op.execute(
        "SELECT create_hypertable('appointment_events', 'event_time', if_not_exists => TRUE)"
    )
    op.execute(
        "SELECT create_hypertable('attendance_events', 'event_time', if_not_exists => TRUE)"
    )
    op.execute(
        "SELECT create_hypertable('inventory_events', 'event_time', if_not_exists => TRUE)"
    )
    op.execute(
        "SELECT create_hypertable('patient_vitals', 'recorded_at', if_not_exists => TRUE)"
    )


def downgrade() -> None:
    # Non-reversible without data loss; leave as no-op.
    pass
