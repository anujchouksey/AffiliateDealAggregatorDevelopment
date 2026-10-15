#!/usr/bin/env bash
# DealPulse Automated HTTPS & SSL Setup Script
# Developed by FidlogicItsolutions

set -e

echo "=========================================="
echo "🔒 DealPulse HTTPS & SSL Setup"
echo "=========================================="

DOMAIN="$1"

# If no domain passed as argument, prompt or default
if [ -z "$DOMAIN" ]; then
  echo ""
  echo "Please choose an option for HTTPS:"
  echo "1) I have a custom domain (e.g. deals.mydomain.com)"
  echo "2) I don't have a domain yet - use free DNS hostname (72-62-230-135.sslip.io)"
  echo "3) Self-signed SSL certificate directly on IP (https://72.62.230.135)"
  echo ""
  read -p "Select [1, 2, or 3] (Default: 2): " CHOICE
  CHOICE=${CHOICE:-2}

  if [ "$CHOICE" = "1" ]; then
    read -p "Enter your custom domain name: " DOMAIN
  elif [ "$CHOICE" = "2" ]; then
    DOMAIN="72-62-230-135.sslip.io"
  elif [ "$CHOICE" = "3" ]; then
    DOMAIN="72.62.230.135"
  else
    DOMAIN="72-62-230-135.sslip.io"
  fi
fi

echo ""
echo "🎯 Target Hostname/Domain: $DOMAIN"
echo ""

# 1. Install Nginx and Certbot if missing
echo "📦 Installing Nginx and Certbot..."
if command -v apt-get &> /dev/null; then
  sudo apt-get update -y
  sudo apt-get install -y nginx certbot python3-certbot-nginx openssl
elif command -v dnf &> /dev/null; then
  sudo dnf install -y nginx certbot python3-certbot-nginx openssl
elif command -v yum &> /dev/null; then
  sudo yum install -y epel-release
  sudo yum install -y nginx certbot python3-certbot-nginx openssl
fi

# 2. Stop any process on port 80/443 (e.g. PM2 serve) to avoid port conflict
if command -v pm2 &> /dev/null; then
  echo "🛑 Releasing port 80 from PM2..."
  sudo pm2 delete dealpulse 2>/dev/null || true
fi

# 3. Ensure production build exists
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "dist" ]; then
  echo "⚙️ Building production assets..."
  npm install
  npm run build
fi

# 4. Copy dist to /var/www/dealpulse
echo "📁 Deploying build to /var/www/dealpulse..."
sudo mkdir -p /var/www/dealpulse
sudo cp -r "$SCRIPT_DIR/dist/"* /var/www/dealpulse/
sudo chown -R www-data:www-data /var/www/dealpulse 2>/dev/null || sudo chown -R nginx:nginx /var/www/dealpulse 2>/dev/null || true
sudo chmod -R 755 /var/www/dealpulse

# 5. Handle Certificate Generation
if [ "$DOMAIN" = "72.62.230.135" ]; then
  echo "🔑 Generating self-signed SSL certificate for IP $DOMAIN..."
  sudo mkdir -p /etc/ssl/dealpulse
  sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/dealpulse/selfsigned.key \
    -out /etc/ssl/dealpulse/selfsigned.crt \
    -subj "/C=US/ST=State/L=City/O=DealPulse/CN=72.62.230.135"

  echo "⚙️ Configuring Nginx with self-signed SSL..."
  sudo bash -c "cat > /etc/nginx/conf.d/dealpulse.conf" <<EOF
server {
    listen 80;
    server_name 72.62.230.135;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name 72.62.230.135;

    ssl_certificate /etc/ssl/dealpulse/selfsigned.crt;
    ssl_certificate_key /etc/ssl/dealpulse/selfsigned.key;

    root /var/www/dealpulse;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

else
  echo "⚙️ Setting up initial Nginx configuration for Certbot verification..."
  sudo rm -f /etc/nginx/conf.d/dealpulse.conf /etc/nginx/sites-enabled/default 2>/dev/null || true
  
  sudo bash -c "cat > /etc/nginx/conf.d/dealpulse.conf" <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    root /var/www/dealpulse;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

  sudo nginx -t
  sudo systemctl restart nginx

  echo "🔒 Requesting official Let's Encrypt SSL certificate for $DOMAIN..."
  sudo certbot --nginx --non-interactive --agree-tos --redirect -m contact@fidlogic.com -d "$DOMAIN" || {
    echo "⚠️ Certbot challenge encountered an issue. Falling back to self-signed SSL..."
    sudo mkdir -p /etc/ssl/dealpulse
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/ssl/dealpulse/selfsigned.key \
      -out /etc/ssl/dealpulse/selfsigned.crt \
      -subj "/C=US/ST=State/L=City/O=DealPulse/CN=$DOMAIN"
      
    sudo bash -c "cat > /etc/nginx/conf.d/dealpulse.conf" <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate /etc/ssl/dealpulse/selfsigned.crt;
    ssl_certificate_key /etc/ssl/dealpulse/selfsigned.key;

    root /var/www/dealpulse;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
  }
fi

# 6. Test and reload Nginx
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo ""
echo "============================================================"
echo "🎉 HTTPS SETUP COMPLETE!"
echo "👉 Secure Storefront: https://$DOMAIN"
echo "👉 Secure Admin Portal: https://$DOMAIN/#admin"
echo "👉 Master Key: dealpulse-admin"
echo "============================================================"
