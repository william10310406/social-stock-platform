#!/usr/bin/env python3
"""
使用 Flask-SocketIO 內建伺服器啟動應用
"""

import os

from app import create_app
from app.extensions import socketio


def main():
    print("🚀 Flask-SocketIO 內建伺服器啟動...")
    print("   - Host: 0.0.0.0:5000")
    print("   - Async Mode: eventlet")

    app = create_app()

    socketio.run(app, host="0.0.0.0", port=5000, debug=False, use_reloader=False, log_output=True)


if __name__ == "__main__":
    main()
