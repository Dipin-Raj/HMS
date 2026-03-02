"""patient code signup support

Revision ID: 20260228_0005
Revises: 20260228_0004
Create Date: 2026-02-28 00:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260228_0005"
down_revision = "20260228_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("patients", sa.Column("patient_code", sa.String(length=20), nullable=True))
    op.execute("UPDATE patients SET patient_code = 'PID' || lpad(id::text, 5, '0') WHERE patient_code IS NULL")
    op.alter_column("patients", "patient_code", nullable=False)
    op.create_unique_constraint("uq_patients_patient_code", "patients", ["patient_code"])
    op.alter_column("patients", "user_id", existing_type=sa.Integer(), nullable=True)


def downgrade() -> None:
    op.alter_column("patients", "user_id", existing_type=sa.Integer(), nullable=False)
    op.drop_constraint("uq_patients_patient_code", "patients", type_="unique")
    op.drop_column("patients", "patient_code")
