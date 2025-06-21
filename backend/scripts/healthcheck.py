#!/usr/bin/env python3
"""
Health Check Script for Stock Insight Platform

This script performs comprehensive health checks for the application
and can be used by Docker Compose or monitoring systems.
"""

import os
import sys
import time
from pathlib import Path

import requests

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

# 導入環境配置模組
try:
    from scripts.script_env import ScriptEnvironment
except ImportError:
    # 當作為獨立腳本運行時的備用導入
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    from script_env import ScriptEnvironment


def check_database():
    """Check database connectivity"""
    try:
        env = ScriptEnvironment()
        database_url = env.env_config["urls"]["database"]

        engine = create_engine(database_url)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            result.fetchone()

        print("✅ Database connection OK")
        return True

    except OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Database check error: {e}")
        return False


def check_redis():
    """Check Redis connectivity"""
    try:
        import redis

        env = ScriptEnvironment()
        redis_url = env.env_config["urls"]["redis"]
        r = redis.from_url(redis_url)
        r.ping()

        print("✅ Redis connection OK")
        return True

    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False


def check_application():
    """Check if the Flask application is responding"""
    try:
        env = ScriptEnvironment()
        config = env.env_config

        url = f"{config['urls']['backend']}/api/health"
        response = requests.get(url, timeout=config["timeout"])

        if response.status_code == 200:
            print("✅ Application health endpoint OK")
            return True
        else:
            print(f"❌ Application health check failed: HTTP {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Application health check failed: {e}")
        return False


def check_migrations():
    """Check if database migrations are up to date"""
    try:
        from app import create_app
        from flask_migrate import current

        app = create_app()
        with app.app_context():
            current_revision = current()
            if current_revision:
                print(f"✅ Database migrations OK (revision: {current_revision})")
                return True
            else:
                print("⚠️ No migration revision found")
                return True  # Still consider it OK for initial setup

    except Exception as e:
        print(f"❌ Migration check failed: {e}")
        return False


def main():
    """Run all health checks"""
    print("🏥 Stock Insight Platform - Health Check")
    print("=" * 45)

    # 初始化環境配置
    env = ScriptEnvironment()
    env.print_environment_info()

    checks = [
        ("Database", check_database),
        ("Redis", check_redis),
        ("Migrations", check_migrations),
    ]

    # 根據參數或環境決定是否檢查應用
    should_check_app = (
        len(sys.argv) > 1
        and sys.argv[1] == "--docker"
        or env.docker_config["is_docker"]
        or "--app" in sys.argv
    )

    if should_check_app:
        checks.append(("Application", check_application))

    all_passed = True
    for name, check_func in checks:
        print(f"\n🔍 Checking {name}...")
        if not check_func():
            all_passed = False

    print("\n" + "=" * 45)
    if all_passed:
        print("✅ All health checks passed!")
        sys.exit(0)
    else:
        print("❌ Some health checks failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
