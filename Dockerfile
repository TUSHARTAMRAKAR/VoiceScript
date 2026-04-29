# Dockerfile
# ---------------------------------------------------------
# This file tells Hugging Face HOW to build and run VoiceScript.
#
# Think of it like a recipe:
#   1. Start with a Python base
#   2. Install system tools (ffmpeg)
#   3. Install Python libraries
#   4. Copy our code
#   5. Start the server
#
# HF Spaces requires the app to run on port 7860
# ---------------------------------------------------------

FROM python:3.10-slim

# Install ffmpeg — needed by pydub for audio conversion
# apt-get is Linux's package manager (like pip but for system tools)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user (HF Spaces security requirement)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

# Set working directory inside the container
WORKDIR /app

# Copy requirements first (Docker caches this layer)
# If requirements don't change, it won't reinstall everything
COPY --chown=user requirements.txt requirements.txt

# Install Python libraries
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy all project files into the container
COPY --chown=user . /app

# Create uploads folder (needed by backend)
RUN mkdir -p /app/uploads

# Tell Docker this app uses port 7860 (HF Spaces requirement)
EXPOSE 7860

# Start the Flask server on port 7860
# 0.0.0.0 means "accept connections from anywhere" (required for HF)
CMD ["python", "backend/app.py"]
