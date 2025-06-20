# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install build dependencies for psycopg2 and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Copy the requirements file into the container at /app
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container
COPY ./ /app

# The command to run the application will be specified in docker-compose.yml

# The entrypoint script will handle waiting for the DB and running migrations
ENTRYPOINT ["/app/entrypoint.sh"]

# The command to run the application will be specified in docker-compose.yml
# But we can expose the port here
EXPOSE 5000 