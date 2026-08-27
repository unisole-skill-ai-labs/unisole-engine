#!/bin/bash

# ===== EC2 Deployment Script =====
# Run this to deploy/update application on EC2
# Usage: bash deploy.sh

set -e

cd /opt/unisole

echo "🚀 Starting deployment..."

# Login to Docker Hub
echo "🔐 Logging into Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Pull latest code
echo "📥 Pulling latest code from production branch..."
git pull origin production

# Pull latest images
echo "🐳 Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Stop old containers
echo "⏹️  Stopping old containers..."
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo "🟢 Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose -f docker-compose.prod.yml ps

# Display logs
echo "📋 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=50

echo "✅ Deployment completed successfully!"
echo ""
echo "🌍 Services running at:"
echo "   API: http://your-ec2-ip:3000"
echo "   Admin: http://your-ec2-ip:5173"
echo "   LMS: http://your-ec2-ip:5174"
echo "   SEO: http://your-ec2-ip:5175"
