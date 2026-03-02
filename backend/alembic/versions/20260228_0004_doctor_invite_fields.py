"""doctor invite and password setup fields

Revision ID: 20260228_0004
Revises: 20260210_0003
Create Date: 2026-02-28 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20260228_0004"
down_revision = "20260210_0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("is_password_set", sa.Boolean(), nullable=False, server_default=sa.text("true")))
    op.add_column("users", sa.Column("invite_token_hash", sa.String(length=64), nullable=True))
    op.add_column("users", sa.Column("invite_token_expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("users", sa.Column("invite_sent_at", sa.DateTime(timezone=True), nullable=True))
    op.create_index("ix_users_invite_token_hash", "users", ["invite_token_hash"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_users_invite_token_hash", table_name="users")
    op.drop_column("users", "invite_sent_at")
    op.drop_column("users", "invite_token_expires_at")
    op.drop_column("users", "invite_token_hash")
    op.drop_column("users", "is_password_set")
