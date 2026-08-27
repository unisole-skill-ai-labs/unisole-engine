#!/bin/bash

# ===== EC2 Deployment Script =====
# Run this to deploy/update application on EC2
# Usage: bash deploy.sh

set -e

cd /opt/unisole

echo "🚀 Starting deployment..."

# Load environment variables if .env exists
if [ -f .env ]; then
  echo "📄 Loading environment from .env..."
  set -a
  source .env
  set +a
fi

# Detect docker compose command (docker compose plugin vs docker-compose binary)
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
else
  COMPOSE_CMD="docker-compose"
fi

# Login to Docker Hub (if credentials provided)
if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
  echo "🔐 Logging into Docker Hub..."
  echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
else
  echo "ℹ️  Skipping Docker login (DOCKER_PASSWORD not provided in environment)"
fi

# Pull latest code
echo "📥 Pulling latest code..."
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
git pull origin "$CURRENT_BRANCH" || true

# Pull latest images
echo "🐳 Pulling latest Docker images..."
$COMPOSE_CMD -f docker-compose.prod.yml pull

# Stop old containers
echo "⏹️  Stopping old containers..."
$COMPOSE_CMD -f docker-compose.prod.yml down

# Start new containers
echo "🟢 Starting containers..."
$COMPOSE_CMD -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
$COMPOSE_CMD -f docker-compose.prod.yml ps

# Display logs
echo "📋 Recent logs:"
$COMPOSE_CMD -f docker-compose.prod.yml logs --tail=50

echo "✅ Backend deployment completed successfully!"
echo ""
echo "🌍 Backend API running at:"
echo "   API (Direct): http://your-ec2-ip:3000"
echo "   API (Nginx):  http://your-ec2-ip/"

