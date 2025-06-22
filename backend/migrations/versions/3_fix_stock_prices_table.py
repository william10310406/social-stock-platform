"""Fix stock_prices table structure

Revision ID: 003_stock_prices_fix
Revises: 002_datetime_fix
Create Date: 2025-06-22 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003_stock_prices_fix'
down_revision = '002_datetime_fix'
branch_labels = None
depends_on = None


def upgrade():
    # 刪除舊的 stock_prices 表並重新創建
    op.drop_table('stock_prices')
    
    # 重新創建 stock_prices 表，符合 StockPrice 模型定義
    op.create_table('stock_prices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stock_id', sa.Integer(), nullable=False),
        sa.Column('trade_date', sa.Date(), nullable=False),
        # 價格資訊
        sa.Column('open_price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('high_price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('low_price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('close_price', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('change_amount', sa.Numeric(precision=10, scale=2), nullable=True),
        # 交易資訊
        sa.Column('volume', sa.BigInteger(), nullable=True),
        sa.Column('turnover', sa.BigInteger(), nullable=True),
        sa.Column('transaction_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('GETDATE()')),
        sa.ForeignKeyConstraint(['stock_id'], ['stocks.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stock_id', 'trade_date', name='uq_stock_date')
    )
    
    # 修復 posts 表：重命名 user_id 為 author_id，timestamp 為 created_at
    with op.batch_alter_table('posts', schema=None) as batch_op:
        # 重命名欄位
        batch_op.alter_column('user_id', new_column_name='author_id')
        batch_op.alter_column('timestamp', new_column_name='created_at')
    
    # 修復 comments 表：重命名 user_id 為 author_id，timestamp 為 created_at
    with op.batch_alter_table('comments', schema=None) as batch_op:
        batch_op.alter_column('user_id', new_column_name='author_id')
        batch_op.alter_column('timestamp', new_column_name='created_at')
    
    # 修復 likes 表：重命名 timestamp 為 created_at (但沒有在模型中使用 created_at)
    # likes 表保持原樣，因為模型中沒有 created_at 欄位
    
    # 修復 messages 表：重命名 timestamp 為 created_at
    with op.batch_alter_table('messages', schema=None) as batch_op:
        batch_op.alter_column('timestamp', new_column_name='created_at')
        batch_op.alter_column('read', new_column_name='is_read')


def downgrade():
    # 回復到舊的 stock_prices 表結構
    op.drop_table('stock_prices')
    
    op.create_table('stock_prices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('stock_id', sa.Integer(), nullable=False),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('volume', sa.BigInteger(), nullable=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('GETDATE()')),
        sa.ForeignKeyConstraint(['stock_id'], ['stocks.id'], ),
        sa.PrimaryKeyConstraint('id')
    ) 