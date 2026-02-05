#!/bin/bash

echo "Starting development setup..."

# --------------------
# Check Node.js
# --------------------

node -v >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Node.js not found. Installing..."
    sudo yum install -y nodejs

    node -v >/dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo "Node.js installation failed."
        exit 1
    fi
fi

echo "Node.js is available."

# --------------------
# Check npm
# --------------------

npm -v >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "npm not available."
    exit 1
fi

echo "npm is available."

# --------------------
# Client setup
# --------------------

if [ -d client ]; then
    cd client || exit 1

    if [ ! -d node_modules ]; then
        echo "Installing client dependencies..."
        npm install
    fi

    cd ..
fi

# --------------------
# Server setup
# --------------------

if [ -d server ]; then
    cd server || exit 1

    if [ ! -d node_modules ]; then
        echo "Installing server dependencies..."
        npm install
    fi

    cd ..
fi

echo "Setup completed successfully."
exit 0
