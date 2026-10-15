#!/usr/bin/env bash
# DealPulse 1-Click Server Deployment Script for 72.62.230.135
# Developed by FidlogicItsolutions

set -e

echo "=========================================="
echo "🚀 Starting DealPulse Server Deployment..."
echo "=========================================="

# 1. Check & Install Node.js if missing
if ! command -v node &> /dev/null; then
  echo "📦 Node.js not detected. Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "✅ Node version: $(node -v)"
echo "✅ NPM version: $(npm -v)"

# 2. Install Project Dependencies
echo "📦 Installing npm dependencies..."
npm install

# 3. Build Production Bundle
echo "⚙️  Building production assets..."
npm run build

# 4. Install PM2 and serve globally if not present
if ! command -v pm2 &> /dev/null; then
  echo "📦 Installing PM2 and serve..."
  sudo npm install -g serve pm2
fi

# 5. Start/Restart DealPulse on Port 80
echo "🚀 Launching DealPulse 24/7 background process on port 80..."
sudo pm2 delete dealpulse 2>/dev/null || true
sudo pm2 serve dist 80 --spa --name "dealpulse"
sudo pm2 startup || true
sudo pm2 save

echo ""
echo "============================================================"
echo "🎉 SUCCESS! DealPulse is now LIVE at:"
echo "👉 http://72.62.230.135"
echo "👉 Admin Portal: http://72.62.230.135/#admin (Master Key: dealpulse-admin)"
echo "============================================================"
