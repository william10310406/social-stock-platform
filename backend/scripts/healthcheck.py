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


def check_database():
    """Check database connectivity"""
    try:
        database_url = os.environ.get("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL not configured")
            return False

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

        redis_url = os.environ.get("REDIS_URL", "redis://redis:6379/0")
        r = redis.from_url(redis_url)
        r.ping()

        print("✅ Redis connection OK")
        return True

    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False


def check_application(host="localhost", port=5000, timeout=10):
    """Check if the Flask application is responding"""
    try:
        url = f"http://{host}:{port}/api/health"
        response = requests.get(url, timeout=timeout)

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

    checks = [
        ("Database", check_database),
        ("Redis", check_redis),
        ("Migrations", check_migrations),
    ]

    # If we're checking from inside Docker, also check the application
    if len(sys.argv) > 1 and sys.argv[1] == "--docker":
        checks.append(("Application", lambda: check_application(host="localhost", port=5000)))

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
