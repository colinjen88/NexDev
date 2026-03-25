FROM python:3.12-slim

# Install system dependencies (e.g. for building asyncpg/others if needed)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install standard tools
RUN pip install --no-cache-dir hatchling uv

COPY pyproject.toml ./

# Create dummy app folder for initial build if needed format
RUN mkdir app && touch app/__init__.py

RUN uv pip install --system -e .

COPY . .

# Assume it will be run via compose uvicorn command
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
