"""admin email settings table

Revision ID: 20260228_0006
Revises: 20260228_0005
Create Date: 2026-02-28 02:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260228_0006"
down_revision = "20260228_0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS admin_email_settings (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL UNIQUE REFERENCES users (id),
            smtp_host VARCHAR(255) NOT NULL,
            smtp_port INTEGER NOT NULL DEFAULT 587,
            smtp_username VARCHAR(255) NOT NULL,
            smtp_password_encrypted VARCHAR(1024) NOT NULL,
            from_email VARCHAR(255) NOT NULL,
            from_name VARCHAR(255) NOT NULL DEFAULT 'HMS-AI',
            use_tls BOOLEAN NOT NULL DEFAULT true,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_admin_email_settings_user_id ON admin_email_settings (user_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_admin_email_settings_user_id")
    op.execute("DROP TABLE IF EXISTS admin_email_settings")
