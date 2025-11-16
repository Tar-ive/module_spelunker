# Dockerfile for PyGuard Terminal Backend
FROM python:3.14-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy PyGuard CLI from bug-detector
COPY bug-detector /app/bug-detector

# Copy backend Python files
COPY backend/*.py /app/

# Expose port (Heroku sets this dynamically via $PORT)
EXPOSE $PORT

# Run server
CMD uvicorn server:app --host 0.0.0.0 --port $PORT
