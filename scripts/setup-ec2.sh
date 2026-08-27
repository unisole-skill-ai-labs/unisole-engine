#!/bin/bash

# ===== EC2 Initial Setup Script =====
# Run this ONCE on a fresh EC2 Ubuntu instance
# Usage: bash setup-ec2.sh

set -e

echo "🚀 Starting EC2 Setup for Unisole..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin


# Install Docker Compose
echo "📝 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
sudo usermod -aG docker $(whoami)
newgrp docker

# Install Git
echo "📚 Installing Git..."
sudo apt-get install -y git

# Ensure host nginx does not conflict with Docker nginx on port 80
if systemctl is-active --quiet nginx; then
  echo "Stopping host Nginx so Docker Nginx can bind to port 80..."
  sudo systemctl stop nginx
  sudo systemctl disable nginx
fi

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/unisole
sudo chown -R $(whoami):$(whoami) /opt/unisole

# Clone repository
echo "📥 Cloning repository..."
cd /opt/unisole
git clone https://github.com/unisole-skill-ai-labs/unisole-engine.git .

# Create necessary directories
mkdir -p backups ssl

# Generate a strong password for database
DB_PASSWORD=$(openssl rand -base64 32)

# Create .env file with secure defaults
echo "🔐 Creating environment file..."
cat > .env << EOF
NODE_ENV=production
API_PORT=3000
API_BASE_URL=https://yourdomain.com
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DB_NAME=unisole
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY
RAZORPAY_WEBHOOK_SECRET=YOUR_RAZORPAY_WEBHOOK_SECRET
DOCKER_USERNAME=your_docker_username
EOF

echo "✅ EC2 setup completed!"
echo ""
echo "⚠️  IMPORTANT: Edit the following file and fill in your values:"
echo "   nano /opt/unisole/.env"
echo ""
echo "Then run: bash deploy.sh"
