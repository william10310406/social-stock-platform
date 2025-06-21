#!/usr/bin/env python3
"""
Socket.IO 專用啟動腳本
當 Gunicorn eventlet worker 啟動失敗時的備用方案
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app, socketio

# 導入環境配置模組
try:
    from scripts.script_env import ScriptEnvironment
except ImportError:
    # 當作為獨立腳本運行時的備用導入
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    from script_env import ScriptEnvironment

if __name__ == "__main__":
    # 初始化環境配置
    env = ScriptEnvironment()
    env.print_environment_info()

    config = env.env_config
    app = create_app()

    print("🚀 Socket.IO 伺服器啟動")
    print(f"   - 環境: {'Docker' if config['is_docker'] else 'Local'}")
    print(f"   - Host: {config['backend']['host']}:{config['backend']['port']}")
    print(f"   - Debug: {config['debug']}")
    print("   - 注意：這是備用啟動方案，推薦使用 Gunicorn eventlet worker")

    socketio.run(
        app,
        host=config["backend"]["host"],
        port=config["backend"]["port"],
        debug=config["debug"],
        use_reloader=False,
        log_output=True,
    )
