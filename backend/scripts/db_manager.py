#!/usr/bin/env python3
"""
Database Management Script for Stock Insight Platform

This script provides comprehensive database management functionality including:
- Automated migrations
- Database backup and restore
- Health checks
- Data seeding for development

Usage:
    python db_manager.py migrate      # Run migrations
    python db_manager.py check        # Health check
    python db_manager.py backup       # Backup database
    python db_manager.py seed         # Seed development data
"""

import os
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

# Add the parent directory to sys.path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import create_app
from app.extensions import db
from app.models import Comment, Post, User
from flask import Flask
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError


class DatabaseManager:
    """Comprehensive database management utility"""

    def __init__(self):
        self.app = create_app()
        self.database_url = self.app.config["SQLALCHEMY_DATABASE_URI"]

    def check_connection(self, max_retries=30, retry_delay=2):
        """Check database connection with retries"""
        print("🔍 Checking database connection...")

        for attempt in range(1, max_retries + 1):
            try:
                engine = create_engine(self.database_url)
                with engine.connect() as connection:
                    result = connection.execute(text("SELECT 1"))
                    result.fetchone()
                print(f"✅ Database connection successful (attempt {attempt})")
                return True

            except OperationalError as e:
                if attempt < max_retries:
                    print(f"⏳ Database not ready (attempt {attempt}/{max_retries})")
                    time.sleep(retry_delay)
                else:
                    print(f"❌ Failed to connect after {max_retries} attempts: {e}")
                    return False

        return False

    def run_migrations(self):
        """Run database migrations"""
        print("📦 Running database migrations...")

        with self.app.app_context():
            try:
                # Check if migrations directory exists
                migrations_path = Path("migrations")
                if not migrations_path.exists():
                    print("⚠️ Migrations directory not found, initializing...")
                    subprocess.run(
                        ["flask", "db", "init"],
                        check=True,
                        env={**os.environ, "FLASK_APP": "run.py"},
                    )

                # Run upgrade
                print("🔄 Applying migrations...")
                subprocess.run(
                    ["flask", "db", "upgrade"],
                    check=True,
                    env={**os.environ, "FLASK_APP": "run.py"},
                )

                print("✅ Database migrations completed successfully")
                return True

            except subprocess.CalledProcessError as e:
                print(f"❌ Migration failed: {e}")
                return False
            except Exception as e:
                print(f"❌ Unexpected error during migration: {e}")
                return False

    def health_check(self):
        """Comprehensive database health check"""
        print("🏥 Running database health check...")

        with self.app.app_context():
            try:
                # Check connection
                if not self.check_connection(max_retries=3):
                    return False

                # Check tables exist
                print("📋 Checking database schema...")
                inspector = db.inspect(db.engine)
                tables = inspector.get_table_names()

                required_tables = [
                    "users",
                    "posts",
                    "comments",
                    "friendships",
                    "conversations",
                    "messages",
                ]
                missing_tables = [table for table in required_tables if table not in tables]

                if missing_tables:
                    print(f"⚠️ Missing tables: {missing_tables}")
                    print("💡 Consider running migrations: python db_manager.py migrate")
                else:
                    print("✅ All required tables present")

                # Check record counts
                print("📊 Database statistics:")
                with db.engine.connect() as conn:
                    for table in required_tables:
                        if table in tables:
                            result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                            count = result.scalar()
                            print(f"   {table}: {count} records")

                print("✅ Database health check completed")
                return True

            except Exception as e:
                print(f"❌ Health check failed: {e}")
                return False


def main():
    """Main CLI interface"""
    if len(sys.argv) < 2:
        print("Database Manager - Stock Insight Platform")
        print("Usage:")
        print("  python db_manager.py migrate      # Run migrations")
        print("  python db_manager.py check        # Health check")
        print("  python db_manager.py auto         # Full automated setup")
        return

    command = sys.argv[1].lower()
    db_manager = DatabaseManager()

    if command == "migrate":
        success = db_manager.run_migrations()
    elif command == "check":
        success = db_manager.health_check()
    elif command == "auto":
        print("🚀 Running automated database setup...")
        success = (
            db_manager.check_connection()
            and db_manager.run_migrations()
            and db_manager.health_check()
        )
        if success:
            print("✅ Automated database setup completed successfully")
        else:
            print("❌ Automated setup failed")
    else:
        print(f"❌ Unknown command: {command}")
        success = False

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
