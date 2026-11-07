#!/usr/bin/env bash
# OmniYield Protocol - One-Click Linux/VPS Launcher
set -e

echo "====================================================================="
echo "  🌟 OmniYield Protocol (GOSUN) - Linux/VPS One-Click Launcher"
echo "  Dual-Vault Matrix: NUSD (11.84%) + OmniUSDC All-Weather (16.40%)"
echo "====================================================================="

# Check node
if ! command -v node &> /dev/null; then
    echo "[Error] Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/4] Checking and building Safe Node..."
cd "$ROOT_DIR/omniyield-safe-node"
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run build

echo "[2/4] Checking Frontend dependencies..."
cd "$ROOT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    npm install
fi

echo "[3/4] Launching OmniSafe Sovereign Node (Port 4000)..."
cd "$ROOT_DIR/omniyield-safe-node"
nohup node dist/server.js > safe-node.log 2>&1 &
SAFE_PID=$!
echo "  ✔ Safe Node started in background (PID: $SAFE_PID, Log: safe-node.log)"

echo "[4/4] Launching Next.js Frontend (Port 3000)..."
cd "$ROOT_DIR/frontend"
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "  ✔ Frontend started in background (PID: $FRONTEND_PID, Log: frontend.log)"

echo ""
echo "====================================================================="
echo "  🎉 OmniYield Services are running in background!"
echo "  • Frontend:    http://localhost:3000"
echo "  • Safe Node:   http://localhost:4000"
echo "  • Health:      http://localhost:4000/health"
echo "====================================================================="

