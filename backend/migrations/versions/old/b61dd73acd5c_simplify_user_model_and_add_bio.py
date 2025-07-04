"""Simplify User model and add bio

Revision ID: b61dd73acd5c
Revises: ed79d6970b29
Create Date: 2025-06-20 05:51:26.753229

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "b61dd73acd5c"
down_revision = "ed79d6970b29"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("bio", sa.Text(), nullable=True))
        batch_op.drop_column("phone_enc")
        batch_op.drop_column("layer")
        batch_op.drop_column("status")
        batch_op.drop_column("name")
        batch_op.drop_column("nid_enc")
        batch_op.drop_column("birthday")

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("birthday", sa.DATE(), autoincrement=False, nullable=True))
        batch_op.add_column(
            sa.Column("nid_enc", postgresql.BYTEA(), autoincrement=False, nullable=True)
        )
        batch_op.add_column(
            sa.Column("name", sa.VARCHAR(length=100), autoincrement=False, nullable=True)
        )
        batch_op.add_column(sa.Column("status", sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.add_column(sa.Column("layer", sa.INTEGER(), autoincrement=False, nullable=True))
        batch_op.add_column(
            sa.Column("phone_enc", postgresql.BYTEA(), autoincrement=False, nullable=True)
        )
        batch_op.drop_column("bio")

    # ### end Alembic commands ###
