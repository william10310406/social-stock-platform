"""Fix datetime defaults

Revision ID: 002_datetime_fix
Revises: 001_initial
Create Date: 2025-06-22 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_datetime_fix'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade():
    # 修復 users 表的 datetime 預設值
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('created_at', server_default=sa.text('GETDATE()'))
        batch_op.alter_column('updated_at', server_default=sa.text('GETDATE()'))
    
    # 修復 stocks 表的 datetime 預設值  
    with op.batch_alter_table('stocks', schema=None) as batch_op:
        batch_op.alter_column('created_at', server_default=sa.text('GETDATE()'))
        batch_op.alter_column('updated_at', server_default=sa.text('GETDATE()'))
    
    # 修復 user_stocks 表的 datetime 預設值
    with op.batch_alter_table('user_stocks', schema=None) as batch_op:
        batch_op.alter_column('created_at', server_default=sa.text('GETDATE()'))
    
    # 修復 stock_prices 表的 datetime 預設值
    with op.batch_alter_table('stock_prices', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=sa.text('GETDATE()'))
    
    # 修復 posts 表的 datetime 預設值
    with op.batch_alter_table('posts', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=sa.text('GETDATE()'))
    
    # 修復 comments 表的 datetime 預設值
    with op.batch_alter_table('comments', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=sa.text('GETDATE()'))
    
    # 修復 likes 表的 datetime 預設值
    with op.batch_alter_table('likes', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=sa.text('GETDATE()'))
    
    # 修復 friendships 表的 datetime 預設值
    with op.batch_alter_table('friendships', schema=None) as batch_op:
        batch_op.alter_column('created_at', server_default=sa.text('GETDATE()'))
        batch_op.alter_column('updated_at', server_default=sa.text('GETDATE()'))
    
    # 修復 conversations 表的 datetime 預設值
    with op.batch_alter_table('conversations', schema=None) as batch_op:
        batch_op.alter_column('created_at', server_default=sa.text('GETDATE()'))
        batch_op.alter_column('updated_at', server_default=sa.text('GETDATE()'))
    
    # 修復 messages 表的 datetime 預設值
    with op.batch_alter_table('messages', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=sa.text('GETDATE()'))
    
    # 修復 news 表的 datetime 預設值
    with op.batch_alter_table('news', schema=None) as batch_op:
        batch_op.alter_column('created_at', server_default=sa.text('GETDATE()'))


def downgrade():
    # 移除所有預設值
    with op.batch_alter_table('news', schema=None) as batch_op:
        batch_op.alter_column('created_at', server_default=None)
    
    with op.batch_alter_table('messages', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=None)
    
    with op.batch_alter_table('conversations', schema=None) as batch_op:
        batch_op.alter_column('updated_at', server_default=None)
        batch_op.alter_column('created_at', server_default=None)
    
    with op.batch_alter_table('friendships', schema=None) as batch_op:
        batch_op.alter_column('updated_at', server_default=None)
        batch_op.alter_column('created_at', server_default=None)
    
    with op.batch_alter_table('likes', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=None)
    
    with op.batch_alter_table('comments', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=None)
    
    with op.batch_alter_table('posts', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=None)
    
    with op.batch_alter_table('stock_prices', schema=None) as batch_op:
        batch_op.alter_column('timestamp', server_default=None)
    
    with op.batch_alter_table('user_stocks', schema=None) as batch_op:
        batch_op.alter_column('created_at', server_default=None)
    
    with op.batch_alter_table('stocks', schema=None) as batch_op:
        batch_op.alter_column('updated_at', server_default=None)
        batch_op.alter_column('created_at', server_default=None)
    
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('updated_at', server_default=None)
        batch_op.alter_column('created_at', server_default=None) 