#!/bin/bash

echo "Setting up ccusage..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Make CLI executable
chmod +x bin/ccusage.js

# Link globally (optional)
echo ""
echo "To install globally, run:"
echo "  npm link"
echo ""
echo "Or run directly with:"
echo "  node bin/ccusage.js"
echo ""
echo "Or use bunx (recommended):"
echo "  bunx ccusage"
echo ""
echo "Setup complete!"