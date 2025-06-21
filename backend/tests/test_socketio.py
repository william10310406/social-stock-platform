#!/usr/bin/env python3
"""
測試 Flask-SocketIO 配置是否正確
"""

import os
import sys

sys.path.append("/app")

from app import create_app
from app.extensions import socketio


def test_socketio_config():
    """測試 SocketIO 配置"""
    print("🔧 測試 Flask-SocketIO 配置...")

    try:
        # 創建應用
        app = create_app()

        print(f"✅ Flask 應用創建成功")
        print(f"📡 SocketIO async_mode: {socketio.async_mode}")
        print(f"🔌 SocketIO server: {type(socketio.server).__name__}")

        # 檢查 eventlet 是否可用
        try:
            import eventlet

            print(f"✅ Eventlet 版本: {eventlet.__version__}")
        except ImportError:
            print("❌ Eventlet 未安裝")
            return False

        # 檢查是否可以初始化 eventlet server
        try:
            with app.app_context():
                print("✅ 應用上下文正常")

        except Exception as e:
            print(f"❌ 應用上下文錯誤: {e}")
            return False

        print("🎉 所有測試通過！")
        return True

    except Exception as e:
        print(f"❌ 測試失敗: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    test_socketio_config()
