#!/usr/bin/env bash
# Deploy de admin-web al VPS.
# Uso: bash scripts/deploy.sh

set -e

VPS_HOST="${VPS_HOST:-root@tu-vps-ip}"
VPS_DIR="${VPS_DIR:-/opt/instelec/admin-web}"

echo "📦 Construyendo imagen..."
docker build -t admin-web:latest .

echo "🚀 Subiendo al VPS..."
docker save admin-web:latest | gzip | ssh "$VPS_HOST" "gunzip | docker load"

echo "🔄 Reiniciando servicio..."
ssh "$VPS_HOST" "cd $VPS_DIR && docker compose up -d"

echo "✅ Deploy completado"
echo "   URL: https://admin.instelec-electric.com"