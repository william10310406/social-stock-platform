#!/bin/sh

set -e

echo "🚀 Stock Insight Platform - Starting Backend Service"
echo "=================================================="

# Function to check if database is ready
check_database() {
    echo "🔍 Checking database connection..."
    python -c "
import os
import time
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

max_retries = 30
retry_count = 0
database_url = os.environ.get('DATABASE_URL')

if not database_url:
    print('❌ DATABASE_URL not set')
    exit(1)

while retry_count < max_retries:
    try:
        engine = create_engine(database_url)
        connection = engine.connect()
        connection.close()
        print('✅ Database connection successful')
        break
    except OperationalError as e:
        retry_count += 1
        print(f'⏳ Database not ready (attempt {retry_count}/{max_retries})')
        time.sleep(2)

if retry_count == max_retries:
    print('❌ Failed to connect to database after maximum retries')
    exit(1)
"
}

# Function to run database migrations
run_migrations() {
    echo "📦 Running database migrations..."

    # Set the FLASK_APP environment variable
    export FLASK_APP=run.py

    # Check if migration directory exists
    if [ ! -d "/app/migrations" ]; then
        echo "⚠️ No migrations directory found, initializing..."
        flask db init
    fi

    # Create migration if needed (dev mode only)
    if [ "$FLASK_ENV" = "development" ]; then
        echo "🔧 Development mode: Checking for model changes..."
        flask db migrate -m "Auto-migration on startup" || echo "ℹ️ No new migrations needed"
    fi

    # Apply migrations
    echo "🔄 Applying database migrations..."
    flask db upgrade || {
        echo "❌ Database migration failed"
        exit 1
    }

    echo "✅ Database migrations completed successfully"
}

# Function to validate application
validate_app() {
    echo "🧪 Validating application configuration..."
    python -c "
from run import create_app
try:
    app = create_app()
    with app.app_context():
        print('✅ Application configuration is valid')
except Exception as e:
    print(f'❌ Application validation failed: {e}')
    exit(1)
"
}

# Main startup sequence
main() {
    # Step 1: Check database connection
    check_database

    # Step 2: Run migrations
    run_migrations

    # Step 3: Validate application
    validate_app

    # Step 4: Test SocketIO configuration
    echo "🧪 Testing SocketIO configuration..."
    python tests/test_socketio.py
    if [ $? -ne 0 ]; then
        echo "❌ SocketIO configuration test failed"
        exit 1
    fi

    # Step 5: Start the application
    echo "🚀 Starting application with SocketIO support..."

    # Try Gunicorn with eventlet worker first
    echo "   - Attempting Gunicorn + eventlet worker..."

    # Test if gunicorn eventlet worker works
    timeout 10s gunicorn \
        --bind 0.0.0.0:5000 \
        --worker-class eventlet \
        --workers 1 \
        --worker-connections 1000 \
        --timeout 30 \
        --preload \
        --check-config \
        "run:create_app()" > /tmp/gunicorn_test.log 2>&1

    if [ $? -eq 0 ]; then
        echo "✅ Gunicorn eventlet worker supported"
        echo "   - Worker: 1 (required for SocketIO + Eventlet)"
        echo "   - Worker class: eventlet"
        echo "   - Binding: 0.0.0.0:5000"
        echo "=================================================="

        exec gunicorn \
            --bind 0.0.0.0:5000 \
            --worker-class eventlet \
            --workers 1 \
            --worker-connections 1000 \
            --timeout 120 \
            --keep-alive 5 \
            --access-logfile - \
            --error-logfile - \
            --log-level info \
            "run:create_app()"
    else
        echo "⚠️ Gunicorn eventlet worker failed, using Flask-SocketIO built-in server"
        echo "   - Server: Flask-SocketIO + eventlet"
        echo "   - Binding: 0.0.0.0:5000"
        echo "=================================================="

        exec python scripts/run_socketio.py
    fi
}

# Run main function
main
