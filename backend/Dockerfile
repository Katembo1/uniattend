# syntax=docker/dockerfile:1

# Build a lightweight Python runtime for the Flask API
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System deps (add git/curl only if needed)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    ca-certificates \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install app dependencies first (better layer caching)
COPY requirements.txt ./
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install gunicorn

# Copy application source
COPY . .

# Expose Flask port
EXPOSE 5000

# Environment defaults (override in compose/CI)
ENV FLASK_ENV=production \
    PORT=5000

# Gunicorn entrypoint using the app factory via wsgi.py
CMD ["gunicorn", "-w", "3", "-k", "gthread", "-b", "0.0.0.0:5000", "wsgi:app"]
