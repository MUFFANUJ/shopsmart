#!/bin/bash
set -e

echo "========================================="
echo "  ShopSmart Development Setup"
echo "========================================="

# --------------------
# Check Node.js
# --------------------
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Installing..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update -y && sudo apt-get install -y nodejs npm
    elif command -v yum &> /dev/null; then
        sudo yum install -y nodejs
    elif command -v brew &> /dev/null; then
        brew install node
    else
        echo "❌ Cannot install Node.js automatically. Please install it manually."
        exit 1
    fi
fi
echo "✅ Node.js $(node -v) is available."

# --------------------
# Check npm
# --------------------
if ! command -v npm &> /dev/null; then
    echo "❌ npm not available. Please install npm."
    exit 1
fi
echo "✅ npm $(npm -v) is available."

# --------------------
# Client setup (idempotent)
# --------------------
if [ -d "client" ]; then
    echo ""
    echo "📦 Setting up client..."
    cd client

    # Install dependencies only if node_modules doesn't exist or package.json is newer
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo "   Installing client dependencies..."
        npm install
    else
        echo "   Client dependencies already up to date."
    fi

    cd ..
    echo "✅ Client setup complete."
fi

# --------------------
# Server setup (idempotent)
# --------------------
if [ -d "server" ]; then
    echo ""
    echo "📦 Setting up server..."
    cd server

    # Install dependencies only if node_modules doesn't exist or package.json is newer
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo "   Installing server dependencies..."
        npm install
    else
        echo "   Server dependencies already up to date."
    fi

    # Generate Prisma client (idempotent operation)
    echo "   Generating Prisma client..."
    npx prisma generate

    # Create/update database schema (idempotent - db push is safe to re-run)
    echo "   Pushing database schema..."
    npx prisma db push

    # Seed database only if no products exist
    echo "   Checking if database needs seeding..."
    npx prisma db seed 2>/dev/null || echo "   Seed skipped (may already be seeded)."

    cd ..
    echo "✅ Server setup complete."
fi

# --------------------
# Create necessary directories (idempotent with -p)
# --------------------
mkdir -p logs
mkdir -p tmp

echo ""
echo "========================================="
echo "  ✅ Setup completed successfully!"
echo "========================================="
echo ""
echo "  To start development:"
echo "    Server: cd server && npm run dev"
echo "    Client: cd client && npm run dev"
echo ""
exit 0
