#!/bin/sh

set -e

# Wait for the database to be ready
if [ "$DATABASE_URL" ]; then
    /app/wait-for-it.sh db 5432 -- echo "Database is ready!"
fi

# Set the FLASK_APP environment variable for the flask command
export FLASK_APP=run.py

# Run database migrations
echo "Running database migrations..."
flask db upgrade

# Start the application
echo "Starting application with Gunicorn..."
exec gunicorn --bind 0.0.0.0:5000 --workers 4 --threads 2 --access-logfile - "run:create_app()" 