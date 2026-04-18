#!/bin/bash
echo "1. Stopping any running node processes to release file locks..."
pkill -f node || true
# Wait for processes to actually stop
sleep 2

echo "2. Cleaning up npm cache..."
npm cache clean --force

echo "3. Removing existing node_modules and lock file..."
# Try to remove node_modules, ignore if not found
rm -rf node_modules
rm -f package-lock.json

echo "4. Installing production dependencies..."
# Use --no-audit to speed up and avoid lock file issues
npm install --production --no-audit

echo "Done! You can now start your server."
