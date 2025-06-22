"""add stock price model and enhance stock

Revision ID: s123456789abc
Revises: f567e231c4f3
Create Date: 2025-06-22 01:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "s123456789abc"
down_revision = "f567e231c4f3"
branch_labels = None
depends_on = None


def upgrade():
    # 增強 stocks 表
    with op.batch_alter_table("stocks", schema=None) as batch_op:
        batch_op.add_column(sa.Column("market_type", sa.String(length=20), nullable=True))
        batch_op.add_column(
            sa.Column(
                "created_at",
                sa.DateTime(),
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
                nullable=True,
            )
        )
        batch_op.add_column(
            sa.Column(
                "updated_at",
                sa.DateTime(),
                server_default=sa.text("(CURRENT_TIMESTAMP)"),
                nullable=True,
            )
        )

    # 創建 stock_prices 表
    op.create_table(
        "stock_prices",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("stock_id", sa.Integer(), nullable=False),
        sa.Column("trade_date", sa.Date(), nullable=False),
        sa.Column("open_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("high_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("low_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("close_price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("change_amount", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("volume", sa.BigInteger(), nullable=True),
        sa.Column("turnover", sa.BigInteger(), nullable=True),
        sa.Column("transaction_count", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["stock_id"],
            ["stocks.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stock_id", "trade_date", name="uq_stock_date"),
    )

    # 創建索引以提高查詢性能
    with op.batch_alter_table("stock_prices", schema=None) as batch_op:
        batch_op.create_index("ix_stock_prices_stock_id", ["stock_id"], unique=False)
        batch_op.create_index("ix_stock_prices_trade_date", ["trade_date"], unique=False)


def downgrade():
    # 刪除 stock_prices 表
    op.drop_table("stock_prices")

    # 移除 stocks 表的新欄位
    with op.batch_alter_table("stocks", schema=None) as batch_op:
        batch_op.drop_column("updated_at")
        batch_op.drop_column("created_at")
        batch_op.drop_column("market_type")
