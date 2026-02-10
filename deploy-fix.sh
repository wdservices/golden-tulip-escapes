#!/bin/bash
echo "Stopping any running node processes (optional, ignore errors)..."
pkill -f node || true

echo "Cleaning up npm cache and existing modules..."
npm cache clean --force
rm -rf node_modules
rm -f package-lock.json

echo "Installing production dependencies..."
npm install --production

echo "Done! You can now start your server with: node server.js"
