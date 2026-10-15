#!/usr/bin/env bash
# DealPulse All-In-One Full Server Installer
# Developed by FidlogicItsolutions
# Compatible with Ubuntu 20.04/22.04/24.04, Debian 11/12, CentOS/RHEL/AlmaLinux

set -e

DOMAIN="${1:-72-62-230-135.sslip.io}"
APP_DIR="/var/www/dealpulse-app"
WEB_ROOT="/var/www/dealpulse"

echo "=========================================================="
echo "🚀 DealPulse All-in-One Automated Server Installation"
echo "🌐 Target Domain / Hostname: $DOMAIN"
echo "=========================================================="

# 1. Update OS & Install Core Dependencies (git, curl, build-essential, nginx, certbot, chromium)
echo "📦 [1/7] Updating OS and installing system packages..."
if command -v apt-get &> /dev/null; then
  export DEBIAN_FRONTEND=noninteractive
  sudo apt-get update -y
  sudo apt-get install -y git curl wget build-essential openssl nginx certbot python3-certbot-nginx ufw
  # Install Chromium if available
  sudo apt-get install -y chromium-browser 2>/dev/null || sudo apt-get install -y chromium 2>/dev/null || true
elif command -v dnf &> /dev/null; then
  sudo dnf update -y
  sudo dnf install -y git curl wget openssl nginx certbot python3-certbot-nginx
  sudo dnf install -y chromium 2>/dev/null || true
elif command -v yum &> /dev/null; then
  sudo yum update -y
  sudo yum install -y epel-release
  sudo yum install -y git curl wget openssl nginx certbot python3-certbot-nginx
fi

# 2. Install Node.js 20 LTS & NPM
echo "📦 [2/7] Checking Node.js runtime..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'.' -f1 | tr -d 'v') -lt 18 ]]; then
  echo "📥 Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  if command -v apt-get &> /dev/null; then
    sudo apt-get install -y nodejs
  elif command -v dnf &> /dev/null; then
    sudo dnf install -y nodejs
  elif command -v yum &> /dev/null; then
    sudo yum install -y nodejs
  fi
fi

echo "✅ Node.js: $(node -v) | NPM: $(npm -v)"

# 3. Stop conflicting services on port 80/443 (e.g. Apache or PM2)
echo "🛑 [3/7] Clearing conflicting processes on ports 80 & 443..."
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl disable apache2 2>/dev/null || true
if command -v pm2 &> /dev/null; then
  sudo pm2 delete dealpulse 2>/dev/null || true
fi

# 4. Clone or Pull Latest DealPulse Repository
echo "📂 [4/7] Fetching DealPulse source code..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  sudo git reset --hard
  sudo git pull origin main
else
  sudo rm -rf "$APP_DIR"
  sudo git clone https://github.com/anujchouksey/AffiliateDealAggregatorDevelopment.git "$APP_DIR"
  cd "$APP_DIR"
fi

# 5. Install NPM Packages & Build Production Assets
echo "⚙️  [5/7] Installing npm packages and compiling production bundle..."
sudo npm install --unsafe-perm=true
sudo npm run build

# 6. Copy Production Build to Web Root
echo "📁 [6/7] Deploying build to $WEB_ROOT..."
sudo mkdir -p "$WEB_ROOT"
sudo rm -rf "${WEB_ROOT:?}"/*
sudo cp -r "$APP_DIR/dist/"* "$WEB_ROOT/"
sudo chown -R www-data:www-data "$WEB_ROOT" 2>/dev/null || sudo chown -R nginx:nginx "$WEB_ROOT" 2>/dev/null || true
sudo chmod -R 755 "$WEB_ROOT"

# 7. Configure Nginx with SPA Routing & SSL / HTTPS
echo "🔒 [7/7] Configuring Nginx web server and SSL..."
sudo rm -f /etc/nginx/conf.d/dealpulse.conf /etc/nginx/sites-enabled/default 2>/dev/null || true

# Prepare self-signed certificate fallback
sudo mkdir -p /etc/ssl/dealpulse
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/dealpulse/dealpulse.key \
  -out /etc/ssl/dealpulse/dealpulse.crt \
  -subj "/C=US/ST=State/L=City/O=DealPulse/CN=$DOMAIN" 2>/dev/null

# Initial Nginx configuration
sudo bash -c "cat > /etc/nginx/conf.d/dealpulse.conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN 72.62.230.135 localhost;

    root $WEB_ROOT;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Restart Nginx with HTTP first
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# Attempt to acquire official Let's Encrypt SSL certificate
echo "🔐 Requesting Let's Encrypt certificate for $DOMAIN..."
if sudo certbot --nginx --non-interactive --agree-tos --redirect -m contact@fidlogic.com -d "$DOMAIN"; then
  echo "✅ Let's Encrypt SSL certificate successfully obtained and configured!"
else
  echo "⚠️ Let's Encrypt challenge skipped/failed. Enabling 2048-bit SSL fallback with HTTPS enabled..."
  sudo bash -c "cat > /etc/nginx/conf.d/dealpulse.conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN 72.62.230.135 localhost;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN 72.62.230.135 localhost;

    ssl_certificate /etc/ssl/dealpulse/dealpulse.crt;
    ssl_certificate_key /etc/ssl/dealpulse/dealpulse.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root $WEB_ROOT;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
  sudo nginx -t
  sudo systemctl restart nginx
fi

# Configure UFW firewall if active
if command -v ufw &> /dev/null && sudo ufw status | grep -q "Status: active"; then
  echo "🛡️ Configuring firewall rules for HTTP & HTTPS..."
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw reload
fi

echo ""
echo "=========================================================="
echo "🎉 DEALPULSE INSTALLATION COMPLETE & SECURED WITH HTTPS!"
echo "=========================================================="
echo "👉 Secure Storefront : https://$DOMAIN"
echo "👉 Direct IP Access  : https://72.62.230.135 (or http://72.62.230.135)"
echo "👉 Admin Portal      : https://$DOMAIN/#admin"
echo "👉 Admin Master Key  : dealpulse-admin"
echo "=========================================================="
